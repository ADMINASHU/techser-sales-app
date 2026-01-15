import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { verifyAuth, unauthorizedResponse } from "@/lib/mobileAuth";

export async function PUT(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return unauthorizedResponse();

        const body = await req.json();

        await dbConnect();

        // Only allow updating specific fields to prevent privilege escalation
        // e.g., don't allow updating 'role', 'status', 'region' (unless admin logic added)
        const allowedUpdates = {
            name: body.name,
            contactNumber: body.contactNumber,
            address: body.address
        };

        const updatedUser = await User.findByIdAndUpdate(
            user.id,
            { $set: allowedUpdates },
            { new: true } // Return updated doc
        ).select("-password -fcmTokens");
        // Exclude sensitive data from response, though mobileAuth usually attaches basic info

        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error) {
        console.error("Mobile Update Profile Error:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
