import { auth } from "@/auth";

import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Redirect non-admins/non-super-users to Customer Log
  if (session.user.role !== "admin" && session.user.role !== "super_user") {
    redirect("/customer-log");
  }

  const now = new Date();

  return (
    <AdminDashboard
      currentUserRegion={session.user.region}
      serverDate={now}
      session={session}
    />
  );
}
