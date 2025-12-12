import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import { redirect } from "next/navigation";
import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect("/login");

    await dbConnect();

    // If Admin, show Admin Dashboard
    if (session.user.role === "admin") {
        return <AdminDashboard />;
    }

    // Default User Dashboard Logic
    // Fetch data for the logged-in user
    const totalEntries = await Entry.countDocuments({ userId: session.user.id });
    const completedEntries = await Entry.countDocuments({ userId: session.user.id, status: "Completed" });
    const recentEntries = await Entry.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(5);

    return (
        <UserDashboard 
            totalEntries={totalEntries} 
            completedEntries={completedEntries} 
            recentEntries={recentEntries} 
        />
    );
}
