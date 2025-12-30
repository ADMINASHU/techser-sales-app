"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { getCurrentUser } from "@/app/actions/userActions";

export default function RefreshStatusButton() {
    const { update } = useSession();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRefresh = async () => {
        setLoading(true);
        
        try {
            // 1. Re-fetch server components
            router.refresh();
            
            // 2. Explicitly update the client session
            const freshUser = await getCurrentUser();
            if (freshUser) {
                await update({ 
                    role: freshUser.role, 
                    status: freshUser.status 
                });
            }
            
            toast.success("Status updated");
        } catch (error) {
            toast.error("Failed to refresh status");
        } finally {
            setLoading(false);
        }
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
