"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-white/5 bg-gray-950 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-4">
                    <Image
                        src="/logo.png"
                        alt="Techser Logo"
                        width={120}
                        height={24}
                        className="h-6 w-auto object-contain opacity-80"
                        unoptimized
                    />
                    {/* <span className="font-semibold text-gray-300">Techser Sales Management</span> */}
                    <span className="hidden md:inline text-gray-600">|</span>
                    <span>&copy; {currentYear} Techser. All rights reserved.</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/releases" className="hover:text-white transition-colors">beta v{process.env.NEXT_PUBLIC_APP_VERSION}</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    <Link href="/support" className="hover:text-white transition-colors">Support</Link>
                </div>
            </div>
        </footer>
    );
}
