"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import EntryCard from "@/components/EntryCard";
import EntryTableRow from "@/components/EntryTableRow";
import { fetchEntries } from "@/app/actions/entryActions";
import { Loader2 } from "lucide-react";

export default function InfiniteEntryList({ initialEntries, searchParams, isAdmin, view = "grid" }) {
    const [entries, setEntries] = useState(initialEntries);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: false,
    });

    useEffect(() => {
        setEntries(initialEntries);
        setPage(1);
        setHasMore(initialEntries.length === 30);
        setLoading(false);
    }, [searchParams, initialEntries]);

    useEffect(() => {
        const loadMore = async () => {
            if (loading || !hasMore) return;

            setLoading(true);
            const nextPage = page + 1;

            try {
                const { entries: newEntries, hasMore: moreAvailable } = await fetchEntries({
                    page: nextPage,
                    limit: 30,
                    filters: searchParams
                });

                if (newEntries.length > 0) {
                    setEntries(prev => [...prev, ...newEntries]);
                    setPage(nextPage);
                    setHasMore(moreAvailable);
                } else {
                    setHasMore(false);
                }
            } catch (err) {
                console.error("Failed to load more entries", err);
            } finally {
                setLoading(false);
            }
        };

        if (inView) {
            loadMore();
        }
    }, [inView, hasMore, loading, page, searchParams]);

    return (
        <div className="pb-20 space-y-4">
            {/* GRID VIEW */}
            <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'hidden'}`}>
                {entries.map((entry) => (
                    <EntryCard
                        key={`${entry._id}-grid-${Math.random()}`}
                        entry={entry}
                        isAdmin={isAdmin}
                    />
                ))}
            </div>

            {/* LIST VIEW (Table) */}
            {view === 'list' && (
                <div className="rounded-xl overflow-hidden glass-panel border border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-gray-200 uppercase tracking-wider font-semibold border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {entries.map((entry) => (
                                    <EntryTableRow
                                        key={`${entry._id}-list-${Math.random()}`}
                                        entry={entry}
                                        isAdmin={isAdmin}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Loading Indicator / Observer Target */}
            {hasMore && (
                <div ref={ref} className="flex justify-center p-4">
                    {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    ) : (
                        <div className="h-4" /> // Invisible target
                    )}
                </div>
            )}

            {!hasMore && entries.length > 0 && (
                <p className="text-center text-xs text-gray-500 py-4">No more entries</p>
            )}

            {entries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center glass-panel rounded-xl">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">No entries found</h3>
                    <p className="text-gray-400 max-w-sm">
                        Try adjusting your filters or create a new entry to get started.
                    </p>
                </div>
            )}
        </div>
    );
}
