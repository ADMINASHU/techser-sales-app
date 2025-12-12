"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { addSettingValue, removeSettingValue } from "@/app/actions/settingsActions";

export default function SettingsList({ title, settingKey, initialValues }) {
    const [values, setValues] = useState(initialValues);
    const [newValue, setNewValue] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!newValue.trim()) return;
        setLoading(true);
        const result = await addSettingValue(settingKey, newValue);
        if (result.error) {
            toast.error(result.error);
        } else {
            setValues([...values, newValue.trim()]);
            setNewValue("");
            toast.success("Added successfully");
        }
        setLoading(false);
    };

    const handleRemove = async (valueToRemove) => {
        if (!confirm(`Are you sure you want to remove "${valueToRemove}"?`)) return;
        setLoading(true);
        const result = await removeSettingValue(settingKey, valueToRemove);
        if (result.error) {
            toast.error(result.error);
        } else {
            setValues(values.filter(v => v !== valueToRemove));
            toast.success("Removed successfully");
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder={`Add new ${title.toLowerCase().slice(0, -1)}`}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        disabled={loading}
                    />
                    <Button onClick={handleAdd} disabled={loading || !newValue.trim()}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="grid gap-2">
                    {values.length === 0 ? (
                         <div className="text-sm text-gray-500 italic">No {title.toLowerCase()} configured.</div>
                    ) : (
                        values.map((value) => (
                            <div key={value} className="flex items-center justify-between p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
                                <span>{value}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemove(value)}
                                    disabled={loading}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
