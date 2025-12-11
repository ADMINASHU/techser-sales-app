"use client";

import { resetPassword } from "@/app/actions/passwordActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage({ params }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const token = params.token;

    async function clientAction(formData) {
        setLoading(true);
        const res = await resetPassword(token, formData);
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success(res.success);
            router.push("/login");
        }
    }

    return (
        <Card className="w-[350px] shadow-lg">
            <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>
                    Enter your new password below.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={clientAction}>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="password">New Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Link href="/login" className="text-sm text-blue-600 hover:underline">
                    Back to Login
                </Link>
            </CardFooter>
        </Card>
    );
}
