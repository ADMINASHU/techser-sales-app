"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Protected Route Error:", error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-100px)] w-full flex-col items-center justify-center gap-4 text-center p-4">
      <div className="p-4 rounded-full bg-red-500/10 mb-2">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-white">Something went wrong!</h2>
      <p className="text-gray-400 max-w-md">
        We encountered an error while loading this page. This might be a
        temporary connection issue.
      </p>
      <div className="flex gap-4 mt-4">
        <Button
          onClick={() => reset()}
          className="bg-white/10 hover:bg-white/20 text-white"
        >
          Try Again
        </Button>
        <Button
          variant="outline"
          className="border-white/10 text-gray-400 hover:text-white"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </div>
    </div>
  );
}
