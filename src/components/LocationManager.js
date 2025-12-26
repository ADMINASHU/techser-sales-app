"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Trash2, Check, MapPin, Map } from "lucide-react";
import { toast } from "sonner";
import { addRegion, removeRegion, addBranch, removeBranch } from "@/app/actions/settingsActions";

export default function LocationManager({ initialLocations }) {
    const [locations, setLocations] = useState(initialLocations);
    const [selectedRegion, setSelectedRegion] = useState(locations.length > 0 ? locations[0] : null);

    // Add Mode States
    const [isAddingRegion, setIsAddingRegion] = useState(false);
    const [isAddingBranch, setIsAddingBranch] = useState(false);

    // Input States
    const [newRegionName, setNewRegionName] = useState("");
    const [newBranchName, setNewBranchName] = useState("");

    const [loading, setLoading] = useState(false);

    // Update selected region when locations change (e.g. after adding a branch)
    useEffect(() => {
        if (selectedRegion) {
            const updated = locations.find(l => l._id === selectedRegion._id);
            if (updated) setSelectedRegion(updated);
            else if (locations.length > 0) setSelectedRegion(locations[0]);
            else setSelectedRegion(null);
        } else if (locations.length > 0) {
            setSelectedRegion(locations[0]);
        }
    }, [locations]);

    const handleAddRegion = async () => {
        if (!newRegionName.trim()) return;
        setLoading(true);
        const result = await addRegion(newRegionName);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Region added");
            // Reload to get properly synced state (including new ID)
            window.location.reload();
        }
        setLoading(false);
        setNewRegionName("");
        setIsAddingRegion(false);
    };

    const handleRemoveRegion = async (id, name, e) => {
        e.stopPropagation(); // Prevent selection
        if (!confirm(`Delete Region "${name}" and all its branches?`)) return;
        setLoading(true);
        const result = await removeRegion(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            const newLocations = locations.filter(l => l._id !== id);
            setLocations(newLocations);
            if (selectedRegion?._id === id) {
                setSelectedRegion(newLocations.length > 0 ? newLocations[0] : null);
            }
            toast.success("Region deleted");
        }
        setLoading(false);
    };

    const handleAddBranch = async () => {
        if (!selectedRegion || !newBranchName.trim()) return;
        setLoading(true);
        const result = await addBranch(selectedRegion._id, newBranchName);
        if (result.error) {
            toast.error(result.error);
        } else {
            setLocations(locations.map(l => {
                if (l._id === selectedRegion._id) {
                    return { ...l, branches: [...l.branches, newBranchName.trim()] };
                }
                return l;
            }));
            toast.success("Branch added");
            setNewBranchName("");
            setIsAddingBranch(false);
        }
        setLoading(false);
    };

    const handleRemoveBranch = async (branchName) => {
        if (!selectedRegion) return;
        if (!confirm(`Remove branch "${branchName}"?`)) return;
        setLoading(true);
        const result = await removeBranch(selectedRegion._id, branchName);
        if (result.error) {
            toast.error(result.error);
        } else {
            setLocations(locations.map(l => {
                if (l._id === selectedRegion._id) {
                    return { ...l, branches: l.branches.filter(b => b !== branchName) };
                }
                return l;
            }));
            toast.success("Branch removed");
        }
        setLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[calc(100vh-200px)] min-h-[500px]">
            {/* Left Column: Regions List */}
            <div className="glass-panel border-white/5 rounded-xl flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <Map className="w-5 h-5 text-violet-400" />
                        <h3 className="font-semibold text-white">Regions</h3>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsAddingRegion(true)}
                        className={isAddingRegion ? "bg-violet-500/20 text-violet-300" : "text-gray-400 hover:text-white hover:bg-white/5"}
                    >
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {isAddingRegion && (
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 animate-in slide-in-from-top-2">
                            <Input
                                autoFocus
                                placeholder="Region Name"
                                value={newRegionName}
                                onChange={(e) => setNewRegionName(e.target.value)}
                                className="mb-2 bg-black/20 border-white/10 text-white h-8 text-sm"
                                onKeyDown={(e) => e.key === "Enter" && handleAddRegion()}
                            />
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:bg-red-500/10" onClick={() => setIsAddingRegion(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-400 hover:bg-green-500/10" onClick={handleAddRegion}>
                                    <Check className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {locations.map(loc => (
                        <div
                            key={loc._id}
                            onClick={() => setSelectedRegion(loc)}
                            className={`p-3 rounded-lg cursor-pointer transition-all border group flex items-center justify-between active:scale-[0.98] active:bg-white/10 touch-manipulation min-h-[44px]
                                ${selectedRegion?._id === loc._id
                                    ? "bg-violet-500/10 border-violet-500/50 shadow-[0_0_15px_-3px_rgba(139,92,246,0.2)]"
                                    : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5 text-gray-400 hover:text-gray-200"
                                }`}
                        >
                            <span className={`font-medium ${selectedRegion?._id === loc._id ? "text-violet-200" : ""}`}>
                                {loc.name}
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                className={`h-8 w-8 p-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity ${selectedRegion?._id === loc._id ? "text-violet-300 hover:text-red-400" : "text-gray-500 hover:text-red-400"} active:opacity-100`}
                                onClick={(e) => handleRemoveRegion(loc._id, loc.name, e)}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    ))}

                    {locations.length === 0 && !isAddingRegion && (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            No regions found.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Branch Management */}
            <div className="lg:col-span-2 glass-panel border-white/5 rounded-xl flex flex-col overflow-hidden shadow-2xl relative">
                {!selectedRegion ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                        <MapPin className="w-12 h-12 mb-4 opacity-20" />
                        <p>Select a region to manage branches</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/20 uppercase tracking-widest">
                                    Region
                                </span>
                                <h3 className="text-xl font-bold text-white">{selectedRegion.name}</h3>
                            </div>
                            <Button
                                size="sm"
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                                onClick={() => setIsAddingBranch(true)}
                            >
                                    <Plus className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {isAddingBranch && (
                                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 animate-in slide-in-from-top-2 max-w-md">
                                    <h4 className="text-sm font-medium text-white mb-3">New Branch</h4>
                                    <div className="flex gap-2">
                                        <Input
                                            autoFocus
                                            placeholder="Branch Name (e.g. Koramangala)"
                                            value={newBranchName}
                                            onChange={(e) => setNewBranchName(e.target.value)}
                                            className="bg-black/20 border-white/10 text-white"
                                            onKeyDown={(e) => e.key === "Enter" && handleAddBranch()}
                                        />
                                        <Button variant="ghost" onClick={() => setIsAddingBranch(false)} className="text-gray-400 hover:text-white">Cancel</Button>
                                        <Button onClick={handleAddBranch} className="bg-violet-600 hover:bg-violet-700 text-white">Save</Button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                {selectedRegion.branches.map(branch => (
                                    <div
                                        key={branch}
                                        className="group flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 active:bg-white/20 transition-all text-sm text-gray-300 min-h-[44px]"
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                                            <span className="truncate" title={branch}>{branch}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveBranch(branch)}
                                            className="lg:opacity-0 lg:group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded text-gray-500 hover:text-red-400 transition-all active:opacity-100"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                {selectedRegion.branches.length === 0 && !isAddingBranch && (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-xl">
                                        <p>No branches yet.</p>
                                        <Button variant="link" onClick={() => setIsAddingBranch(true)} className="text-violet-400">Add your first branch</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
