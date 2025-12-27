import { Skeleton } from "@/components/ui/skeleton";

export default function EntriesSkeleton() {
    return (
        <div className="space-y-4">
            {/* Group Header Skeleton */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="h-px flex-1 bg-white/5"></div>
                </div>
                {/* Cards Grid Skeleton */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="glass-card p-4 rounded-xl h-[280px] flex flex-col space-y-4">
                            {/* Card Header */}
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                            
                            {/* Address Lines */}
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>

                            {/* Footer */}
                            <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
