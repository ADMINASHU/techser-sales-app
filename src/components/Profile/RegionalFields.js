"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocations } from "@/hooks/useLocations";

export function RegionalFields({ formData, onSelectChange, setFormData }) {
  const { locations, getBranchesForRegion } = useLocations();
  const [availableBranches, setAvailableBranches] = useState([]);

  useEffect(() => {
    if (formData.region && locations.length > 0) {
      const branches = getBranchesForRegion(formData.region);
      setAvailableBranches(branches);

      // Reset branch if it's not valid for the new region
      if (formData.branch && !branches.includes(formData.branch)) {
        setFormData((prev) => ({ ...prev, branch: "" }));
      }
    }
  }, [formData.region, locations, getBranchesForRegion]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label htmlFor="region" className="text-gray-300">
          Region <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.region}
          onValueChange={(val) => onSelectChange("region", val)}
          required
        >
          <SelectTrigger className="w-full bg-[#1e293b]/50 border-white/10 text-white focus:ring-1 focus:ring-fuchsia-500/50">
            <SelectValue placeholder="Select Region" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1f2e] border-white/10 text-white">
            {locations.map((loc) => (
              <SelectItem key={loc._id} value={loc.name}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="branch" className="text-gray-300">
          Branch <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.branch}
          onValueChange={(val) => onSelectChange("branch", val)}
          disabled={!formData.region}
          required
        >
          <SelectTrigger className="w-full bg-[#1e293b]/50 border-white/10 text-white focus:ring-1 focus:ring-fuchsia-500/50 disabled:opacity-50">
            <SelectValue placeholder="Select Branch" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1f2e] border-white/10 text-white">
            {availableBranches.map((branch) => (
              <SelectItem key={branch} value={branch}>
                {branch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
