"use client";

import { resetPassword } from "@/app/actions/passwordActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock } from "lucide-react";

import { use } from "react";

export default function ResetPasswordPage({ params }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { token } = use(params);

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
        <div className="w-full flex flex-col items-center justify-center p-4">
            {/* Logo Section */}
            <div className="mb-8 flex flex-col items-center">
                <div className="flex items-center justify-center mb-6">
                    <Image
                        src="/logo.png"
                        alt="Techser Logo"
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="w-auto object-contain"
                        style={{ width: 'auto', height: '5rem' }}
                        priority
                        unoptimized
                    />
                </div>
                <p className="text-gray-400 text-sm">Enter your new password below</p>
            </div>

            <div className="w-full max-w-sm">
                <form action={clientAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-300">New Password</Label>
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

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 text-base bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-fuchsia-500/20 border-0"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </Button>
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
