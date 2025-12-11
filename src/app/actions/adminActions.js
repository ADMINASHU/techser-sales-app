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

export async function verifyUser(userId) {
    try {
        await checkAdmin();
        await dbConnect();
        await User.findByIdAndUpdate(userId, { status: "verified" });
        revalidatePath("/users");
        return { success: true };
    } catch (error) {
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
