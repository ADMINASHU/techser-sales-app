import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Please provide all fields" },
                { status: 400 },
            );
        }

        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 },
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            provider: "credentials",
            status: "pending",
        });

        return NextResponse.json({
            success: true,
            message: "Account created successfully. Please login.",
        });
    } catch (error) {
        console.error("Mobile Register Error:", error);
        return NextResponse.json(
            { error: "Registration failed" },
            { status: 500 },
        );
    }
}
