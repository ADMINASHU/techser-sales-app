"use client";
import { SessionProvider } from "next-auth/react";
import KnockClientProvider from "@/components/KnockClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children, session }) {
    return (
        <SessionProvider session={session}>
            <KnockClientProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    forcedTheme="dark"
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster />
                </ThemeProvider>
            </KnockClientProvider>
        </SessionProvider>
    );
}
