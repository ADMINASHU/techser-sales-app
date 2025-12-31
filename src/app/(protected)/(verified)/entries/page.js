import { Suspense } from "react";
import { auth } from "@/auth";
import { getFilters } from "@/app/actions/reportActions";
import EntryFilters from "@/components/EntryFilters";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import ViewToggle from "@/components/ViewToggle";
import EntryListContainer from "@/components/EntryListContainer";
import EntriesSkeleton from "@/components/skeletons/EntriesSkeleton";

export default async function EntriesPage({ searchParams }) {
    const session = await auth();

    // Fetch filter data for dropdowns (Fast query, can stay here or be moved too, but usually fast enough)
    const filtersData = await getFilters();

    const params = await searchParams;
    const view = params.view || session?.user?.viewPreference || "grid";
    const isAdmin = session.user.role === "admin";

    return (
        <div className="space-y-6">
            <div className="hidden sm:flex flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">Entry Log</h1>
                {/* Hide New Entry Button for Admins */}
                {/* New Entry Button Removed as requested */}
                {/* !isAdmin && (
                    <Link href="/entries/new?callbackUrl=/entries">
                        <Button className="glass-btn-primary">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Entry
                        </Button>
                    </Link>
                ) */}
            </div>

            {/* Filter Component */}
            <div className="space-y-4">
                <Suspense fallback={<div className="text-gray-400">Loading filters...</div>}>
                    <EntryFilters
                        users={filtersData.users}
                        locations={filtersData.locations}
                        isAdmin={isAdmin}
                    />
                </Suspense>

                {/* View Toggle - Aligned Right */}
                <div className="hidden md:flex justify-end">
                    <ViewToggle />
                </div>
            </div>

            {/* Streamed Entry List */}
            <Suspense fallback={<EntriesSkeleton view={view} />}>
                <EntryListContainer 
                    searchParams={params} 
                    session={session} 
                    view={view} 
                />
            </Suspense>
        </div>
    );
}
