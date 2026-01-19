"use client";

import { useState, useEffect } from "react";
import CustomerCard from "@/components/CustomerCard";
import { getCustomers } from "@/app/actions/customerActions";
import { Loader2 } from "lucide-react";
import { VirtuosoGrid } from "react-virtuoso";

const ListFooter = ({ context }) => {
    const { loading, hasMore } = context;
    return loading && hasMore ? (
        <div className="flex justify-center p-4 col-span-full">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
    ) : null;
};

export default function InfiniteCustomerList({ initialCustomers, initialHasMore, searchParams, isAdmin, onEdit }) {
    const [customers, setCustomers] = useState(initialCustomers);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setCustomers(initialCustomers);
        setHasMore(initialHasMore);
        setLoading(false);
    }, [searchParams, initialCustomers, initialHasMore]);

    const loadMore = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        const currentSkip = customers.length;
        const limit = 10; // Reduced limit for better performance

        try {
            const { customers: newCustomers, hasMore: moreAvailable } = await getCustomers({
                filters: searchParams,
                skip: currentSkip,
                limit
            });

            if (newCustomers.length > 0) {
                setCustomers(prev => {
                    const existingIds = new Set(prev.map(c => c._id));
                    const uniqueNew = newCustomers.filter(c => !existingIds.has(c._id));
                    return [...prev, ...uniqueNew];
                });
                setHasMore(moreAvailable);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error("Failed to load more customers", err);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    return (
          <div className="pb-20 h-full min-h-[500px]">
            {/* Entry List (Grid View) */}
            <div className="h-full">
            {customers.length === 0 ? (
                <EmptyCustomerState />
            ) : (
                <VirtuosoGrid
                    useWindowScroll
                    data={customers}
                    endReached={loadMore}
                    overscan={200}
                    context={{ loading, hasMore }}
                    components={{
                        Footer: ListFooter
                    }}
                    itemContent={(index, customer) => (
                        <div className="h-full">
                            <CustomerCard
                                customer={customer}
                                isAdmin={isAdmin}
                                onEdit={onEdit}
                            />
                        </div>
                    )}
                    listClassName="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-20"
                />
            )}
               </div>

            {!hasMore && customers.length > 0 && (
                <div className="flex flex-col items-center justify-center py-8 opacity-50">
                    <div className="w-12 h-1 bg-white/10 rounded-full mb-3" />
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">No more customers</p>
                </div>
            )}
        </div>
    );
}

function EmptyCustomerState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center glass-panel rounded-xl border border-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No customers found</h3>
            <p className="text-gray-400 max-w-sm">
                Try adjusting your filters or add a new customer to get started.
            </p>
        </div>
    );
}