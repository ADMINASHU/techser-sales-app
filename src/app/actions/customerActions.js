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

        // Allow updates if it's the owner, an admin, or shares the same region/branch
        const isAuthorized =
            session.user.role === "admin" ||
            customer.userId.toString() === session.user.id ||
            (session.user.region === customer.region && session.user.branch === customer.branch);

        if (!isAuthorized) {
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

        if (
            customer.userId.toString() !== session.user.id &&
            session.user.role !== "admin" &&
            (session.user.region !== customer.region || session.user.branch !== customer.branch)
        ) {
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
        if (
            customer.userId.toString() !== session.user.id &&
            session.user.role !== "admin" &&
            (session.user.region !== customer.region || session.user.branch !== customer.branch)
        ) {
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
            if (!session.user.region || !session.user.branch) {
                return { customers: [], hasMore: false };
            }
            query.region = session.user.region;
            query.branch = session.user.branch;
        } else {
            if (filters.region && filters.region !== "all") query.region = filters.region;
            if (filters.branch && filters.branch !== "all") query.branch = filters.branch;
        }

        if (activeOnly) query.isActive = true;

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: "i" } },
                { customerAddress: { $regex: filters.search, $options: "i" } },
            ];
        }

        // OPTIMIZATION: Removed heavy Aggregation.
        // Strategy:
        // 1. Find the single "Prioritized" (Active) Customer for this user.
        // 2. Fetch customers sorted by entryCount (indexed).
        // 3. If on page 1, ensure Active Customer is at top.

        let activeCustomerId = null;
        if (skip === 0) {
            const activeEntry = await Entry.findOne({
                userId: session.user.id,
                status: "In Process",
                entryDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }).select("customerId").lean();
            if (activeEntry) activeCustomerId = activeEntry.customerId.toString();
        }

        let customers = await Customer.find(query)
            .sort({ entryCount: -1, name: 1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // If we found an active customer and we are on page 1
        let activeCustomer = null;
        if (activeCustomerId) {
            // Check if it's already in the list
            const idx = customers.findIndex(c => c._id.toString() === activeCustomerId);
            if (idx !== -1) {
                // Move to top
                const [item] = customers.splice(idx, 1);
                item.isPrioritized = 1;
                customers.unshift(item);
            } else {
                // Fetch it explicitly if it matches the current filters
                // (We need to ensure it matches filters, otherwise we shouldn't show it?)
                // Actually, if it's active, we probably want to show it regardless of scroll position, but respecting search?
                // For simplicity, let's just fetch it if it matches query.
                const activeQuery = { ...query, _id: activeCustomerId };
                activeCustomer = await Customer.findOne(activeQuery).lean();
                if (activeCustomer) {
                    activeCustomer.isPrioritized = 1;
                    customers.unshift(activeCustomer);
                    // If we added one, we might want to pop the last one to keep page size consistent, 
                    // but keeping it +1 is fine for UX.
                }
            }
        }

        // Just to ensure format matches previous expectations (though we removed 'allEntries')
        // We ensure 'isPrioritized' is set to 0 for others.
        customers.forEach(c => {
            if (!c.isPrioritized) c.isPrioritized = 0;
            // entryCount is now native to the model, no need to calculate!
        });

        const total = await Customer.countDocuments(query);
        const hasMore = skip + customers.length < total;

        return {
            customers: JSON.parse(JSON.stringify(customers)),
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
