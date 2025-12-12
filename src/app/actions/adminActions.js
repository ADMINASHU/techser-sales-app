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
