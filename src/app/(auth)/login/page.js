"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { authenticate, googleLogin } from "@/app/actions/authActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            className="w-full h-11 text-base bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-fuchsia-500/20 border-0"
            disabled={pending}
        >
            {pending ? "Signing in..." : "Login →"}
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
            // Success
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Logo Section */}
            <div className="mb-8 flex flex-col items-center">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 p-2.5 rounded-xl shadow-lg shadow-fuchsia-500/20">
                        <div className="w-6 h-6 bg-white rounded-sm opacity-90"></div>
                    </div>
                    <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Techser
                    </span>
                </div>
                <p className="text-gray-400 text-sm">Sign in to continue tracking your finances</p>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-[400px]">
                <form action={clientAction} className="space-y-4">
                    <div className="space-y-2">

                        <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="user@gmail.com"
                                className="pl-10 h-11 bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-300">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="•••••••"
                                className="pl-10 h-11 bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}

                    <SubmitButton />
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-gray-500">
                            Or continue with
                        </span>
                    </div>
                </div>

                <form action={googleLogin}>
                    <Button variant="outline" type="submit" className="w-full h-11 bg-white/5 border-white/10 hover:bg-white/10 text-white hover:text-white">
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                        Sign in with Google
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-400">Don't have an account? </span>
                    <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline">
                        Create Account
                    </Link>
                </div>

                <div className="mt-8 text-center text-xs text-gray-600">
                    © 2025 Techser. All rights reserved.
                </div>
            </div>
        </div>
    );
}
