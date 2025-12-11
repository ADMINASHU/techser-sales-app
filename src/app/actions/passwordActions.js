"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function requestPasswordReset(formData) {
    const email = formData.get("email");

    try {
        await dbConnect();
        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists
            return { success: "If an account exists, a reset link has been sent." };
        }

        // Allow reset for any user (Google users can "add" a password this way)

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // In prod, use real domain
        const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

        await sendEmail({
            to: email,
            subject: "Password Reset Request",
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
        });

        return { success: "If an account exists, a reset link has been sent." };
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return { error: "Something went wrong." };
    }
}

export async function resetPassword(token, formData) {
    const password = formData.get("password");

    try {
        await dbConnect();
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return { error: "Invalid or expired token." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        return { success: "Password reset successfully. Please login." };
    } catch (error) {
        return { error: "Failed to reset password." };
    }
}
