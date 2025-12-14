"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { register } from "@/app/actions/authActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User } from "lucide-react";
import Image from "next/image";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            className="w-full h-11 text-base glass-btn-primary"
            disabled={pending}
        >
            {pending ? "Creating Account..." : "Register →"}
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
        <div className="w-full flex flex-col items-center justify-center p-4">
            {/* Logo Section */}
            <div className="mb-8 flex flex-col items-center">
                <div className="flex items-center justify-center mb-6">
                    <Image
                        src="/logo.png"
                        alt="Techser Logo"
                        width={280}
                        height={80}
                        className="h-20 w-auto object-contain"
                        priority
                        unoptimized
                    />
                </div>
                <p className="text-gray-400 text-sm">Join Techser Sales Management System</p>
            </div>

            <div className="w-full max-w-md">
                <form action={clientAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300">Display Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                            <Input id="name" name="name" placeholder="John Doe" className="pl-10 h-11 glass-inputs" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                            <Input id="email" name="email" type="email" placeholder="m@example.com" className="pl-10 h-11 glass-inputs" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-300">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                            <Input id="password" name="password" type="password" placeholder="•••••••" className="pl-10 h-11 glass-inputs" required />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}

                    <SubmitButton />
                </form>

                <div className="mt-8 text-center text-sm">
                    <span className="text-gray-400">Already have an account? </span>
                    <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline">
                        Login here
                    </Link>
                </div>

            </div>
        </div>
    );
}
