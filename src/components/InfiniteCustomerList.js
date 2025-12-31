"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import CustomerCard from "@/components/CustomerCard";
import { getCustomers } from "@/app/actions/customerActions";
import { Loader2 } from "lucide-react";

export default function InfiniteCustomerList({ initialCustomers, initialHasMore, searchParams, isAdmin, onEdit }) {
    const [customers, setCustomers] = useState(initialCustomers);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);

    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: false,
    });

    useEffect(() => {
        setCustomers(initialCustomers);
        setHasMore(initialHasMore);
        setLoading(false);
    }, [searchParams, initialCustomers, initialHasMore]);

    useEffect(() => {
        const loadMore = async () => {
            if (loading || !hasMore) return;

            setLoading(true);
            const currentSkip = customers.length;
            const limit = 18;

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

        if (inView) {
            loadMore();
        }
    }, [inView, hasMore, loading, customers.length, searchParams]);

    return (
        <div className="space-y-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {customers.map((customer) => (
                    <CustomerCard
                        key={customer._id}
                        customer={customer}
                        isAdmin={isAdmin}
                        onEdit={onEdit}
                    />
                ))}
            </div>

            {/* Loading Indicator / Observer Target */}
            {hasMore && (
                <div ref={ref} className="flex justify-center p-4">
                    {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    ) : (
                        <div className="h-4" /> // Invisible target
                    )}
                </div>
            )}

            {!hasMore && customers.length > 0 && (
                <p className="text-center text-xs text-gray-500 py-4">No more customers</p>
            )}
        </div>
    );
}
