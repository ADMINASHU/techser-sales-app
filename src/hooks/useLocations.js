"use client";

import { useState, useEffect } from "react";
import { getLocations } from "@/app/actions/settingsActions";

export function useLocations(initialRegion = "", initialBranch = "") {
  const [locations, setLocations] = useState([]);
  const [availableBranches, setAvailableBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocations().then((data) => {
      setLocations(data);
      setLoading(false);
    });
  }, []);

  const getBranchesForRegion = (regionName) => {
    const loc = locations.find((l) => l.name === regionName);
    return loc ? [...loc.branches].sort() : [];
  };

  return {
    locations,
    availableBranches: getBranchesForRegion(initialRegion),
    getBranchesForRegion,
    loading,
  };
}
