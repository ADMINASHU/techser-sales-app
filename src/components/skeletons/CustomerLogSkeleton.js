
import { Skeleton } from "@/components/ui/skeleton";
import CustomerCardSkeleton from "./CustomerCardSkeleton";

export default function CustomerLogSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="hidden sm:flex flex-row items-center justify-between gap-4">
                <Skeleton className="h-10 w-40" /> {/* Title */}
            </div>

            {/* Filters Skeleton */}
            <div className="glass-panel border-white/5 rounded-xl shadow-2xl p-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between lg:w-48 lg:border-r border-white/10 pr-6">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-lg" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                        <Skeleton className="h-8 w-12" /> {/* Reset Button */}
                    </div>

                    {/* Filters Grid */}
                    <div className="flex-1 grid gap-4 grid-cols-2 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={`space-y-1.5 ${i === 3 ? "col-span-2 md:col-span-1" : ""}`}>
                                <Skeleton className="h-3 w-12 ml-1" />
                                <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Customer Cards Skeleton */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <CustomerCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
