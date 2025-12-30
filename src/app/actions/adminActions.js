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

import { triggerNotification } from "@/lib/knock";

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
            console.log(`[Verify] User ${userId} already verified or not found. Skipping notification.`);
            return { success: true };
        }
        
        revalidatePath("/users");

        // Notify User
        await triggerNotification("user-verified", {
            actor: { id: adminSession.user.id, name: adminSession.user.name || "Admin", email: adminSession.user.email },
            recipients: [{ id: userId, name: user.name, email: user.email }],
            data: {
                name: user.name,
                admin_name: adminSession.user.name || "Admin",
            },
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
        await triggerNotification("user-declined", {
            actor: { id: adminSession.user.id, name: adminSession.user.name || "Admin", email: adminSession.user.email },
            recipients: [{ id: userId, name: user.name, email: user.email }],
            data: {
                name: user.name,
                admin_name: adminSession.user.name || "Admin",
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Decline User Error", error);
        return { error: "Failed to decline user" };
    }
}

export async function deleteUser(userId) {
    try {
        await checkAdmin();
        await dbConnect();
        await User.findByIdAndDelete(userId);
        revalidatePath("/users");
        return { success: true };
    } catch (error) {
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
        await triggerNotification("user-role-updated", {
            actor: { id: adminSession.user.id, name: adminSession.user.name || "Admin", email: adminSession.user.email },
            recipients: [{ id: userId, name: user.name, email: user.email }],
            data: {
                name: user.name,
                new_role: newRole,
                admin_name: adminSession.user.name || "Admin",
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Update Role Error", error);
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

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); // Use lean for better performance and plain objects

        const totalUsers = await User.countDocuments(query);
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
        console.error("Get Users Error", error);
        return { error: "Failed to fetch users", users: [], totalPages: 0 };
    }
}
