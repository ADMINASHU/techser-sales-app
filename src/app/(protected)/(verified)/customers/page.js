import { auth } from "@/auth";
import { getCustomers } from "@/app/actions/customerActions";
import { getFilters } from "@/app/actions/reportActions";
import CustomerPageClient from "@/components/CustomerPageClient";

export default async function CustomersPage({ searchParams }) {
    const session = await auth();
    const params = await searchParams;
    
    // Server-side fetch initially
    const { customers, hasMore } = await getCustomers({ filters: params, skip: 0, limit: 18 });
    const filtersData = await getFilters();

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
