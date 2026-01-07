import { auth } from "@/auth";
import { getCustomersWithEntryCount, getCustomerActionStatus } from "@/app/actions/customerActions";
import { getFilters } from "@/app/actions/reportActions";
import CustomerFilters from "@/components/CustomerFilters";
import InfiniteCustomerLogList from "@/components/InfiniteCustomerLogList";
import { SearchX } from "lucide-react";
import { redirect } from "next/navigation";

export default async function CustomerLogPage({ searchParams }) {
    const session = await auth();
    if (session?.user?.role === "admin") {
        redirect("/dashboard");
    }
    const params = await searchParams;
    const filtersData = await getFilters();

    // Get initial batch of customers sorted by entry count (only active customers)
    const { customers, hasMore } = await getCustomersWithEntryCount({
        filters: params,
        skip: 0,
        limit: 10,
        activeOnly: true // Only show active customers on check-in page
    });

    // Import batch function at the top of the file
    const { batchGetCustomerActionStatus } = await import("@/app/actions/batchCustomerActions");
    
    // Batch fetch active entry statuses for all initial customers
    const customerIds = customers.map(c => c._id.toString());
    const statusMap = await batchGetCustomerActionStatus(customerIds, session.user.id);
    
    // Attach activeEntry to each customer
    const initialCustomersWithStatus = customers.map(customer => ({
        ...customer,
        activeEntry: statusMap[customer._id.toString()] || null
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent hidden sm:block">
                    Check-In/Out
                </h1>

                <div className="w-full sm:max-w-xs md:max-w-sm">
                    <CustomerFilters
                        locations={filtersData.locations}
                        isAdmin={session.user.role === "admin"}
                    />
                </div>
            </div>

            {initialCustomersWithStatus.length > 0 ? (
                <InfiniteCustomerLogList
                    initialCustomers={initialCustomersWithStatus}
                    initialHasMore={hasMore}
                    searchParams={params}
                    userId={session.user.id}
                />
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl border border-white/5">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <SearchX className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No customers found</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Please add customers in the &quot;Customers&quot; tab first or adjust your search.
                    </p>
                </div>
            )}
        </div>
    );
}
