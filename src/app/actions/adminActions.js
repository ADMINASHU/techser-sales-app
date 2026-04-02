"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { serializeMongoList } from "@/lib/formatters";

async function checkAdmin() {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "admin" && session.user.role !== "super_user")
  ) {
    throw new Error("Unauthorized");
  }
  return session;
}

import { sendNotificationToUsers } from "@/lib/fcmNotification";

// Helper for notifications to regional supervisors
async function notifySupervisors(action, targetUser, adminName) {
  try {
    // 1. Try to find Super Users in the same region first
    let recipients = await User.find({
      role: "super_user",
      region: targetUser.region,
    })
      .select("_id")
      .lean();

    let recipientIds = recipients.map((r) => r._id.toString());
    let titlePrefix = "Regional Update";

    // 2. Fallback to Regional Administrators
    if (recipientIds.length === 0) {
      recipients = await User.find({
        role: "admin",
        region: targetUser.region,
      })
        .select("_id")
        .lean();
      recipientIds = recipients.map((r) => r._id.toString());
    }

    // 3. Final Fallback to all Administrators
    if (recipientIds.length === 0) {
      recipients = await User.find({ role: "admin" }).select("_id").lean();
      recipientIds = recipients.map((r) => r._id.toString());
      titlePrefix = "User Management";
    }

    if (recipientIds.length > 0) {
      await sendNotificationToUsers({
        userIds: recipientIds,
        notification: {
          title: `${titlePrefix}: ${action}`,
          body: `User ${targetUser.name} ${action} by ${adminName}`,
        },
        data: {
          link: "/users",
        },
      });
    }
  } catch (error) {
    console.error("Failed to send supervisor notification:", error);
  }
}

export async function verifyUser(userId) {
  try {
    const adminSession = await checkAdmin();
    await dbConnect();

    // Atomically update ONLY if not already verified
    // This prevents race conditions where parallel requests both see "pending"
    const user = await User.findOneAndUpdate(
      { _id: userId, status: { $ne: "verified" } },
      { status: "verified" },
      { new: true },
    );

    // If no user found or user was already verified, user will be null
    if (!user) {
      // console.log(`[Verify] User ${userId} already verified or not found. Skipping notification.`);
      return { success: true };
    }

    revalidatePath("/users");

    // Notify User
    await sendNotificationToUsers({
      userIds: [userId],
      notification: {
        title: "Account Verified",
        body: `Your account has been verified by ${adminSession.user.name || "Admin"}`,
      },
      data: {
        type: "user-verified",
      },
    });

    // Notify Supervisors
    notifySupervisors("Verified", user, adminSession.user.name).catch((err) =>
      console.error("[Notify] Supervisor alert failed:", err),
    );

    return { success: true };
  } catch (error) {
    console.error("Verify User Error", error);
    return { error: "Failed to verify user" };
  }
}

export async function declineUser(userId) {
  try {
    const adminSession = await checkAdmin();
    await dbConnect();
    const user = await User.findByIdAndUpdate(
      userId,
      { status: "declined" },
      { new: true },
    );
    revalidatePath("/users");

    // Notify User
    await sendNotificationToUsers({
      userIds: [userId],
      notification: {
        title: "Account Declined",
        body: `Your account verification was declined by ${adminSession.user.name || "Admin"}`,
      },
      data: {
        type: "user-declined",
      },
    });

    // Notify Supervisors
    notifySupervisors("Declined", user, adminSession.user.name).catch((err) =>
      console.error("[Notify] Supervisor alert failed:", err),
    );

    return { success: true };
  } catch (error) {
    console.error("Decline User Error", error);
    return { error: "Failed to decline user" };
  }
}

export async function deleteUser(userId) {
  try {
    const adminSession = await checkAdmin();
    if (adminSession.user.role !== "admin") {
      return { error: "Only full administrators can delete users." };
    }
    await dbConnect();

    const user = await User.findById(userId);
    if (!user) return { error: "User not found" };

    // Notify User BEFORE deleting from DB
    await sendNotificationToUsers({
      userIds: [userId],
      notification: {
        title: "Account Removed",
        body: `Your account has been removed by ${
          adminSession.user.name || "Admin"
        }`,
      },
      data: {
        type: "user-deleted",
      },
    });

    await User.findByIdAndDelete(userId);
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Delete User Error", error);
    return { error: "Failed to delete user" };
  }
}

export async function updateUserRole(userId, newRole) {
  try {
    const adminSession = await checkAdmin();
    await dbConnect();

    if (!["user", "admin", "super_user"].includes(newRole)) {
      return { error: "Invalid role" };
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true },
    );
    revalidatePath("/users");

    // Notify User about role change
    await sendNotificationToUsers({
      userIds: [userId],
      notification: {
        title: "Role Updated",
        body: `Your role has been updated to ${newRole} by ${adminSession.user.name || "Admin"}`,
      },
      data: {
        type: "user-role-updated",
      },
    });

    // Notify Supervisors
    notifySupervisors(
      `Role Changed to ${newRole}`,
      user,
      adminSession.user.name,
    ).catch((err) => console.error("[Notify] Supervisor alert failed:", err));

    return { success: true };
  } catch (error) {
    return { error: "Failed to update role" };
  }
}

export async function getUsers({
  page = 1,
  limit = 10,
  search = "",
  region = "",
  branch = "",
}) {
  try {
    await checkAdmin();
    await dbConnect();

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const session = await auth();
    const isSuperUser = session?.user?.role === "super_user";

    if (isSuperUser) {
      query.region = session.user.region;
    } else if (region && region !== "all") {
      query.region = region;
    }

    if (branch && branch !== "all") query.branch = branch;

    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("-password -fcmTokens -resetToken")
        .sort({ role: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);
    const totalPages = Math.ceil(totalUsers / limit);

    return {
      users: serializeMongoList(users),
      totalPages,
      currentPage: page,
      totalUsers,
    };
  } catch (error) {
    return { error: "Failed to fetch users", users: [], totalPages: 0 };
  }
}
