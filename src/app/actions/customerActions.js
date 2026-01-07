"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import Entry from "@/models/Entry";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export async function createCustomer(formData) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    const data = Object.fromEntries(formData);
    const { name, customerAddress, district, state, pincode, lat, lng, contactPerson, contactNumber, region, branch, isActive } = data;

    try {
        await dbConnect();
        const customer = await Customer.create({
            userId: session.user.id,
            name,
            customerAddress,
            district,
            state,
            pincode,
            location: {
                lat: lat ? parseFloat(lat) : undefined,
                lng: lng ? parseFloat(lng) : undefined,
            },
            contactPerson,
            contactNumber,
            region,
            branch,
            // Default to true if not provided (allows model default to work)
            isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : true,
        });


        revalidatePath("/customers");
        revalidatePath("/customer-log"); // Ensure check-in/out page shows new customer immediately
        return { success: true, id: customer._id.toString() };
    } catch (error) {
        console.error("Create Customer Error:", error);
        return { error: "Failed to create customer" };
    }
}

export async function updateCustomer(id, formData) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    const data = Object.fromEntries(formData);
    const { name, customerAddress, district, state, pincode, lat, lng, contactPerson, contactNumber, region, branch, isActive } = data;

    try {
        await dbConnect();
        const customer = await Customer.findById(id);
        if (!customer) return { error: "Customer not found" };

        // Allow updates if it's the owner or an admin
        if (customer.userId.toString() !== session.user.id && session.user.role !== "admin") {
            return { error: "Unauthorized" };
        }

        customer.name = name;
        customer.customerAddress = customerAddress;
        customer.district = district;
        customer.state = state;
        customer.pincode = pincode;
        if (lat && lng) {
            customer.location = {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
            };
        }
        customer.contactPerson = contactPerson;
        customer.contactNumber = contactNumber;
        customer.region = region;
        customer.branch = branch;
        customer.isActive = isActive === "true" || isActive === true;

        await customer.save();

        revalidatePath("/customers");
        return { success: true };
    } catch (error) {
        console.error("Update Customer Error:", error);
        return { error: "Failed to update customer" };
    }
}

export async function deleteCustomer(id) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    try {
        await dbConnect();
        const customer = await Customer.findById(id);
        if (!customer) return { error: "Customer not found" };

        if (customer.userId.toString() !== session.user.id && session.user.role !== "admin") {
            return { error: "Unauthorized" };
        }

        await Customer.findByIdAndDelete(id);
        revalidatePath("/customers");
        return { success: true };
    } catch (error) {
        console.error("Delete Customer Error:", error);
        return { error: "Failed to delete customer" };
    }
}

export async function toggleCustomerStatus(id) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    try {
        await dbConnect();
        const customer = await Customer.findById(id);
        if (!customer) return { error: "Customer not found" };

        // Allow toggle if it's the owner or an admin
        if (customer.userId.toString() !== session.user.id && session.user.role !== "admin") {
            return { error: "Unauthorized" };
        }

        customer.isActive = !customer.isActive;
        await customer.save();

        revalidatePath("/customers");
        return { success: true, isActive: customer.isActive };
    } catch (error) {
        console.error("Toggle Customer Status Error:", error);
        return { error: "Failed to toggle customer status" };
    }
}

export async function getCustomers({ filters = {}, skip = 0, limit = 18, activeOnly = false }) {
    const session = await auth();
    if (!session) return { customers: [], hasMore: false };

    try {
        await dbConnect();
        const query = {};
        const isAdmin = session.user.role === "admin";

        // For non-admins, strictly filter by their region and branch
        if (!isAdmin) {
            // STRICT SECURITY: If user has no region/branch content, return empty instead of ALL.
            if (!session.user.region || !session.user.branch) {
                return { customers: [], hasMore: false };
            }
            query.region = session.user.region;
            query.branch = session.user.branch;
        } else {
            // For admins, use provided filters
            if (filters.region && filters.region !== "all") {
                query.region = filters.region;
            }
            if (filters.branch && filters.branch !== "all") {
                query.branch = filters.branch;
            }
        }

        // Filter by active status if requested (for check-in page)
        if (activeOnly) {
            query.isActive = true;
        }

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: "i" } },
                { customerAddress: { $regex: filters.search, $options: "i" } },
            ];
        }

        const customers = await Customer.find(query)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        const total = await Customer.countDocuments(query);
        const hasMore = skip + customers.length < total;
        
        return {
            customers: JSON.parse(JSON.stringify(customers)),
            hasMore
        };
    } catch (error) {
        console.error("Get Customers Error:", error);
        return { customers: [], hasMore: false };
    }
}

export async function getCustomersWithEntryCount({ filters = {}, skip = 0, limit = 15, activeOnly = false }) {
    const session = await auth();
    if (!session) return { customers: [], hasMore: false };

    try {
        await dbConnect();
        const query = {};
        const isAdmin = session.user.role === "admin";

        if (!isAdmin) {
            // STRICT SECURITY: If user has no region/branch content, return empty instead of ALL.
            if (!session.user.region || !session.user.branch) {
                return { customers: [], hasMore: false };
            }
            query.region = session.user.region;
            query.branch = session.user.branch;
        } else {
            if (filters.region && filters.region !== "all") {
                query.region = filters.region;
            }
            if (filters.branch && filters.branch !== "all") {
                query.branch = filters.branch;
            }
        }

        // Filter by active status if requested (for check-in page)
        if (activeOnly) {
            query.isActive = true;
        }

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: "i" } },
                { customerAddress: { $regex: filters.search, $options: "i" } },
            ];
        }

        // To support proper paginated sorting by entry count and active state, we use aggregation
        const customersWithCounts = await Customer.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "entries",
                    localField: "_id",
                    foreignField: "customerId",
                    as: "allEntries"
                }
            },
            {
                $addFields: {
                    entryCount: { $size: "$allEntries" },
                    // Identify if THIS SPECIFIC user is currently stamped in here today
                    isPrioritized: {
                        $cond: {
                            if: {
                                $gt: [
                                    {
                                        $size: {
                                            $filter: {
                                                input: "$allEntries",
                                                as: "e",
                                                cond: {
                                                    $and: [
                                                        { $eq: ["$$e.userId", new mongoose.Types.ObjectId(session.user.id)] },
                                                        { $eq: ["$$e.status", "In Process"] },
                                                        { $gte: ["$$e.entryDate", new Date(new Date().setHours(0, 0, 0, 0))] }
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                    0
                                ]
                            },
                            then: 1,
                            else: 0
                        }
                    }
                }
            },
            { $sort: { isPrioritized: -1, entryCount: -1, name: 1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    entries: 0 // Don't return the full entries array
                }
            }
        ]);

        const total = await Customer.countDocuments(query);
        const hasMore = skip + customersWithCounts.length < total;

        return {
            customers: JSON.parse(JSON.stringify(customersWithCounts)),
            hasMore
        };
    } catch (error) {
        console.error("Get Customers with Entry Count Error:", error);
        return { customers: [], hasMore: false };
    }
}

export async function getCustomerActionStatus(customerId, userId) {
    try {
        await dbConnect();
        // Find the most recent entry for this customer and user that is not completed
        const activeEntry = await Entry.findOne({
            customerId,
            userId,
            status: { $in: ["Not Started", "In Process"] },
            entryDate: { 
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lte: new Date(new Date().setHours(23, 59, 59, 999))
            }
        }).sort({ createdAt: -1 }).lean();

        return JSON.parse(JSON.stringify(activeEntry));
    } catch (error) {
       
        return null;
    }
}
