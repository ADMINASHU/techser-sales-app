"use client";

import { requestPasswordReset } from "@/app/actions/passwordActions";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";

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
        <div className="w-full flex flex-col items-center justify-center p-4">
            {/* Logo Section */}
            <div className="mb-8 flex flex-col items-center">
                <div className="flex items-center justify-center mb-6">
                    <Image
                        src="/logo.png"
                        alt="Techser Logo"
                        width={300}
                        height={80}
                        className="w-auto h-20 object-contain"
                        style={{ height: '80px', width: 'auto' }}
                        priority
                        unoptimized
                    />
                </div>
                <p className="text-gray-400 text-sm">Reset your password to regain access</p>
            </div>

            <div className="w-full max-w-sm">
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

                    <LoadingButton
                        type="submit"
                        loading={loading}
                        className="w-full h-11 text-base bg-linear-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-fuchsia-500/20 border-0"
                    >
                        Send Reset Link
                    </LoadingButton>
                </form>

                <div className="mt-6 text-center text-sm">
                    <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
