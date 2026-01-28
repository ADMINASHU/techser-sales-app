"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import Customer from "@/models/Customer";
import { revalidatePath, unstable_cache, revalidateTag } from "next/cache";

export async function deleteEntry(entryId) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  // RESTRICTION: Admins cannot delete entries (as per "user only" request)
  if (session.user.role === "admin") {
    return { error: "Admins are not allowed to delete entries." };
  }

  try {
    await dbConnect();

    // Optional: Ensure the user actually owns the entry being deleted
    const entry = await Entry.findById(entryId);
    if (!entry) return { error: "Entry not found" };

    if (entry.userId.toString() !== session.user.id) {
      return { error: "You are not authorized to delete this entry" };
    }

    // Decrement customer entry count
    if (entry.customerId) {
      await Customer.findByIdAndUpdate(entry.customerId, {
        $inc: { entryCount: -1 },
      });
    }

    await Entry.findByIdAndDelete(entryId);
    revalidateTag("entries"); // Invalidate cache
    revalidatePath("/entries");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete" };
  }
}

export async function updateEntryComment(entryId, comment) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  // RESTRICTION: Only non-admin users can add comments
  if (session.user.role === "admin") {
    return { error: "Admins are not allowed to add comments." };
  }

  try {
    await dbConnect();

    // Ensure the user owns the entry
    const entry = await Entry.findById(entryId);
    if (!entry) return { error: "Entry not found" };

    if (entry.userId.toString() !== session.user.id) {
      return { error: "You are not authorized to update this entry" };
    }

    // Update the entry with the new comment
    await Entry.findByIdAndUpdate(entryId, { comment: comment || "" });

    revalidateTag("entries"); // Invalidate cache
    revalidatePath("/entries");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update comment" };
  }
}

// Direct Data Fetcher (Bypassing Cache for now to fix consistency issues)
const getEntriesInternal = async (userId, role, filters, skip, limit) => {
  await dbConnect();

  const query = {};

  const isCoreAdmin = role === "admin" || role === "super_user";
  // 1. Role-based Base Query
  if (isCoreAdmin) {
    if (filters.user && filters.user !== "all") {
      query.userId = filters.user;
    }
  } else {
    query.userId = userId;
  }

  // 2. Date Filter
  if (filters.year && filters.year !== "all") {
    const year = parseInt(filters.year);
    if (!isNaN(year)) {
      let startDate, endDate;
      if (filters.month && filters.month !== "all") {
        const month = parseInt(filters.month);
        if (!isNaN(month)) {
          startDate = new Date(year, month, 1);
          endDate = new Date(year, month + 1, 0, 23, 59, 59);
        }
      } else {
        // Entire Year
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31, 23, 59, 59);
      }

      if (startDate && endDate) {
        query.entryDate = {
          $gte: startDate,
          $lte: endDate,
        };
      }
    }
  }

  // 3. Status Filter
  if (filters.status && filters.status !== "all") {
    query.status = filters.status;
  }

  // 4. Search Filter
  if (filters.search) {
    const searchRegex = { $regex: filters.search, $options: "i" };
    query.$or = [
      { customerName: searchRegex },
      { customerAddress: searchRegex },
    ];
  }

  // 5. Region & Branch Filters (Optimized with denormalized fields)
  if (filters.region && filters.region !== "all") {
    query.userRegion = filters.region;
  }
  if (filters.branch && filters.branch !== "all") {
    query.userBranch = filters.branch;
  }

  // Fetch Entries
  const entries = await Entry.find(query)
    .sort({ entryDate: -1 }) // Sort by Entry Date
    .skip(skip)
    .limit(limit)
    .select(
      "customerName entryDate status createdAt updatedAt userId customerId stampIn stampOut googleSheetRowId comment",
    )
    .populate(
      "userId",
      "name email region branch role designation image status contactNumber address",
    )
    .populate(
      "customerId",
      "name customerAddress contactPerson contactNumber location",
    ) // Populate specific customer details
    .lean();

  // Serialize
  const serializedEntries = entries.map((entry) => ({
    ...entry,
    _id: entry._id.toString(),
    userId: entry.userId
      ? {
          ...entry.userId,
          _id: entry.userId._id.toString(),
        }
      : null,
    customerId: entry.customerId
      ? {
          ...entry.customerId,
          _id: entry.customerId._id.toString(),
        }
      : null,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    entryDate: entry.entryDate ? new Date(entry.entryDate).toISOString() : null,
    // Ensure any other serialized fields needed
  }));

  return {
    entries: serializedEntries,
    hasMore: entries.length === limit,
  };
};

export async function fetchEntries({
  page = 1,
  limit = 30,
  filters = {},
  skip: customSkip,
}) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    // Use customSkip if provided, otherwise calculate from page/limit
    const skip = customSkip !== undefined ? customSkip : (page - 1) * limit;

    // For Super User, always restrict by region
    if (session.user.role === "super_user") {
      filters.region = session.user.region;
    }

    // We pass primitive values to the cached function to ensure strict key generation
    return await getEntriesInternal(
      session.user.id,
      session.user.role,
      filters,
      skip,
      limit,
    );
  } catch (error) {
    console.error("Fetch Entries Error:", error);
    throw new Error("Failed to fetch entries");
  }
}
