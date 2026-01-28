import { Suspense } from "react";
import { auth } from "@/auth";
import { getFilters } from "@/app/actions/reportActions";
import EntryFilters from "@/components/EntryFilters";
import EntryListContainer from "@/components/EntryListContainer";
import EntriesSkeleton from "@/components/skeletons/EntriesSkeleton";

export default async function EntriesPage({ searchParams }) {
  const session = await auth();

  // Fetch filter data for dropdowns (Fast query, can stay here or be moved too, but usually fast enough)
  const filtersData = await getFilters();

  const params = await searchParams;
  const isAdmin = session.user.role === "admin";
  const isSuperUser = session.user.role === "super_user";
  const isCoreAdmin = isAdmin || isSuperUser;

  return (
    <div className="space-y-6">
      <div className="hidden sm:flex flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Entry Log
        </h1>
      </div>

      {/* Filter Component */}
      <div className="space-y-4">
        <Suspense
          fallback={<div className="text-gray-400">Loading filters...</div>}
        >
          <EntryFilters
            users={filtersData.users}
            locations={filtersData.locations}
            isAdmin={isCoreAdmin}
            session={session}
            defaultRegion={isCoreAdmin ? session.user.region : undefined}
          />
        </Suspense>
      </div>

      {/* Streamed Entry List */}
      <Suspense fallback={<EntriesSkeleton />}>
        <EntryListContainer searchParams={params} session={session} />
      </Suspense>
    </div>
  );
}
