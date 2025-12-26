import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import { redirect } from "next/navigation";
import EntryFilters from "@/components/EntryFilters";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import UserDashboard from "@/components/UserDashboard";
import dynamicImport from "next/dynamic";
const AdminDashboard = dynamicImport(() => import("@/components/AdminDashboard"), {
    loading: () => <div className="p-8 text-center text-gray-500">Loading Admin Dashboard...</div>,
});

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }) {
    const session = await auth();
    if (!session) redirect("/login");

    await dbConnect();

    // If Admin, show Admin Dashboard
    if (session.user.role === "admin") {
        return <AdminDashboard />;
    }

    // Default User Dashboard Logic
    const params = await searchParams;
    const now = new Date();

    // Default filters
    const month = params.month !== undefined ? parseInt(params.month) : now.getMonth();
    const year = params.year !== undefined ? parseInt(params.year) : now.getFullYear();
    const status = params.status || "all";

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const query = {
        userId: session.user.id,
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    };

    if (status && status !== "all") {
        query.status = status;
    }

    // Fetch data for the logged-in user
    const [totalEntries, completedEntries, recentEntries] = await Promise.all([
        Entry.countDocuments(query),
        Entry.countDocuments({ ...query, status: "Completed" }),
        Entry.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(10)
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <Link href="/entries/new?callbackUrl=/dashboard">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Entry
                    </Button>
                </Link>
            </div>

            <EntryFilters isAdmin={false} showStatus={false} showSearch={false} />

            <UserDashboard
                totalEntries={totalEntries}
                completedEntries={completedEntries}
                recentEntries={recentEntries}
            />
        </div>
    );
}
