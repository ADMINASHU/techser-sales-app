import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import { verifyAuth, unauthorizedResponse } from "@/lib/mobileAuth";
import { revalidatePath } from "next/cache";

export async function GET(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) return unauthorizedResponse();

    await dbConnect();

    let query = {};
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const branch = searchParams.get("branch");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    // Status Filter (Default to Active)
    if (status === "Inactive") {
      query.isActive = false;
    } else if (status === "all") {
      // No active filter
    } else {
      query.isActive = true; // Default or 'Active'
    }

    // Role-based + Explicit filtering
    if (user.role !== "admin") {
      // Context: User can see their own customers OR shared customers in their branch
      // We assume 'branch' is the primary boundary.
      query.branch = user.branch;

      // "Own Created" OR "Shared"
      query.$or = [{ userId: user.id }, { isShared: true }];
    } else {
      // Admin explicit filters
      if (region && region !== "all") query.region = region;
      if (branch && branch !== "all") query.branch = branch;
    }

    // Search (Text index or Regex)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { customerAddress: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
      ];
    }

    const customers = await Customer.find(query).sort({ name: 1 }).limit(100); // Limit for performance on mobile

    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error("Mobile API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) return unauthorizedResponse();

    const body = await req.json();

    // Basic validation
    if (!body.name || !body.customerAddress || !body.region || !body.branch) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Check for duplicates (simplified)
    const existing = await Customer.findOne({
      name: body.name,
      region: body.region,
      branch: body.branch,
    });

    if (existing) {
      return NextResponse.json(
        { error: "Customer already exists in this branch" },
        { status: 409 },
      );
    }

    const newCustomer = await Customer.create({
      ...body,
      userId: user.id, // Set creator
      isActive: true,
      entryCount: 0,
    });

    // Revalidate web paths
    revalidatePath("/customers");
    revalidatePath("/customer-log");

    return NextResponse.json({ success: true, customer: newCustomer });
  } catch (error) {
    console.error("Mobile Create Customer Error:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 },
    );
  }
}
