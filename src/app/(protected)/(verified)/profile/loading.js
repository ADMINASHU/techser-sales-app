import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
    return (
        <div className="max-w-5xl mx-auto space-y-4">
            {/* Header Card Skeleton */}
            <div className="relative overflow-hidden rounded-2xl glass-card p-5 md:p-8">
                <div className="relative z-10 flex flex-row items-center gap-4 md:gap-8">
                    {/* Avatar Skeleton */}
                    <div className="relative shrink-0">
                        <Skeleton className="h-20 w-20 md:h-32 md:w-32 rounded-full bg-white/5" />
                    </div>

                    {/* Info Skeleton */}
                    <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
                        <Skeleton className="h-8 md:h-10 w-48 md:w-64 bg-white/5 rounded-lg" />
                        <Skeleton className="h-4 md:h-5 w-32 md:w-40 bg-white/5 rounded-full" />

                        {/* Location/Branch Skeleton */}
                        <Skeleton className="h-6 w-38 bg-white/5 rounded-full mt-2" />
                    </div>

                    {/* Action Skeleton */}
                    <div className="shrink-0 absolute top-0 right-0 md:static">
                        <Skeleton className="h-9 w-9 md:h-10 md:w-32 rounded-full md:rounded-lg bg-white/5" />
                    </div>
                </div>
            </div>

            {/* Details Grid Skeleton */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Contact Skeleton */}
                <div className="glass-panel p-6 md:p-8 rounded-2xl md:rounded-3xl space-y-6 md:space-y-8 bg-white/5">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-lg bg-white/10" />
                        <Skeleton className="h-6 w-48 bg-white/10" />
                    </div>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-24 bg-white/10" />
                                <Skeleton className="h-6 w-full bg-white/5" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-24 bg-white/10" />
                                <Skeleton className="h-6 w-full bg-white/5" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-32 bg-white/10" />
                            <Skeleton className="h-6 w-3/4 bg-white/5" />
                        </div>
                    </div>
                </div>

                {/* Work Skeleton */}
                <div className="glass-panel p-6 md:p-8 rounded-2xl md:rounded-3xl space-y-6 md:space-y-8 bg-white/5">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-lg bg-white/10" />
                        <Skeleton className="h-6 w-40 bg-white/10" />
                    </div>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-28 bg-white/10" />
                                <Skeleton className="h-6 w-full bg-white/5" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-24 bg-white/10" />
                                <Skeleton className="h-6 w-full bg-white/5" />
                            </div>
                        </div>

                        {/* Split for Account Type with Badge Skeleton */}
                        <div className="pt-4 border-t border-white/5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-28 bg-white/10" />
                                    <Skeleton className="h-6 w-32 bg-white/5 rounded-full" /> {/* Badge shape */}
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-28 bg-white/10" />
                                    <Skeleton className="h-4 w-24 bg-white/5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
