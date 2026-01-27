"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import mongoose from "mongoose";
import { serializeMongoList } from "@/lib/formatters";

import Entry from "@/models/Entry";

export async function getAdminCustomerAnalytics({
  filters = {},
  skip = 0,
  limit = 30,
}) {
  const session = await auth();
  if (!session) {
    return { customers: [], hasMore: false };
  }

  const isAdmin = session.user.role === "admin";
  const isSuperUser = session.user.role === "super_user";

  // Enforce restriction for non-admins
  if (!isAdmin && !isSuperUser) {
    // Force specific filters for non-admins
    filters.userId = session.user.id;
    filters.region = "all";
    filters.branch = "all";
  } else if (isSuperUser) {
    // Super User must be fixed to their region
    filters.region = session.user.region;
  }

  try {
    await dbConnect();
    const { region, branch, month, year, userId, search } = filters;

    // 1. Build Entry Match Query FIRST (Filters the TIME RANGE for stats)
    // We do this first to identify WHICH customers are active in this period
    const entryMatch = {};

    if (year && year !== "all") {
      const y = parseInt(year);
      let start, end;
      if (month && month !== "all") {
        const m = parseInt(month);
        start = new Date(y, m, 1);
        end = new Date(y, m + 1, 0, 23, 59, 59);
      } else {
        start = new Date(y, 0, 1);
        end = new Date(y, 11, 31, 23, 59, 59);
      }
      entryMatch.entryDate = { $gte: start, $lte: end };
    }

    // NEW: Get IDs of customers who actually have visits in this range
    // This allows us to filter out "0 visit" customers efficiently BEFORE pagination
    const activeCustomerIds = await Entry.distinct("customerId", entryMatch);

    // 2. Build Customer Match Query (Filters the LIST of customers)
    const customerMatch = {
      _id: { $in: activeCustomerIds }, // Only include customers with visits
    };

    if (region && region !== "all") {
      customerMatch.region = region;
    }

    if (branch && branch !== "all") {
      customerMatch.branch = branch;
    }

    // Filter by the User who CREATED the customer
    if (userId && userId !== "all") {
      customerMatch.userId = new mongoose.Types.ObjectId(userId);
    }

    if (search) {
      customerMatch.$or = [
        { name: { $regex: search, $options: "i" } },
        { customerAddress: { $regex: search, $options: "i" } },
      ];
    }

    // 3. Aggregation Pipeline
    const pipeline = [
      // Match Customers first
      { $match: customerMatch },
      // Sort by name for consistent pagination
      { $sort: { name: 1, _id: 1 } },
      // Apply Pagination
      { $skip: skip },
      { $limit: limit },
      // Lookup Entries for these customers to calculate stats
      {
        $lookup: {
          from: "entries",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                ...entryMatch,
                // We count all visits, but duration usually implies 'Completed' or valid timestamps
              },
            },
            {
              $project: {
                duration: {
                  $cond: {
                    if: { $and: ["$stampIn.time", "$stampOut.time"] },
                    then: {
                      $subtract: ["$stampOut.time", "$stampIn.time"],
                    },
                    else: 0,
                  },
                },
              },
            },
          ],
          as: "stats",
        },
      },
      // Calculate totals
      {
        $addFields: {
          visitCount: { $size: "$stats" },
          totalDuration: { $sum: "$stats.duration" },
        },
      },
      // Cleanup
      { $project: { stats: 0 } },
    ];

    const customers = await Customer.aggregate(pipeline);

    // Check if there are more
    const totalMatching = await Customer.countDocuments(customerMatch);
    const hasMore = skip + customers.length < totalMatching;

    return {
      customers: serializeMongoList(customers),
      hasMore,
    };
  } catch (error) {
    console.error("Admin Customer Analytics Error:", error);
    return { customers: [], hasMore: false };
  }
}

export async function getCustomerVisitDetails({ customerId, filters = {} }) {
  const session = await auth();
  if (!session) {
    return { visits: [] };
  }

  const isAdmin = session.user.role === "admin";
  const isSuperUser = session.user.role === "super_user";

  try {
    await dbConnect();
    const { month, year } = filters;

    // Build Entry Match Query (Same as analytics)
    const entryMatch = { customerId: new mongoose.Types.ObjectId(customerId) };

    // RESTRICTION: If not admin or super_user, only show visits by this user
    if (!isAdmin && !isSuperUser) {
      entryMatch.userId = new mongoose.Types.ObjectId(session.user.id);
    }

    if (year && year !== "all") {
      const y = parseInt(year);
      let start, end;
      if (month && month !== "all") {
        const m = parseInt(month);
        start = new Date(y, m, 1);
        end = new Date(y, m + 1, 0, 23, 59, 59);
      } else {
        start = new Date(y, 0, 1);
        end = new Date(y, 11, 31, 23, 59, 59);
      }
      entryMatch.entryDate = { $gte: start, $lte: end };
    }

    const visits = await Entry.aggregate([
      { $match: entryMatch },
      { $sort: { entryDate: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          entryDate: 1,
          user: 1,
          stampInTime: "$stampIn.time",
          stampOutTime: "$stampOut.time",
          duration: {
            $cond: {
              if: { $and: ["$stampIn.time", "$stampOut.time"] },
              then: { $subtract: ["$stampOut.time", "$stampIn.time"] },
              else: 0,
            },
          },
        },
      },
    ]);

    return { visits: serializeMongoList(visits) };
  } catch (error) {
    console.error("Get Customer Visit Details Error:", error);
    return { visits: [] };
  }
}
