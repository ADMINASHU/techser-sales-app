"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addRegion, removeRegion, addBranch, removeBranch } from "@/app/actions/settingsActions";

export default function LocationManager({ initialLocations }) {
    const [locations, setLocations] = useState(initialLocations);
    const [newRegion, setNewRegion] = useState("");
    const [newBranch, setNewBranch] = useState({}); // { [regionId]: "" }
    const [loading, setLoading] = useState(false);

    const handleAddRegion = async () => {
        if (!newRegion.trim()) return;
        setLoading(true);
        const result = await addRegion(newRegion);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Region added");
            // Optimistic update or refetch? For simplicity, we just reload logic or mocked update
            // Since we need the ID, easiest is to refresh the page or return the new object from server.
            // But our action doesn't return the object. Let's just reload for now or trust revalidatePath.
            // Actually revalidatePath works but client state needs update. 
            // In a real app we'd return the new location. 
            // Let's manually add with a temp ID or just wait for revalidate if using a server component wrapper?
            // Since this is a client component, we rely on props. But props don't update automatically without router.refresh().
            // Let's force a refresh.
            window.location.reload(); 
        }
        setLoading(false);
    };

    const handleRemoveRegion = async (id, name) => {
        if (!confirm(`Delete Region "${name}" and all its branches?`)) return;
        setLoading(true);
        const result = await removeRegion(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            setLocations(locations.filter(l => l._id !== id));
            toast.success("Region deleted");
        }
        setLoading(false);
    };

    const handleAddBranch = async (regionId) => {
        const branchName = newBranch[regionId];
        if (!branchName?.trim()) return;
        
        setLoading(true);
        const result = await addBranch(regionId, branchName);
        if (result.error) {
            toast.error(result.error);
        } else {
            setLocations(locations.map(l => {
                if (l._id === regionId) {
                    return { ...l, branches: [...l.branches, branchName.trim()] };
                }
                return l;
            }));
            setNewBranch({ ...newBranch, [regionId]: "" });
            toast.success("Branch added");
        }
        setLoading(false);
    };

    const handleRemoveBranch = async (regionId, branchName) => {
        if (!confirm(`Remove branch "${branchName}"?`)) return;
        setLoading(true);
        const result = await removeBranch(regionId, branchName);
        if (result.error) {
            toast.error(result.error);
        } else {
            setLocations(locations.map(l => {
                if (l._id === regionId) {
                    return { ...l, branches: l.branches.filter(b => b !== branchName) };
                }
                return l;
            }));
            toast.success("Branch removed");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Region</CardTitle>
                    <CardDescription>Create a new region to manage branches under it.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Region Name"
                            value={newRegion}
                            onChange={(e) => setNewRegion(e.target.value)}
                            disabled={loading}
                        />
                        <Button onClick={handleAddRegion} disabled={loading || !newRegion.trim()}>
                            <Plus className="h-4 w-4 mr-2" /> Add Region
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {locations.map((location) => (
                    <Card key={location._id}>
                        <CardHeader className="py-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{location.name}</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleRemoveRegion(location._id, location.name)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <Accordion type="single" collapsible>
                                <AccordionItem value="branches" className="border-none">
                                    <AccordionTrigger className="py-2 hover:no-underline">
                                        <span className="text-sm font-medium">Branches ({location.branches.length})</span>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4 pt-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Add Branch"
                                                    value={newBranch[location._id] || ""}
                                                    onChange={(e) => setNewBranch({ ...newBranch, [location._id]: e.target.value })}
                                                    onKeyDown={(e) => e.key === "Enter" && handleAddBranch(location._id)}
                                                    size="sm"
                                                />
                                                <Button size="sm" onClick={() => handleAddBranch(location._id)}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                {location.branches.map((branch) => (
                                                    <div key={branch} className="flex items-center justify-between p-2 text-sm border rounded bg-secondary/20">
                                                        <span>{branch}</span>
                                                        <button
                                                            onClick={() => handleRemoveBranch(location._id, branch)}
                                                            className="text-muted-foreground hover:text-red-600 ml-2"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
