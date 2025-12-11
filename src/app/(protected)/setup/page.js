"use client";

import { useSession } from "next-auth/react";
import { updateProfile } from "@/app/actions/userActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfileSetupPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function clientAction(formData) {
        setLoading(true);
        const res = await updateProfile(formData);
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Profile updated!");
            // Trigger session update if needed, though session usually stale.
            // Force redirect to check layout logic again
            router.push("/dashboard");
            router.refresh();
        }
    }

    return (
        <div className="flex justify-center items-center py-12">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Complete Your Profile</CardTitle>
                    <CardDescription>
                        Please provide additional details to finish setting up your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={clientAction}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="contactNumber">Contact Number</Label>
                                <Input id="contactNumber" name="contactNumber" placeholder="+123..." required />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" name="address" placeholder="123 Main St" required />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="region">Region</Label>
                                <Input id="region" name="region" placeholder="E.g., North, NY" required />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="branch">Branch</Label>
                                <Input id="branch" name="branch" placeholder="Main Branch" required />
                            </div>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Saving..." : "Save & Continue"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
