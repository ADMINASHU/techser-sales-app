"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

import { Knock } from "@knocklabs/node";

// const knock = process.env.KNOCK_SECRET_API_KEY ? new Knock(process.env.KNOCK_SECRET_API_KEY) : null;

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

        // Notify Admins
        const secretKey = process.env.KNOCK_SECRET_API_KEY;
        if (secretKey) {
            const knock = new Knock(secretKey);
            const admins = await User.find({ role: "admin" });
            if (admins.length > 0) {
                const adminIds = admins.map(admin => admin._id.toString());
                
                try {
                    await knock.workflows.trigger("verification-request", {
                        actor: session.user.id,
                        recipients: adminIds,
                        data: {
                            name: session.user.name || "User",
                            email: session.user.email,
                        },
                    });
                } catch (kError) {
                    console.error("Knock Notification Failed", kError);
                }
            }
        } else {
            console.warn("KNOCK_SECRET_API_KEY is missing. Notification not sent.");
        }

        revalidatePath("/profile");
        revalidatePath("/setup");

        return { success: true };
    } catch (error) {
        console.error("Profile Update Error", error);
        return { error: "Failed to update profile" };
    }
}
