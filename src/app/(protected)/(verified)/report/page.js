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

  // Fetch initial filters data
  // If user is not admin, we don't need all users/locations for filters, but we fetch to filter them out safely or pass empty
  const filtersData = await getFilters();

  let cleanFilters;

  if (isAdmin) {
    // Filter out admin users from the user list so the dropdown only shows standard users
    const nonAdminUsers = filtersData.users.filter((u) => u.role !== "admin");
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

  // Initial Data Load (Default: Current Month/Year)
  const now = new Date();

  // For non-admin, userId='all' will be overridden by the server action to be their ID
  const userIdFilter = isAdmin ? "all" : session.user.id;

  const initialData = await getAdminCustomerAnalytics({
    filters: {
      month: now.getMonth().toString(),
      year: now.getFullYear().toString(),
      region: "all",
      branch: "all",
      userId: userIdFilter,
    },
    skip: 0,
    limit: 30,
  });

  return (
    <div className="space-y-6">
      <div className="hidden sm:flex flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
          {isAdmin ? "Report" : "My Report"}
        </h1>
      </div>
      <Suspense fallback={<ReportSkeleton />}>
        <AdminCustomerTable
          initialCustomers={initialData.customers}
          initialHasMore={initialData.hasMore}
          locations={cleanFilters}
          isRestricted={!isAdmin}
        />
      </Suspense>
    </div>
  );
}
