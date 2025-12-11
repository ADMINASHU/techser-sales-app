"use server";

import { signIn } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function register(formData) {
    const { name, email, password } = Object.fromEntries(formData);

    try {
        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return { error: "User already exists." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            provider: "credentials",
            status: "pending",
        });

        // Automatically sign in or redirect to login? 
        // Usually redirect to login is safer or auto-login.
        // Let's redirect to login for now to be explicit.
        return { success: "Account created! Please log in." };

    } catch (error) {
        console.error("Registration Error:", error);
        return { error: "Something went wrong." };
    }
}

export async function authenticate(prevState, formData) {
    try {
        await signIn("credentials", Object.fromEntries(formData));
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return "Something went wrong.";
            }
        }
        throw error;
    }
}

export async function googleLogin() {
    await signIn("google");
}
