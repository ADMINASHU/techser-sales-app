"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }
    return session;
}

import { sendNotificationToUsers } from "@/lib/fcmNotification";

export async function verifyUser(userId) {
    try {
        const adminSession = await checkAdmin();
        await dbConnect();

        // Atomically update ONLY if not already verified
        // This prevents race conditions where parallel requests both see "pending"
        const user = await User.findOneAndUpdate(
            { _id: userId, status: { $ne: "verified" } },
            { status: "verified" },
            { new: true }
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
                body: `Your account has been verified by ${adminSession.user.name || "Admin"}`
            },
            data: {
                type: "user-verified"
            }
        });

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
        const user = await User.findByIdAndUpdate(userId, { status: "declined" }, { new: true });
        revalidatePath("/users");

        // Notify User
        await sendNotificationToUsers({
            userIds: [userId],
            notification: {
                title: "Account Declined",
                body: `Your account verification was declined by ${adminSession.user.name || "Admin"}`
            },
            data: {
                type: "user-declined"
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Decline User Error", error);
        return { error: "Failed to decline user" };
    }
}

export async function deleteUser(userId) {
    try {
        const adminSession = await checkAdmin();
        await dbConnect();

        const user = await User.findById(userId);
        if (!user) return { error: "User not found" };

        // Notify User BEFORE deleting from DB
        await sendNotificationToUsers({
            userIds: [userId],
            notification: {
                title: "Account Removed",
                body: `Your account has been removed by ${adminSession.user.name || "Admin"}`
            },
            data: {
                type: "user-deleted"
            }
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

        if (!["user", "admin"].includes(newRole)) {
            return { error: "Invalid role" };
        }

        const user = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true });
        revalidatePath("/users");

        // Notify User about role change
        await sendNotificationToUsers({
            userIds: [userId],
            notification: {
                title: "Role Updated",
                body: `Your role has been updated to ${newRole} by ${adminSession.user.name || "Admin"}`
            },
            data: {
                type: "user-role-updated"
            }
        });

        return { success: true };
    } catch (error) {

        return { error: "Failed to update role" };
    }
}

export async function getUsers({ page = 1, limit = 10, search = "", region = "", branch = "" }) {
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

        if (region && region !== "all") query.region = region;
        if (branch && branch !== "all") query.branch = branch;

        const skip = (page - 1) * limit;

        const [users, totalUsers] = await Promise.all([
            User.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query)
        ]);
        const totalPages = Math.ceil(totalUsers / limit);

        // Convert _id and dates to string to be passed to client components
        const sanitizedUsers = users.map(user => ({
            ...user,
            _id: user._id.toString(),
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        }));

        return {
            users: sanitizedUsers,
            totalPages,
            currentPage: page,
            totalUsers
        };
    } catch (error) {
        return { error: "Failed to fetch users", users: [], totalPages: 0 };
    }
}
