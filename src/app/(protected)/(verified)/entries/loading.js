import EntriesSkeleton from "@/components/skeletons/EntriesSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="hidden sm:flex flex-row items-center justify-between gap-4">
                <Skeleton className="h-10 w-48" />
            </div>

            {/* Filter Component Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>

            {/* Entry List Skeleton */}
            <EntriesSkeleton />
        </div>
    );
}
