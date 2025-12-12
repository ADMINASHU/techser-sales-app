"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Location from "@/models/Location";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }
    return session;
}

export async function getLocations() {
    try {
        await dbConnect();
        const locations = await Location.find({}).sort({ name: 1 });
        return JSON.parse(JSON.stringify(locations));
    } catch (error) {
        console.error("Get Locations Error", error);
        return [];
    }
}

export async function addRegion(name) {
    try {
        await checkAdmin();
        await dbConnect();

        if (!name || !name.trim()) return { error: "Invalid name" };

        await Location.create({ name: name.trim() });
        revalidatePath("/admin/settings");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
         if (error.code === 11000) return { error: "Region already exists" };
        return { error: "Failed to add region" };
    }
}

export async function removeRegion(id) {
    try {
        await checkAdmin();
        await dbConnect();
        await Location.findByIdAndDelete(id);
        revalidatePath("/admin/settings");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        return { error: "Failed to remove region" };
    }
}

export async function addBranch(regionId, branchName) {
    try {
        await checkAdmin();
        await dbConnect();

        if (!branchName || !branchName.trim()) return { error: "Invalid branch name" };

        await Location.findByIdAndUpdate(regionId, {
            $addToSet: { branches: branchName.trim() }
        });
        
        revalidatePath("/admin/settings");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        return { error: "Failed to add branch" };
    }
}

export async function removeBranch(regionId, branchName) {
    try {
        await checkAdmin();
        await dbConnect();

        await Location.findByIdAndUpdate(regionId, {
            $pull: { branches: branchName }
        });
        
        revalidatePath("/admin/settings");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        return { error: "Failed to remove branch" };
    }
}

