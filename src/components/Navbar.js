"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
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
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { ModeToggle } from "@/components/ModeToggle";
import NotificationFeed from "@/components/NotificationFeed";

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isVerified = session?.user?.status === "verified" || session?.user?.role === "admin";
    // Admin is always verified effectively, or handles their own status.

    const links = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/entries", label: "Entry Log" },
        { href: "/profile", label: "Profile" },
    ];

    if (session?.user?.role === "admin") {
        links.push({ href: "/users", label: "Users" });
        links.push({ href: "/settings", label: "Settings" });
    }

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/dashboard" className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                Techser
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {isVerified &&
                                links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={clsx(
                                            "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                                            pathname === link.href
                                                ? "border-indigo-500 text-gray-900 dark:text-gray-100"
                                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <ModeToggle />
                        {session?.user?.id && process.env.NEXT_PUBLIC_KNOCK_FEED_ID && (
                            <div className="ml-2">
                                <NotificationFeed />
                            </div>
                        )}
                        <div className="ml-4">
                            {mounted && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={session?.user?.image} alt={session?.user?.name} />
                                                <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {session?.user?.email}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => signOut()}>
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                        <Button variant="ghost" onClick={() => setIsOpen(!isOpen)}>
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>

                {isOpen && (
                    <div className="sm:hidden">
                        <div className="pt-2 pb-3 space-y-1">
                            {isVerified &&
                                links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={clsx(
                                            "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                                            pathname === link.href
                                                ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-gray-800 dark:text-indigo-400"
                                                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                        </div>
                        <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex items-center px-4">
                                <div className="flex-shrink-0">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={session?.user?.image} alt={session?.user?.name} />
                                        <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-gray-800 dark:text-gray-100">
                                        {session?.user?.name}
                                    </div>
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {session?.user?.email}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <Button
                                    variant="ghost"
                                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => signOut()}
                                >
                                    Log out
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
