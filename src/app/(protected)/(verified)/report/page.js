import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFilters } from "@/app/actions/reportActions";
import { getAdminCustomerAnalytics } from "@/app/actions/adminCustomerActions";
import AdminCustomerTable from "@/components/AdminCustomerTable";
import { Suspense } from "react";

export default async function AdminCustomersPage() {
     const session = await auth();
    if (!session) redirect("/login");

    const isAdmin = session.user.role === "admin";

    if (!isAdmin) {
        return (
            <div className="space-y-6">
                <div className="hidden sm:flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Settings</h1>
                </div>
                <div className="p-4 border rounded-md bg-muted/50">
                    <p>No settings available for your account type.</p>
                </div>
            </div>
        );
    }

  // Fetch initial filters data
  const filtersData = await getFilters();
  
  // Filter out admin users from the user list so the dropdown only shows standard users
  const nonAdminUsers = filtersData.users.filter(u => u.role !== 'admin');
  const cleanFilters = {
      ...filtersData,
      users: nonAdminUsers
  };

  // Initial Data Load (Default: Current Month/Year)
  const now = new Date();
  const initialData = await getAdminCustomerAnalytics({
    filters: {
        month: now.getMonth().toString(),
        year: now.getFullYear().toString(),
        region: "all",
        branch: "all",
        userId: "all"
    },
    skip: 0,
    limit: 30
  });

  return (
   <div className="space-y-6">
            <div className="hidden sm:flex flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">Report</h1>
            </div>
<Suspense fallback={"...Loding"} > 
      <AdminCustomerTable
        initialCustomers={initialData.customers}
        initialHasMore={initialData.hasMore}
        locations={cleanFilters}
      />
    </Suspense>
    </div>
  );
}