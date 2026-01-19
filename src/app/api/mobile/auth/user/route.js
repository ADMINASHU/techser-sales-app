import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { verifyAuth, unauthorizedResponse } from "@/lib/mobileAuth";
import bcrypt from "bcryptjs";

export async function GET(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) return unauthorizedResponse();

    await dbConnect();
    const dbUser = await User.findById(user.id).select("-password -fcmTokens");

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: dbUser });
  } catch (error) {
    console.error("Mobile Get User Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) return unauthorizedResponse();

    const body = await req.json();
    await dbConnect();

    // 1. Password Change Logic
    if (body.newPassword && body.currentPassword) {
      const dbUser = await User.findById(user.id).select("+password");
      if (!dbUser)
        return NextResponse.json({ error: "User not found" }, { status: 404 });

      const isMatch = await bcrypt.compare(
        body.currentPassword,
        dbUser.password,
      );
      if (!isMatch) {
        return NextResponse.json(
          { error: "Incorrect current password" },
          { status: 400 },
        );
      }

      const hashedPassword = await bcrypt.hash(body.newPassword, 10);
      dbUser.password = hashedPassword;
      await dbUser.save();

      // If only updating password, return early
      if (!body.name && !body.image) {
        return NextResponse.json({
          success: true,
          message: "Password updated successfully",
        });
      }
    }

    // 2. Profile Update (Name, Contact, Address, Image)
    const allowedUpdates = {};
    if (body.name) allowedUpdates.name = body.name;
    if (body.contactNumber) allowedUpdates.contactNumber = body.contactNumber;
    if (body.address) allowedUpdates.address = body.address;
    if (body.image) allowedUpdates.image = body.image; // Base64 image provided
    if (body.region) allowedUpdates.region = body.region;
    if (body.branch) allowedUpdates.branch = body.branch;
    if (body.designation) allowedUpdates.designation = body.designation;

    // Allow Work Info update if provided (optional, matching web schema)
    // Usually these are read-only for non-admins, but if web action allows it, we can allow it here
    // OR strictly follow the existing mobile restriction.
    // User asked to "get help from techser-sales-app", which has validation but potentially allows it via 'updateProfile' action if formData has it.
    // However, ProfilePage.js on web *displays* them but doesn't have inputs for them in the main view (only EditProfileDialog might).
    // Let's stick to safe defaults + image + password for now.

    if (Object.keys(allowedUpdates).length > 0) {
      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { $set: allowedUpdates },
        { new: true },
      ).select("-password -fcmTokens");

      return NextResponse.json({ success: true, user: updatedUser });
    }

    return NextResponse.json({ success: true, message: "No changes applied" });
  } catch (error) {
    console.error("Mobile Update Profile Error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
