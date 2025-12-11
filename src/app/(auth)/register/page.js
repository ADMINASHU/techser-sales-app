"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { register } from "@/app/actions/authActions";
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
            {pending ? "Creating account..." : "create account"}
        </Button>
    );
}

export default function RegisterPage() {
    const [error, setError] = useState("");
    const router = useRouter();

    async function clientAction(formData) {
        const res = await register(formData);
        if (res?.error) {
            setError(res.error);
            toast.error(res.error);
        } else if (res?.success) {
            toast.success(res.success);
            router.push("/login");
        }
    }

    return (
        <Card className="w-[350px] shadow-lg">
            <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>
                    Create a new account to get started
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={clientAction}>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" placeholder="John Doe" required />
                        </div>
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
            </CardContent>
            <CardFooter className="flex justify-center">
                <Link href="/login" className="text-sm text-blue-600 hover:underline">
                    Already have an account? Login
                </Link>
            </CardFooter>
        </Card>
    );
}
