import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header Card Skeleton */}
      <div className="glass-panel p-5 md:p-8 rounded-2xl relative overflow-hidden">
        <div className="flex flex-row items-center gap-4 md:gap-8 relative z-10">
          <Skeleton className="h-20 w-20 md:h-32 md:w-32 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48 md:w-64" />
            <Skeleton className="h-5 w-32 rounded-full" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-6 w-40 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-10 md:w-32 rounded-full md:rounded-lg" />
        </div>
      </div>

      {/* Details Grid Skeleton */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-panel p-6 md:p-8 rounded-2xl h-64 space-y-6">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <div className="glass-panel p-6 md:p-8 rounded-2xl h-64 space-y-6">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
