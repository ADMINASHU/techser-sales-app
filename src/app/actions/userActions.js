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
        console.log("DEBUG: KNOCK_SECRET_API_KEY:", {
            type: typeof secretKey,
            length: secretKey?.length,
            value: secretKey ? `${secretKey.substring(0, 5)}...` : "MISSING/EMPTY",
            isTruthy: !!secretKey
        });

        if (secretKey && secretKey.trim().length > 0) {
            // Using object syntax as suggested by the error message
            const knock = new Knock({ apiKey: secretKey.trim() });
            const admins = await User.find({ role: "admin" });
            if (admins.length > 0) {
                const adminIds = admins.map(admin => admin._id.toString());
                
                try {
                    // Direct API call to identify user (bypassing SDK issues)
                    const identifyUserRaw = async (userId, traits) => {
                        try {
                            const response = await fetch(`https://api.knock.app/v1/users/${userId}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${secretKey.trim()}`
                                },
                                body: JSON.stringify(traits)
                            });
                            if (!response.ok) {
                                console.error(`Failed to identify user ${userId}:`, await response.text());
                            }
                        } catch (e) {
                            console.error(`Network error identifying user ${userId}:`, e);
                        }
                    };

                    // Identify actor
                    await identifyUserRaw(session.user.id, {
                        name: session.user.name || "User",
                        email: session.user.email,
                    });

                    // Identify recipients
                    for (const admin of admins) {
                         await identifyUserRaw(admin._id.toString(), {
                            name: admin.name || "Admin",
                            email: admin.email,
                         });
                    }

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
        console.error("Profile Update DETAILED Error:", error);
        return { error: `Failed to update profile: ${error.message}` };
    }
}
