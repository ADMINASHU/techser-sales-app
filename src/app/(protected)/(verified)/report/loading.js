import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="text-gray-400 animate-pulse">Loading Reports...</p>
      </div>
    </div>
  );
}
