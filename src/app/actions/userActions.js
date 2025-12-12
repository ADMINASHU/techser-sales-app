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
        });

        // Trigger Verification Request Notification to Admins
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
