import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import Customer from "@/models/Customer";
import { verifyAuth, unauthorizedResponse } from "@/lib/mobileAuth";

export async function GET(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) return unauthorizedResponse();

    await dbConnect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let query = {};
    if (user.role !== "admin") {
      query.userId = user.id;
    }

    // Parallelize queries for performance
    const [todaysEntries, monthEntries, totalCustomers] = await Promise.all([
      Entry.countDocuments({ ...query, entryDate: { $gte: today } }),
      Entry.countDocuments({ ...query, entryDate: { $gte: firstDayOfMonth } }),
      Customer.countDocuments(
        user.role !== "admin"
          ? {
              $or: [{ userId: user.id }, { region: user.region }],
            }
          : {},
      ),
    ]);

    // Get recent 5 entries
    const recentEntries = await Entry.find(query)
      .sort({ entryDate: -1 })
      .limit(5)
      .populate("customerId", "name district");

    return NextResponse.json({
      success: true,
      stats: {
        today: todaysEntries,
        month: monthEntries,
        customers: totalCustomers,
      },
      recentEntries,
    });
  } catch (error) {
    console.error("Mobile Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
