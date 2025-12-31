
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerCardSkeleton() {
    return (
        <div className="glass-card p-4 rounded-xl relative overflow-hidden">
            {/* Header: Name and Visits */}
            <div className="flex justify-between items-start mb-2 gap-4">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-16 rounded-md" />
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 mb-2">
                <Skeleton className="h-4 w-4 mt-1 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-4">
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>
        </div>
    );
}
