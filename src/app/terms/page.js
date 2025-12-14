"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#0b0f19] text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>

                <div className="space-y-4">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                        Terms of Service
                    </h1>
                    <p className="text-gray-400">Last updated: December 14, 2025</p>
                </div>

                <Card className="bg-[#1e293b]/50 border-white/5 backdrop-blur-sm">
                    <CardContent className="p-6 md:p-8 space-y-6 text-gray-300">
                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-white">1. Agreement to Terms</h2>
                            <p>
                                By accessing or using our website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-white">2. Use License</h2>
                            <p>
                                Permission is granted to temporarily download one copy of the materials (information or software) on Techser Sales Management's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-white">3. Disclaimer</h2>
                            <p>
                                The materials on Techser Sales Management's website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-white">4. Limitations</h2>
                            <p>
                                In no event shall Techser Sales Management or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
