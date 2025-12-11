import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { SessionProvider } from "next-auth/react";

export default async function ProtectedLayout({ children }) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <SessionProvider session={session}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <Navbar />
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </SessionProvider>
    );
}
