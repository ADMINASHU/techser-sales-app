import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.AUTH_SECRET || "fallback_secret_do_not_use_in_production";

export async function POST(req) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Google ID Token is required" },
        { status: 400 },
      );
    }

    // Verify token with Google's public endpoint
    const googleResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
    );
    const googleData = await googleResponse.json();

    if (googleData.error) {
      console.error(
        "Google Token Validation Error:",
        googleData.error_description,
      );
      return NextResponse.json(
        { error: "Invalid Google Token" },
        { status: 401 },
      );
    }

    // Optional: Check aud match if sensitive
    // if (googleData.aud !== process.env.AUTH_GOOGLE_ID) ...

    const { email, name, picture, email_verified } = googleData;

    if (email_verified !== "true" && email_verified !== true) {
      return NextResponse.json(
        { error: "Email not verified by Google" },
        { status: 401 },
      );
    }

    await dbConnect();

    // Find or Create User
    let user = await User.findOne({ email }).select("+password");

    if (!user) {
      // Create new user
      user = await User.create({
        name,
        email,
        image: picture,
        provider: "google",
        status: "pending", // Default to pending, admin must verify?
        // Actually, for Google login, maybe auto-verify email?
        // But the system seems to require 'verified' status for login.
        // Let's check if new registrations are 'pending'.
        // register/route.js sets logic to 'pending'.
        // So we should respect that.
        role: "user",
      });
    }

    // Check Status
    // if (user.status !== "verified") {
    //     return NextResponse.json(
    //         { error: "Account is not active/verified. Please contact admin." },
    //         { status: 403 }
    //     );
    // }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        region: user.region,
        branch: user.branch,
      },
      JWT_SECRET,
      { expiresIn: "30d" },
    );

    // Return user data matching login route
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      region: user.region,
      branch: user.branch,
      contactNumber: user.contactNumber,
      image: user.image,
      status: user.status,
    };

    return NextResponse.json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Mobile Google Auth Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
