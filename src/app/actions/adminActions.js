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

import { Knock } from "@knocklabs/node";

export async function verifyUser(userId) {
    try {
        const session = await checkAdmin();
        await dbConnect();
        const user = await User.findByIdAndUpdate(userId, { status: "verified" });
        revalidatePath("/users");

        // Notify User
        const secretKey = process.env.KNOCK_SECRET_API_KEY;
        if (secretKey) {
             try {
                const knock = new Knock({ apiKey: secretKey.trim() });
                
                // Helper to identify user via raw API
                const identifyUserRaw = async (uid, traits) => {
                    try {
                        const response = await fetch(`https://api.knock.app/v1/users/${uid}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${secretKey.trim()}`
                            },
                            body: JSON.stringify(traits)
                        });
                        if (!response.ok) console.error(`Failed to identify user ${uid}`, await response.text());
                    } catch (e) { console.error("Network error identifying user", e); }
                };

                // Identify Admin (Actor)
                await identifyUserRaw(session.user.id, {
                    name: session.user.name || "Admin",
                    email: session.user.email,
                });

                // Identify User (Recipient)
                await identifyUserRaw(userId, {
                    name: user.name,
                    email: user.email,
                });

                await knock.workflows.trigger("user-verified", {
                    actor: session.user.id,
                    recipients: [userId],
                    data: {
                        name: user.name,
                        admin_name: session.user.name || "Admin",
                    },
                });
             } catch (knockError) {
                 console.error("Knock verification notification failed", knockError);
             }
        }

        return { success: true };
    } catch (error) {
        console.error("Verify User Error", error);
        return { error: "Failed to verify user" };
    }
}

export async function declineUser(userId) {
    try {
        await checkAdmin();
        await dbConnect();
        await User.findByIdAndUpdate(userId, { status: "declined" });
        revalidatePath("/users");
        return { success: true };
    } catch (error) {
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
        await checkAdmin();
        await dbConnect();

        if (!["user", "admin"].includes(newRole)) {
            return { error: "Invalid role" };
        }

        await User.findByIdAndUpdate(userId, { role: newRole });
        revalidatePath("/users");
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
