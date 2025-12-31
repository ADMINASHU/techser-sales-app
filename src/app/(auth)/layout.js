import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }) {
        const currentYear = new Date().getFullYear();
    return (
        <div className="min-h-screen w-full flex flex-col bg-[#0b0f19] text-white">
            <div className="flex-1 flex items-center justify-center p-4">
                {children}
            </div>

            <footer className="w-full py-6 px-4 border-t border-white/5 bg-[#0b0f19]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="Techser Logo"
                            width={100}
                            height={20}
                            className="h-5 w-auto object-contain opacity-80"
                            style={{ width: 'auto' }}
                            unoptimized
                        />
                        <span className="hidden md:inline text-gray-600">|</span>
                        <span>&copy; {currentYear} Techser. All rights reserved.</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/releases" className="hover:text-white transition-colors">beta v{process.env.NEXT_PUBLIC_APP_VERSION}</Link>
                        <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
