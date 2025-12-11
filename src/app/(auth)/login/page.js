"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { authenticate, googleLogin } from "@/app/actions/authActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
        </Button>
    );
}

export default function LoginPage() {
    const [error, setError] = useState("");
    const router = useRouter();

    async function clientAction(formData) {
        const result = await authenticate(undefined, formData);
        if (result) {
            setError(result);
            toast.error(result);
        } else {
            // Success (redirect handled by middleware or action return if updated)
            // Usually server action redirects or we redirect here if needed.
            // authenticate calls `signIn`, which redirects by default.
        }
    }

    return (
        <Card className="w-[350px] shadow-lg">
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={clientAction}>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <SubmitButton />
                    </div>
                </form>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>
                <form action={googleLogin}>
                    <Button variant="outline" type="submit" className="w-full">
                        Google
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Link href="/register" className="text-sm text-blue-600 hover:underline">
                    Don't have an account? Sign Up
                </Link>
            </CardFooter>
        </Card>
    );
}
