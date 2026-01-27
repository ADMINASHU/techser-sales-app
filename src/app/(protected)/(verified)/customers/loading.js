import CustomerCardSkeleton from "@/components/skeletons/CustomerCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Search/Filter Bar Skeleton */}
      <Skeleton className="h-14 w-full rounded-xl" />

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CustomerCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
