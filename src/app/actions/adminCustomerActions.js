"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import mongoose from "mongoose";

export async function getAdminCustomerAnalytics({
  filters = {},
  skip = 0,
  limit = 30,
}) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return { customers: [], hasMore: false };
  }

  try {
    await dbConnect();
    const { region, branch, month, year, userId, search } = filters;

    // 1. Build Customer Match Query (Filters the LIST of customers)
    const customerMatch = {};
    
    if (region && region !== "all") {
        customerMatch.region = region;
    }
    
    if (branch && branch !== "all") {
        customerMatch.branch = branch;
    }

    // Filter by the User who CREATED the customer
    if (userId && userId !== "all") {
        customerMatch.userId = new mongoose.Types.ObjectId(userId);
    }

    if (search) {
      customerMatch.$or = [
        { name: { $regex: search, $options: "i" } },
        { customerAddress: { $regex: search, $options: "i" } },
      ];
    }

    // 2. Build Entry Match Query (Filters the TIME RANGE for stats)
    // Note: We do NOT filter by userId here, because we want stats "by all visited users"
    const entryMatch = {};
    
    if (year && year !== "all") {
      const y = parseInt(year);
      let start, end;
      if (month && month !== "all") {
        const m = parseInt(month);
        start = new Date(y, m, 1);
        end = new Date(y, m + 1, 0, 23, 59, 59);
      } else {
        start = new Date(y, 0, 1);
        end = new Date(y, 11, 31, 23, 59, 59);
      }
      entryMatch.entryDate = { $gte: start, $lte: end };
    }

    // 3. Aggregation Pipeline
    const pipeline = [
      // Match Customers first
      { $match: customerMatch },
      // Sort by name for consistent pagination
      { $sort: { name: 1 } },
      // Apply Pagination
      { $skip: skip },
      { $limit: limit },
      // Lookup Entries for these customers to calculate stats
      {
        $lookup: {
          from: "entries",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                ...entryMatch, 
                // We count all visits, but duration usually implies 'Completed' or valid timestamps
              },
            },
            {
              $project: {
                duration: {
                  $cond: {
                    if: { $and: ["$stampIn.time", "$stampOut.time"] },
                    then: {
                      $subtract: ["$stampOut.time", "$stampIn.time"],
                    },
                    else: 0,
                  },
                },
              },
            },
          ],
          as: "stats",
        },
      },
      // Calculate totals
      {
        $addFields: {
          visitCount: { $size: "$stats" },
          totalDuration: { $sum: "$stats.duration" },
        },
      },
      // Cleanup
      { $project: { stats: 0 } },
    ];

    const customers = await Customer.aggregate(pipeline);
    
    // Check if there are more
    const totalMatching = await Customer.countDocuments(customerMatch);
    const hasMore = skip + customers.length < totalMatching;

    return {
      customers: JSON.parse(JSON.stringify(customers)),
      hasMore,
    };
  } catch (error) {
    console.error("Admin Customer Analytics Error:", error);
    return { customers: [], hasMore: false };
  }
}