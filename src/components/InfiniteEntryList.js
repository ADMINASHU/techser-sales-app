"use client";


import { useState, useEffect, useMemo, useCallback } from "react";
import EntryCard from "@/components/EntryCard";
import { fetchEntries } from "@/app/actions/entryActions";
import { Loader2 } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { format, isToday, isYesterday } from "date-fns";

export default function InfiniteEntryList({ initialEntries, searchParams, isAdmin }) {
    const [entries, setEntries] = useState(initialEntries);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // Filter duplicates on initial load just in case
    useEffect(() => {
        setHasMore(initialEntries.length > 0);
        setEntries(initialEntries);
    }, [initialEntries]);

    // Group entries by date
    const groupedEntries = useMemo(() => {
        const groups = {};
        entries.forEach(entry => {
            const date = entry.entryDate || entry.createdAt;
            const dateKey = format(new Date(date), 'yyyy-MM-dd');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(entry);
        });

        return Object.entries(groups)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .map(([date, groupEntries]) => ({
                date,
                title: isToday(new Date(date)) ? 'Today' : isYesterday(new Date(date)) ? 'Yesterday' : format(new Date(date), 'dd MMM yyyy'),
                entries: groupEntries
            }));
    }, [entries]);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        const currentSkip = entries.length;
        const limit = 12;

        try {
            const { entries: newEntries, hasMore: moreAvailable } = await fetchEntries({
                skip: currentSkip,
                limit: limit,
                filters: searchParams
            });

            if (newEntries.length > 0) {
                setEntries(prev => {
                    const existingIds = new Set(prev.map(e => e._id));
                    const uniqueNewEntries = newEntries.filter(e => !existingIds.has(e._id));
                    return [...prev, ...uniqueNewEntries];
                });
                setHasMore(moreAvailable);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [entries, loading, hasMore, searchParams]);

    const Footer = () => {
        return loading && hasMore ? (
            <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
        ) : null;
    };

    return (
        <div className="pb-20 h-full min-h-[500px]">
            {/* Entry List (Grid View) */}
            <div className="h-full">
                {entries.length === 0 ? (
                    <EmptyState />
                ) : (
                    <Virtuoso
                        useWindowScroll
                        data={groupedEntries}
                        endReached={loadMore}
                        components={{
                            Footer: Footer
                        }}
                        itemContent={(index, group) => (
                            <div className="mb-6">
                                <h3 className="text-white/50 text-sm font-medium mb-3 px-1 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-10 py-2">
                                    {group.title} <span className="text-xs opacity-50 ml-2">({group.entries.length})</span>
                                </h3>
                                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {group.entries.map(entry => (
                                        <div key={entry._id} className="h-full">
                                            <EntryCard
                                                entry={entry}
                                                isAdmin={isAdmin}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    />
                )}
            </div>

            {!hasMore && entries.length > 0 && (
                <div className="flex flex-col items-center justify-center py-8 opacity-50">
                    <div className="w-12 h-1 bg-white/10 rounded-full mb-3" />
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">No more entries</p>
                </div>
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center glass-panel rounded-xl border border-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No entries found</h3>
            <p className="text-gray-400 max-w-sm">
                Try adjusting your filters or create a new entry to get started.
            </p>
        </div>
    );
}
