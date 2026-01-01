"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Location from "@/models/Location";
import SystemSetting from "@/models/SystemSetting";
import { revalidatePath } from "next/cache";

export async function getLiveSyncStatus() {
    try {
        await dbConnect();
        const setting = await SystemSetting.findOne({ key: "liveSync" });
        // Default to true if not set
        return setting ? setting.value : true;
    } catch (error) {
        console.error("Get Live Sync Status Error", error);
        return true; // Default to on in case of error
    }
}

export async function toggleLiveSync() {
    try {
        await checkAdmin();
        await dbConnect();

        const currentStatus = await getLiveSyncStatus();
        const newStatus = !currentStatus;

        await SystemSetting.findOneAndUpdate(
            { key: "liveSync" },
            { value: newStatus },
            { upsert: true, new: true }
        );

        revalidatePath("/settings");
        return { success: true, enabled: newStatus };
    } catch (error) {
        console.error("Toggle Live Sync Error", error);
        return { error: "Failed to toggle setting" };
    }
}

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

