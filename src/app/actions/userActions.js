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

import { z } from "zod";

const ProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    contactNumber: z.string().regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    region: z.string().min(1, "Region is required"),
    branch: z.string().min(1, "Branch is required"),
    designation: z.string().optional(),
});

export async function updateProfile(formData) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    const data = Object.fromEntries(formData);
    const parsed = ProfileSchema.safeParse(data);

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const { name, contactNumber, address, region, branch, designation } = parsed.data;

    try {
        await dbConnect();
        const user = await User.findById(session.user.id);
        if (!user) return { error: "User not found" };

        const isFirstTimeSetup = user.status === "pending" && (!user.contactNumber || !user.address);

        await User.findByIdAndUpdate(session.user.id, {
            name,
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
