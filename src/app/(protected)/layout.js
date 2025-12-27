import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import KnockClientProvider from "@/components/KnockClientProvider";

export default async function ProtectedLayout({ children }) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <KnockClientProvider session={session}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
                <Navbar />
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full flex-grow">
                    {children}
                </main>
                <Footer />
            </div>
        </KnockClientProvider>
    );
}
