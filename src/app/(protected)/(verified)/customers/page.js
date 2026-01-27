import { auth } from "@/auth";
import { getCustomers } from "@/app/actions/customerActions";
import { getFilters } from "@/app/actions/reportActions";
import CustomerPageClient from "@/components/CustomerPageClient";
import { redirect } from "next/navigation";

export default async function CustomersPage({ searchParams }) {
  const session = await auth();
  if (session?.user?.role === "admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;

  // Server-side fetch initially (Parallelized)
  const [{ customers, hasMore }, filtersData] = await Promise.all([
    getCustomers({ filters: params, skip: 0, limit: 18 }),
    getFilters(),
  ]);

  return (
    <CustomerPageClient
      initialCustomers={customers}
      initialHasMore={hasMore}
      locations={filtersData.locations}
      isAdmin={session.user.role === "admin"}
      user={session.user}
      searchParams={params}
    />
  );
}
