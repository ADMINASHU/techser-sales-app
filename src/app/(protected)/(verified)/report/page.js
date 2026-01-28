import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFilters } from "@/app/actions/reportActions";
import { getAdminCustomerAnalytics } from "@/app/actions/adminCustomerActions";
import AdminCustomerTable from "@/components/AdminCustomerTable";
import { Suspense } from "react";
import ReportSkeleton from "@/components/ReportSkeleton";

export default async function AdminCustomersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "admin";
  const isSuperUser = session.user.role === "super_user";
  const isAdminOrSuper = isAdmin || isSuperUser;

  // Initial Data Load (Default: Current Month/Year)
  const now = new Date();
  // For non-admin/non-super, userId='all' will be overridden by the server action to be their ID
  const userIdFilter = isAdminOrSuper ? "all" : session.user.id;

  const [filtersData, initialData] = await Promise.all([
    getFilters(),
    getAdminCustomerAnalytics({
      filters: {
        month: now.getMonth().toString(),
        year: now.getFullYear().toString(),
        region: session.user.region || "all",
        branch: "all",
        userId: userIdFilter,
      },
      skip: 0,
      limit: 30,
    }),
  ]);

  let cleanFilters;

  if (isAdminOrSuper) {
    // Filter out admin users from the user list so the dropdown only shows standard users
    const nonAdminUsers = filtersData.users.filter(
      (u) => u.role !== "admin" && u.role !== "super_user",
    );
    cleanFilters = {
      ...filtersData,
      users: nonAdminUsers,
    };
  } else {
    // Non-admin: Don't show options for other users or regions
    cleanFilters = {
      users: [],
      locations: [],
    };
  }

  return (
    <div className="space-y-6">
      <div className="hidden sm:flex flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
          {isAdminOrSuper ? "Report" : "My Report"}
        </h1>
      </div>
      <Suspense fallback={<ReportSkeleton />}>
        <AdminCustomerTable
          initialCustomers={initialData.customers}
          initialHasMore={initialData.hasMore}
          locations={cleanFilters}
          isRestricted={!isAdminOrSuper}
          session={session}
          defaultMonth={now.getMonth().toString()}
          defaultYear={now.getFullYear().toString()}
        />
      </Suspense>
    </div>
  );
}
