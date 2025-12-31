import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex flex-row items-center justify-between gap-4">
                <Skeleton className="h-9 w-48" /> {/* Title */}
                <Skeleton className="h-8 w-24" /> {/* Export Button */}
            </div>

            {/* Filters Section Skeleton */}
            <div className="glass-panel border-white/5 mb-8 rounded-xl shadow-2xl">
                <div className="p-4">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Header Section */}
                        <div className="flex items-center justify-between lg:w-48 lg:border-r border-white/10 pr-6">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-8 w-16" />
                        </div>

                        {/* Filters Grid */}
                        <div className="flex-1 grid gap-3 grid-cols-3 md:grid-cols-5">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="space-y-1.5">
                                    <Skeleton className="h-3 w-12 ml-1" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid gap-6 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="glass-card border-white/5 shadow-lg relative overflow-hidden h-[120px]">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-9 w-16 mb-1" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* System Stats Overview Skeleton */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="glass-card border-white/5 shadow-lg relative overflow-hidden h-[120px]">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-20 mb-1" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Entries Skeleton */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-9 w-24" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}
