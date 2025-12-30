"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RefreshStatusButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRefresh = async () => {
        setLoading(true);
        // router.refresh() will re-run the server component (VerificationPendingPage)
        // which will then check the DB and redirect if verified.
        router.refresh();
        
        // Give it a moment to re-render
        setTimeout(() => {
            setLoading(false);
            toast.info("Status updated");
        }, 1000);
    };

    return (
        <Button 
            onClick={handleRefresh} 
            disabled={loading}
            variant="outline"
            className="mt-6 w-full max-w-[200px] border-white/10 bg-white/5 hover:bg-white/10 text-gray-300"
        >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Checking..." : "Refresh Status"}
        </Button>
    );
}
