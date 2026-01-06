"use client";
import { SessionProvider } from "next-auth/react";
import FCMNotificationProvider from "@/components/FCMNotificationProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children, session }) {
    return (
        <SessionProvider session={session}>
            <FCMNotificationProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    forcedTheme="dark"
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster />
                </ThemeProvider>
            </FCMNotificationProvider>
        </SessionProvider>
    );
}
