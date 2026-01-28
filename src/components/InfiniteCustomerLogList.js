"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import CustomerActionCard from "@/components/CustomerActionCard";
import {
  getCustomersWithEntryCount,
  getCustomerActionStatus,
} from "@/app/actions/customerActions";
import CustomerCardSkeleton from "@/components/skeletons/CustomerCardSkeleton";

export default function InfiniteCustomerLogList({
  initialCustomers,
  initialHasMore,
  searchParams,
  userId,
}) {
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
      const limit = 15;

      try {
        const { customers: newCustomers, hasMore: moreAvailable } =
          await getCustomersWithEntryCount({
            filters: searchParams,
            skip: currentSkip,
            limit,
            activeOnly: true, // Only load active customers on stamp-in page
          });

        if (newCustomers.length > 0) {
          // For each new customer, we need to fetch their action status
          // Parallelize fetching action status for new customers
          const newCustomersWithStatus = await Promise.all(
            newCustomers.map(async (customer) => {
              const activeEntry = await getCustomerActionStatus(
                customer._id,
                userId,
              );
              return { ...customer, activeEntry };
            }),
          );

          setCustomers((prev) => {
            const existingIds = new Set(prev.map((c) => c._id));
            const uniqueNew = newCustomersWithStatus.filter(
              (c) => !existingIds.has(c._id),
            );
            return [...prev, ...uniqueNew];
          });
          setHasMore(moreAvailable);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Failed to load more customer logs", err);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    if (inView) {
      loadMore();
    }
  }, [inView, hasMore, loading, customers.length, searchParams, userId]);

  // Check if any customer is currently stamped in
  const hasActiveStampIn = customers.some(
    (customer) => customer.activeEntry?.status === "In Process",
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <CustomerActionCard
            key={customer._id}
            customer={customer}
            activeEntry={customer.activeEntry}
            userId={userId}
            hasActiveStampIn={hasActiveStampIn}
          />
        ))}
      </div>

      {/* Loading Indicator / Observer Target */}
      <div ref={ref}>
        {loading || hasMore ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {[1, 2, 3].map((i) => (
              <CustomerCardSkeleton key={i} />
            ))}
          </div>
        ) : null}
      </div>

      {!hasMore && customers.length > 0 && (
        <p className="text-center text-xs text-gray-500 py-4">
          No more customers
        </p>
      )}
    </div>
  );
}
