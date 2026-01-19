import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { verifyAuth, unauthorizedResponse } from "@/lib/mobileAuth";

export async function GET(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) return unauthorizedResponse();

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access only" },
        { status: 403 },
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password -fcmTokens")
      .sort({ name: 1 });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Mobile Users API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
