import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { auth } from "@/auth";
import Providers from "@/app/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Techser Sales Management",
    description: "Sales management application",
    manifest: "/manifest.json",
};

export default async function RootLayout({ children }) {
    const session = await auth();

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <Providers session={session}>
                    {children}
                </Providers>
                <SpeedInsights />
                <Analytics />
            </body>
        </html>
    );
}
