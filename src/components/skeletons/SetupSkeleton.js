import { Skeleton } from "@/components/ui/skeleton";

export default function SetupSkeleton() {
  return (
    <div className="flex justify-center items-center py-2 px-4 h-full">
      <div className="w-full max-w-xl bg-[#0A0A0B] border border-white/10 shadow-2xl overflow-hidden rounded-xl">
        <div className="p-8 space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-20 w-60 rounded-lg" /> {/* Logo */}
            <Skeleton className="h-8 w-40" /> {/* Title */}
            <Skeleton className="h-4 w-64" /> {/* Desc */}
          </div>

          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>

          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
