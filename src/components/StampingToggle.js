"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toggleStamping } from "@/app/actions/userActions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, MapPinOff } from "lucide-react";

export default function StampingToggle({ initialEnabled }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const { update } = useSession();
  const router = useRouter();

  const handleToggle = async (checked) => {
    setIsLoading(true);
    try {
      const result = await toggleStamping(checked);
      if (result.success) {
        setEnabled(checked);
        // Force session update to reflect change in Navbar
        await update({ enableStamping: checked });
        // Refresh page data and layout
        router.refresh();
        toast.success(`Stamping action ${checked ? "enabled" : "disabled"}`);
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred while updating status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-white/10 shadow-xl max-w-2xl bg-slate-900/40 backdrop-blur-md">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
          >
            {enabled ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <MapPinOff className="w-6 h-6" />
            )}
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="stamping-toggle"
              className="text-lg font-bold text-white cursor-pointer"
            >
              Enable Stamping Action
            </Label>
            <p className="text-sm text-gray-400 leading-relaxed">
              When enabled, you can access Stamp In/Out and Customer management.
              Disabling this hides these pages from your navigation.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isLoading && (
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest animate-pulse">
              Updating...
            </span>
          )}
          <Switch
            id="stamping-toggle"
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={isLoading}
            className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700"
          />
        </div>
      </div>
    </div>
  );
}
