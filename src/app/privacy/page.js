"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#0b0f19] text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>

                <div className="space-y-4">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-400">Last updated: December 14, 2025</p>
                </div>

                <Card className="bg-[#1e293b]/50 border-white/5 backdrop-blur-sm">
                    <CardContent className="p-6 md:p-8 space-y-6 text-gray-300">
                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
                            <p>
                                Welcome to Techser Sales Management ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-white">2. Data We Collect</h2>
                            <p>
                                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Identity Data: includes first name, last name, username or similar identifier.</li>
                                <li>Contact Data: includes email address and telephone numbers.</li>
                                <li>Technical Data: includes internet protocol (IP) address, your login data, browser type and version.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-white">3. How We Use Your Data</h2>
                            <p>
                                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-white">4. Data Security</h2>
                            <p>
                                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
