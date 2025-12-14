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
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .content { padding: 40px 30px; color: #3f3f46; line-height: 1.6; }
        .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; text-align: center; }
        .footer { background-color: #fafafa; padding: 20px; text-align: center; color: #a1a1aa; font-size: 12px; border-top: 1px solid #f4f4f5; }
        .link { color: #8b5cf6; word-break: break-all; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Techser Sales Management</h1>
        </div>
        <div class="content">
            <h2 style="margin-top: 0; color: #18181b;">Reset Your Password</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your Techser account. If you didn't make this request, you can safely ignore this email.</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button" style="color: white;">Reset Password</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #71717a;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" class="link">${resetUrl}</a>
            </p>
            
            <p style="font-size: 14px; color: #71717a;">This link will expire in 1 hour.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Techser Sales Management. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
            `,
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
