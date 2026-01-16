import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import Providers from "@/app/providers";

const inter = Inter({ 
    subsets: ["latin"],
    display: 'swap', // Improve FCP by swapping font quickly
    preload: true,
});

export const metadata = {
    title: "Techser Sales Management",
    description: "Sales management application",
    manifest: "/manifest.json",
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Prevents zooming on inputs
};

export default async function RootLayout({ children }) {
    const session = await auth();

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <Providers session={session}>
                    {children}
                </Providers>
             
            </body>
        </html>
    );
}
