"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

import { Knock } from "@knocklabs/node";

// const knock = process.env.KNOCK_SECRET_API_KEY ? new Knock(process.env.KNOCK_SECRET_API_KEY) : null;

import bcrypt from "bcryptjs";
import { triggerNotification } from "@/lib/knock";

// ... existing code ...

export async function updateProfile(formData) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    const { contactNumber, address, region, branch, designation } = Object.fromEntries(formData);
    console.log("[DEBUG] updateProfile Action Received:", { designation });

    if (!contactNumber) { // Address, region, branch might be optional for some changes? Keeping validation strict as per existing.
        return { error: "Contact number is required" };
    }
    // Re-evaluating existing validation: "if (!contactNumber || !address || !region || !branch)"
    // User didn't ask to relax validation, but designation can be optional.

    if (!contactNumber || !address || !region || !branch) {
        return { error: "All fields are required" };
    }

    // Phone number validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(contactNumber)) {
        return { error: "Contact number must be exactly 10 digits" };
    }

    try {
        await dbConnect();
        const user = await User.findById(session.user.id);
        if (!user) return { error: "User not found" };

        const isFirstTimeSetup = user.status === "pending" && (!user.contactNumber || !user.address);

        await User.findByIdAndUpdate(session.user.id, {
            contactNumber,
            address,
            region,
            branch,
            designation,
        });

        // Trigger Verification Request Notification to Admins ONLY if it's the first relevant setup
        // or if they are still pending verification.
        if (user.status === "pending") {
            // Fetch admins to notify
            const admins = await User.find({ role: "admin" }).select("_id email name");
            const adminIds = admins.map(a => a._id.toString());

            if (adminIds.length > 0) {
                await triggerNotification("verification-request", {
                    actor: { id: session.user.id, name: session.user.name, email: session.user.email },
                    recipients: adminIds,
                    data: {
                        name: session.user.name,
                        email: session.user.email,
                    }
                });
            }
        }

        revalidatePath("/profile");
        revalidatePath("/setup");

        return { success: true };
    } catch (error) {
        console.error("Profile Update Error:", error);
        return { error: `Failed to update profile: ${error.message}` };
    }
}

export async function changePassword(currentPassword, newPassword) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    try {
        await dbConnect();
        const user = await User.findById(session.user.id).select("+password");

        if (!user) return { error: "User not found" };

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return { error: "Incorrect current password" };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return { success: true };
    } catch (error) {
        console.error("Change Password Error:", error);
        return { error: "Failed to change password" };
    }
}

export async function updateAvatar(base64Image) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    try {
        await dbConnect();

        // Update User
        await User.findByIdAndUpdate(session.user.id, { image: base64Image });

        // Revalidate to update Navbar and Profile
        revalidatePath("/profile");
        revalidatePath("/", "layout"); // Revalidate all layouts to update Navbar

        return { success: true };
    } catch (error) {
        console.error("Update Avatar Error:", error);
        return { error: "Failed to update avatar" };
    }
}

export async function updateViewPreference(view) {
    try {
        const session = await auth();
        if (!session) {
            throw new Error("Unauthorized");
        }

        if (!["grid", "list"].includes(view)) {
            throw new Error("Invalid view preference");
        }

        await dbConnect();

        await User.findByIdAndUpdate(session.user.id, {
            viewPreference: view,
        });

        revalidatePath("/entries");
        revalidatePath("/settings");
        
        return { success: true };
    } catch (error) {
        console.error("Failed to update view preference:", error);
        return { success: false, error: error.message };
    }
}

export async function getCurrentUser() {
    const session = await auth();
    if (!session) return null;
    try {
        await dbConnect();
        const user = await User.findById(session.user.id).select("role status");
        return {
            role: user.role,
            status: user.status
        };
    } catch (error) {
        return null;
    }
}
