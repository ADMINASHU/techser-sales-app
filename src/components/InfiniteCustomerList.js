"use client";

import { useState, useEffect } from "react";
import CustomerCard from "@/components/CustomerCard";
import { getCustomers } from "@/app/actions/customerActions";
import { Loader2 } from "lucide-react";
import { VirtuosoGrid } from "react-virtuoso";

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

    const Footer = () => {
        return loading && hasMore ? (
            <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
        ) : null;
    };

    return (
        <div className="h-full min-h-[500px]"> 
            {customers.length === 0 ? (
                 <div className="text-center py-10">
                     <p className="text-gray-500 text-sm">No customers found.</p>
                 </div>
            ) : (
                <VirtuosoGrid
                    useWindowScroll
                    data={customers}
                    endReached={loadMore}
                    components={{
                        Footer: Footer
                    }}
                    itemContent={(index, customer) => (
                        <div className="mb-6 pr-2 h-full"> {/* Added spacing */}
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
    );
}
