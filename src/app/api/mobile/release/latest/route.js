import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Release from "@/models/Release";
import { verifyAuth, unauthorizedResponse } from "@/lib/mobileAuth";

// GET: Fetch the latest active release
export async function GET(req) {
  try {
    await dbConnect();

    // Find the latest active release
    const latestRelease = await Release.findOne({ isActive: true })
      .sort({ createdAt: -1 }) // Get newest created
      .limit(1);

    if (!latestRelease) {
      return NextResponse.json({
        success: true,
        release: null,
        message: "No updates available",
      });
    }

    return NextResponse.json({
      success: true,
      release: latestRelease,
    });
  } catch (error) {
    console.error("Release Check Error:", error);
    return NextResponse.json(
      { error: "Failed to check for updates" },
      { status: 500 },
    );
  }
}

// POST: Developer Only - Create a new release
// Secured by API Key (RELEASE_SECRET in .env) to separate "App Admin" from "Developer"
export async function POST(req) {
  try {
    const secret = req.headers.get("x-release-secret");
    const serverSecret = process.env.RELEASE_SECRET || "techser-dev-secret";

    if (secret !== serverSecret) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid Secret" },
        { status: 401 },
      );
    }

    await dbConnect();
    const body = await req.json();

    const newRelease = await Release.create({
      version: body.version,
      downloadUrl: body.downloadUrl,
      releaseNotes: body.releaseNotes || [],
      forceUpdate: body.forceUpdate || false,
    });

    return NextResponse.json({ success: true, release: newRelease });
  } catch (error) {
    console.error("Create Release Error:", error);
    return NextResponse.json(
      { error: "Failed to create release" },
      { status: 500 },
    );
  }
}
