"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    const { contactNumber, address, region, branch } = Object.fromEntries(formData);

    if (!contactNumber || !address || !region || !branch) {
        return { error: "All fields are required" };
    }

    try {
        await dbConnect();
        await User.findByIdAndUpdate(session.user.id, {
            contactNumber,
            address,
            region,
            branch,
            // Status remains pending here, or we can check logic. Requirement: "Verification... contingent ... by admin".
            // So updating profile doesn't auto-verify.
        });

        revalidatePath("/profile");
        revalidatePath("/setup");

        return { success: true };
    } catch (error) {
        console.error("Profile Update Error", error);
        return { error: "Failed to update profile" };
    }
}
