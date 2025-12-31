import { auth } from "@/auth";
import { getCustomersWithEntryCount, getCustomerActionStatus } from "@/app/actions/customerActions";
import { getFilters } from "@/app/actions/reportActions";
import CustomerFilters from "@/components/CustomerFilters";
import InfiniteCustomerLogList from "@/components/InfiniteCustomerLogList";
import { ClipboardList, SearchX } from "lucide-react";

export default async function CustomerLogPage({ searchParams }) {
    const session = await auth();
    const params = await searchParams;
    const filtersData = await getFilters();
    
    // Get initial batch of customers sorted by entry count
    const { customers, hasMore } = await getCustomersWithEntryCount({ 
        filters: params,
        skip: 0,
        limit: 15
    });

    // For the initial batch, check active entry status
    const initialCustomersWithStatus = await Promise.all(
        customers.map(async (customer) => {
            const activeEntry = await getCustomerActionStatus(customer._id, session.user.id);
            return {
                ...customer,
                activeEntry
            };
        })
    );

    return (
        <div className="space-y-6">
            <div className="hidden sm:flex flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Customer Log
                </h1>
            </div>

            <div className="space-y-4">
                <CustomerFilters 
                    locations={filtersData.locations} 
                    isAdmin={session.user.role === "admin"} 
                />
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
                        Please add customers in the "Customers" tab first or adjust your search.
                    </p>
                </div>
            )}
        </div>
    );
}
