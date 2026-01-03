import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import KnockClientProvider from "@/components/KnockClientProvider";

export default async function ProtectedLayout({ children }) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const headersList = await headers();
    const pathname = headersList.get("x-invoke-path") || "";

    const hasProfile = session.user.contactNumber && session.user.address;
    const isSetupPage = pathname.endsWith("/setup");

    if (!hasProfile && !isSetupPage) {
        redirect("/setup");
    }
    


    return (
        <KnockClientProvider session={session}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
                <Navbar />
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full grow">
                    {children}
                </main>
                <Footer />
            </div>
        </KnockClientProvider>
    );
}
