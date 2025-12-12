"use client";

import { requestPasswordReset } from "@/app/actions/passwordActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);

    async function clientAction(formData) {
        setLoading(true);
        const res = await requestPasswordReset(formData);
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success(res.success);
        }
    }

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
                <CardTitle>Forgot Password</CardTitle>
                <CardDescription>
                    Enter your email to receive a reset link.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={clientAction}>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Sending..." : "Send Reset Link"}
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
