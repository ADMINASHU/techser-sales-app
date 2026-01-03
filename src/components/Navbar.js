"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { ModeToggle } from "@/components/ModeToggle";
import NotificationFeed from "@/components/NotificationFeed";

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);


    const isVerified = session?.user?.status === "verified" || session?.user?.role === "admin";
    // Admin is always verified effectively, or handles their own status.

    const links = [
        ...(session?.user?.role === "admin" ? [{ href: "/dashboard", label: "Dashboard" }] : []),
        ...(session?.user?.role !== "admin" ? [
            { href: "/customer-log", label: "Check-In/Out" },
            { href: "/customers", label: "Customers" }
        ] : []),
        { href: "/entries", label: "Entry Log" },
    ];

    if (session?.user?.role === "admin") {
        links.push({ href: "/users", label: "Users" });
        links.push({ href: "/settings", label: "Settings" });
    }


    return (
        <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">
                    {/* Logo */}
                    <Link href={session?.user?.role === "admin" ? "/dashboard" : "/customer-log"} className="shrink-0 flex items-center group">
                        <div className="mr-3 transition-transform group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="Techser Logo"
                                width={160}
                                height={40}
                                className="h-8 w-auto sm:h-10 object-contain"
                                style={{ width: 'auto' }}
                                priority
                                unoptimized
                            />
                        </div>
                    </Link>

                    {/* Mobile Page Title */}
                    <div className="sm:hidden absolute left-1/2 -translate-x-1/2 flex items-center h-16">
                        <span className="text-lg font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent truncate max-w-[180px]">
                            {links.find(l => l.href === pathname)?.label ||
                                (pathname === "/profile" ? "Profile" : "")}
                        </span>
                    </div>

                    <div className="hidden md:flex items-center justify-center">
                        <div className="bg-white/5 border border-white/5 rounded-full px-1.5 py-1.5 flex space-x-1 shadow-inner backdrop-blur-md">
                            {session?.user &&
                                links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={clsx(
                                            "relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                            pathname === link.href
                                                ? "text-white"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {pathname === link.href && (
                                            <div className="absolute inset-x-0 bottom-0 top-0 bg-linear-to-r from-violet-500/80 to-fuchsia-500/80 rounded-full shadow-lg shadow-fuchsia-500/20 -z-10" />
                                        )}
                                        {link.label}
                                    </Link>
                                ))}
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="hidden sm:flex items-center space-x-4">
                        {session?.user?.id && process.env.NEXT_PUBLIC_KNOCK_FEED_ID && (
                            <NotificationFeed />
                        )}
                        <div className="h-8 w-px bg-white/10 mx-2"></div>

                        {session?.user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-white/10 hover:ring-white/30 transition-all p-0 overflow-hidden">
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={session?.user?.image} alt={session?.user?.name} />
                                            <AvatarFallback className="bg-linear-to-br from-violet-500 to-fuchsia-500 text-white font-bold">
                                                {session?.user?.name
                                                    ? session.user.name.split(" ").map(n => n[0]).join("").slice(0, 2)
                                                    : "U"
                                                }
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-72 glass-card mt-2 p-2" align="end" forceMount>
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mb-2 border border-white/5">
                                        <Avatar className="h-10 w-10 border border-white/10">
                                            <AvatarImage src={session?.user?.image} />
                                            <AvatarFallback className="bg-linear-to-br from-violet-500 to-fuchsia-500 text-white font-bold">
                                                {session?.user?.name
                                                    ? session.user.name.split(" ").map(n => n[0]).join("").slice(0, 2)
                                                    : "U"
                                                }
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col space-y-0.5">
                                            <p className="text-sm font-semibold text-white">{session?.user?.name}</p>
                                            <p className="text-xs text-gray-400 truncate max-w-[150px]">{session?.user?.email}</p>
                                        </div>
                                    </div>
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer py-2.5 px-3 rounded-md hover:bg-white/10 focus:bg-white/10 focus:text-white transition-colors flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            Profile Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10 my-1" />
                                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer py-2.5 px-3 rounded-md text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400 transition-colors flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex items-center gap-2 sm:hidden">
                        {session?.user?.id && process.env.NEXT_PUBLIC_KNOCK_FEED_ID && (
                            <NotificationFeed />
                        )}
                        <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setIsOpen(!isOpen)}>
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="sm:hidden bg-[#0f1117] border-b border-white/10 absolute left-0 right-0 top-16 shadow-2xl z-50 p-4 border-t-0 rounded-b-2xl animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-1">
                            {session?.user &&
                                links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={clsx(
                                            "block px-4 py-4 rounded-xl text-base font-medium transition-all border border-transparent active:bg-white/10 active:scale-[0.98]",
                                            pathname === link.href
                                                ? "bg-white/10 text-white border-white/5 shadow-inner"
                                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                            <Link
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 active:opacity-60 transition-opacity p-2 -ml-2 rounded-lg active:bg-white/5"
                            >
                                <Avatar className="h-10 w-10 ring-2 ring-white/10">
                                    <AvatarImage src={session?.user?.image} />
                                    <AvatarFallback className="bg-linear-to-br from-violet-500 to-fuchsia-500 text-white font-bold">
                                        {session?.user?.name
                                            ? session.user.name.split(" ").map(n => n[0]).join("").slice(0, 2)
                                            : "U"
                                        }
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium text-white">{session?.user?.name}</div>
                                    <div className="text-sm text-gray-400">{session?.user?.email}</div>
                                </div>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => signOut()} className="text-red-400 hover:bg-red-500/10 hover:text-red-300 h-10 w-10 active:scale-90 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
