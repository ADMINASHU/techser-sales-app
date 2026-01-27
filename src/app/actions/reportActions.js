"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import User from "@/models/User";
import Location from "@/models/Location";
import "@/models/Customer"; // Register Customer model
import { formatInIST } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import { serializeMongoList } from "@/lib/formatters";

// Helper: Calculate distance between two coordinates in km (Haversine formula)
function calculateDistance(loc1, loc2) {
  if (!loc1?.lat || !loc1?.lng || !loc2?.lat || !loc2?.lng) return "";

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(loc2.lat - loc1.lat);
  const dLon = deg2rad(loc2.lng - loc1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(loc1.lat)) *
      Math.cos(deg2rad(loc2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d.toFixed(2); // Return as string with 2 decimals
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Cached Report Fetcher
const getCachedReportData = unstable_cache(
  async (startDate, endDate, userIdList, region, branch) => {
    await dbConnect();

    let query = {};

    // Check primitives provided in arguments
    if (userIdList && userIdList.length > 0) {
      query.userId = { $in: userIdList };
    }

    if (startDate && endDate) {
      query.entryDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const entries = await Entry.find(query)
      .select(
        "entryDate status userName userRegion userBranch customerName customerAddress contactPerson contactNumber stampIn stampOut location createdAt customerId userId",
      )
      .populate(
        "userId",
        "name email region branch role status image designation contactNumber address",
      )
      .populate(
        "customerId",
        "name customerAddress contactPerson contactNumber location",
      ) // Only populate needed customer fields
      .lean(); // Use lean() for better performance

    // Format for Excel - Match Google Sheets column order exactly
    const data = entries.map((e) => {
      const customer = e.customerId || {};
      const customerLoc = customer.location || e.location; // { lat, lng }
      const stampInLoc = e.stampIn?.location;
      const stampOutLoc = e.stampOut?.location;

      return {
        Date: e.entryDate
          ? formatInIST(e.entryDate, "dd/MM/yyyy")
          : formatInIST(e.createdAt, "dd/MM/yyyy"),
        Status: e.status || "Not Started",
        Region: e.userRegion || e.userId?.region || "",
        Branch: e.userBranch || e.userId?.branch || "",
        "User Name": e.userName || e.userId?.name || "",
        "Customer Name": e.customerName || customer.name || "",
        "Customer Address": customer.customerAddress || e.customerAddress || "",
        "Contact Person & Number": `${
          customer.contactPerson || e.contactPerson || ""
        } ${customer.contactNumber || e.contactNumber || ""}`.trim(),
        "StampIn Time": e.stampIn?.time
          ? formatInIST(e.stampIn.time, "dd/MM/yyyy HH:mm:ss")
          : "",
        "StampOut Time": e.stampOut?.time
          ? formatInIST(e.stampOut.time, "dd/MM/yyyy HH:mm:ss")
          : "",
        "StampIn Distance (km)": calculateDistance(customerLoc, stampInLoc),
        "StampOut Distance (km)": calculateDistance(customerLoc, stampOutLoc),
      };
    });

    return data;
  },
  ["report-data"],
  { tags: ["reports"], revalidate: 60 }, // Cache for 60 seconds
);

export async function getReportData({
  startDate,
  endDate,
  userId,
  region,
  branch,
}) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const isAdmin = session.user.role === "admin";
  const isSuperUser = session.user.role === "super_user";

  if (!isAdmin && !isSuperUser) {
    userId = session.user.id;
    region = "all";
    branch = "all";
  } else if (isSuperUser) {
    // For Super User, force their region
    region = session.user.region;
  }

  let effectiveUserId = userId;
  let effectiveRegion = region;
  let effectiveBranch = branch;

  await dbConnect();

  // Prepare primitive arguments for the cache key
  let userIdList = [];

  if (effectiveUserId && effectiveUserId !== "all") {
    userIdList = [effectiveUserId];
  } else if (
    (effectiveRegion && effectiveRegion !== "all") ||
    (effectiveBranch && effectiveBranch !== "all")
  ) {
    let userQuery = {};
    if (effectiveRegion && effectiveRegion !== "all")
      userQuery.region = effectiveRegion;
    if (effectiveBranch && effectiveBranch !== "all")
      userQuery.branch = effectiveBranch;
    // Optimization: We could cache this lookup too, but it's fast enough.
    const matchingUsers = await User.find(userQuery, "_id").lean();
    userIdList = matchingUsers.map((u) => u._id.toString());
  }

  // Pass everything as primitives (strings/arrays of strings)
  // Note: userIdList will be an array of strings.
  // startDate/endDate should be passed as strings or dates (unstable_cache handles dates in args usually, but strings are safer)

  return await getCachedReportData(
    startDate,
    endDate,
    userIdList.length > 0 ? userIdList : null,
    effectiveRegion,
    effectiveBranch,
  );
}

export async function getRawEntries({
  startDate,
  endDate,
  userId,
  region,
  branch,
  limit,
}) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const isAdmin = session.user.role === "admin";
  const isSuperUser = session.user.role === "super_user";

  // Enforce restriction for non-admins
  if (!isAdmin && !isSuperUser) {
    userId = session.user.id;
    region = "all";
    branch = "all";
  } else if (isSuperUser) {
    // For Super User, force their region
    region = session.user.region;
  }

  await dbConnect();

  let query = {};

  if (userId && userId !== "all") {
    query.userId = userId;
  } else if ((region && region !== "all") || (branch && branch !== "all")) {
    let userQuery = {};
    if (region && region !== "all") userQuery.region = region;
    if (branch && branch !== "all") userQuery.branch = branch;
    const matchingUsers = await User.find(userQuery, "_id").lean();
    query.userId = { $in: matchingUsers.map((u) => u._id) };
  }

  if (startDate && endDate) {
    query.entryDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // We sort by createdAt -1 to get recent ones
  let queryBuilder = Entry.find(query)
    .select(
      "entryDate status userName userRegion userBranch customerName customerAddress contactPerson contactNumber stampIn stampOut location createdAt customerId userId comment",
    )
    .populate(
      "userId",
      "name email region branch role status image designation contactNumber address",
    )
    .populate(
      "customerId",
      "name customerAddress contactPerson contactNumber location",
    ) // Only populate needed fields
    .sort({ createdAt: -1 })
    .lean(); // Use lean() for better performance

  if (limit) {
    queryBuilder = queryBuilder.limit(limit);
  }

  const entries = await queryBuilder;

  return serializeMongoList(entries);
}

export async function getFilters() {
  const session = await auth();
  await dbConnect();

  let userQuery = { role: { $ne: "admin" } };
  if (session?.user?.role === "super_user") {
    userQuery.region = session.user.region;
  }

  const [users, locations] = await Promise.all([
    User.find(userQuery, "name _id region branch role")
      .sort({ name: 1 })
      .lean(),
    Location.find({}).sort({ name: 1 }).lean(),
  ]);

  return {
    users: serializeMongoList(users),
    locations: serializeMongoList(locations),
  };
}

const getCachedSystemStats = unstable_cache(
  async (region) => {
    await dbConnect();

    const query = {};
    if (region) query.region = region;

    const [totalAdmins, verifiedAdmins, totalUsers, verifiedUsers, locations] =
      await Promise.all([
        User.countDocuments({ role: "admin", ...query }),
        User.countDocuments({ role: "admin", status: "verified", ...query }),
        User.countDocuments({ role: "user", ...query }),
        User.countDocuments({ role: "user", status: "verified", ...query }),
        Location.find(region ? { name: region } : {}).lean(),
      ]);

    const totalRegions = locations.length;
    const totalBranches = locations.reduce(
      (acc, loc) => acc + (loc.branches?.length || 0),
      0,
    );

    return {
      admins: { total: totalAdmins, verified: verifiedAdmins },
      users: { total: totalUsers, verified: verifiedUsers },
      locations: { regions: totalRegions, branches: totalBranches },
    };
  },
  ["system-stats"],
  { revalidate: 300 },
);

export async function getSystemStats() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  const isCoreAdmin =
    session.user.role === "admin" || session.user.role === "super_user";
  if (!isCoreAdmin) throw new Error("Unauthorized");

  const region =
    session.user.role === "super_user" ? session.user.region : null;
  return getCachedSystemStats(region);
}
