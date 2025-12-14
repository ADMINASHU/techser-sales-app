import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Techser Sales Management",
    description: "Sales management application",
    manifest: "/manifest.json",
};

import { auth } from "@/auth";
import KnockClientProvider from "@/components/KnockClientProvider";

export default async function RootLayout({ children }) {
    const session = await auth();

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <KnockClientProvider session={session}>
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
                <SpeedInsights />
                <Analytics />
            </body>
        </html>
    );
}
