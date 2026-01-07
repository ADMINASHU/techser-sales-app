import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { getSystemStats, getRawEntries, getFilters } from "@/app/actions/reportActions";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect("/login");

    
    // Redirect non-admins to Customer Log
    if (session.user.role !== "admin") {
        redirect("/customer-log");
    }
    
    await dbConnect();
    // If Admin, show Admin Dashboard
  
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const [systemStats, recentEntries, initialMonthlyEntries, filters] = await Promise.all([
            getSystemStats(),
            getRawEntries({ limit: 9 }),
            getRawEntries({ startDate: startOfMonth, endDate: endOfMonth }),
            getFilters()
        ]);

        return <AdminDashboard
            initialSystemStats={systemStats}
            initialRecentEntries={recentEntries}
            initialMonthlyEntries={initialMonthlyEntries}
            initialFilters={filters}
            currentUserRegion={session.user.region}
        />;
    
}
