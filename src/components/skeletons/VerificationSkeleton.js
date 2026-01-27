import { Skeleton } from "@/components/ui/skeleton";

export default function VerificationSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-5 px-4 min-h-[70vh]">
      <div className="w-full max-w-lg bg-[#0A0A0B] border border-white/10 shadow-2xl rounded-xl overflow-hidden p-8 space-y-6 flex flex-col items-center">
        <Skeleton className="h-20 w-20 rounded-full" /> {/* Icon */}
        <div className="space-y-2 text-center w-full flex flex-col items-center">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="w-full space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
