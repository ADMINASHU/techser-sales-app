"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import EntryCard from "@/components/EntryCard";
import EntryTableRow from "@/components/EntryTableRow";
import { fetchEntries } from "@/app/actions/entryActions";
import { Loader2 } from "lucide-react";
import { Virtuoso, VirtuosoGrid } from "react-virtuoso";
import { format, isToday, isYesterday } from "date-fns";

export default function InfiniteEntryList({ initialEntries, searchParams, isAdmin, view = "grid" }) {
    const [entries, setEntries] = useState(initialEntries);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // Filter duplicates on initial load just in case
    useEffect(() => {
        // Set initial hasMore state
        setHasMore(initialEntries.length > 0);
        setEntries(initialEntries);
    }, [initialEntries, searchParams]);

    const loadMore = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        const currentSkip = entries.length;
        
        // Use standard limit for consistency (Reduced for mobile optimization)
        const limit = 10;

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
            console.error("Failed to load more entries", err);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    // Group entries by date for grid view
    // Note: VirtuosoGrid doesn't support grouping natively in the same way, 
    // but we can flatten usage or just use standard grid for mobile.
    // However, for strict virtuoso integration, we might lose the "headers" unless we use a custom list.
    // Given the requirement to use Virtuoso and user didn't mention keeping headers specifically as critical over performance,
    // we'll implement a clean grid. If headers are critical, GroupedVirtuoso is needed but deeper change.
    // Let's implement VirtuosoGrid for cards (Grid View) and Virtuoso for List View.
    // Mobile will force Grid View layout via CSS status.
    
    // Determine effective layout based on prop and screen size using CSS classes logic
    // We render BOTH lists but hide one via CSS to handle the "isMobile" requirement purely via CSS
    // This implies we need two Virtuoso instances potentially if we want true CSS toggling, 
    // OR we change the itemContent based on CSS. 
    // React-virtuoso manages window scroll, so having two mounted might fight for scroll control if not careful.
    // Better approach: Use a single Virtuoso instance with conditional rendering for the item content?
    // Complex because Grid vs List structure is different (Cards vs Table Rows).
    // The cleanest "no-JS isMobile" way is to use `display: none` classes.
    // But `react-virtuoso` needs a specific structure.
    
    // Strategy: Render Grid version for Mobile (always) and Desktop (if view='grid')
    // Render List version ONLY for Desktop (if view='list')
    // Use CSS to hide/show.

    const Footer = () => {
        return loading && hasMore ? (
            <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
        ) : null;
    };

    return (
        <div className="pb-20 h-full min-h-[500px]"> 
            {/* 
               Logic: 
               Mobile (< 1024px): Always show GRID style (Cards).
               Desktop (>= 1024px): Show Grid OR List based on `view` prop.
               
               Class changes:
               - Grid Container: `block lg:${view === 'grid' ? 'block' : 'hidden'}`
               - List Container: `hidden lg:${view === 'list' ? 'block' : 'hidden'}`
            */}

            {/* GRID VIEW (VirtuosoGrid) */}
            <div className={`h-full ${view === 'list' ? 'lg:hidden' : ''}`}>
                 {entries.length === 0 ? (
                    <EmptyState />
                 ) : (
                     <VirtuosoGrid
                        useWindowScroll
                        data={entries}
                        endReached={loadMore}
                        components={{
                            Footer: Footer
                        }}
                        itemContent={(index, entry) => (
                            <div className="mb-4 pr-2"> {/* Added spacing container */}
                                <EntryCard
                                    entry={entry}
                                    isAdmin={isAdmin}
                                />
                            </div>
                        )}
                        listClassName="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                     />
                 )}
            </div>

            {/* LIST VIEW (Table / Virtuoso) - Desktop Only via CSS */}
            <div className={`hidden lg:${view === 'list' ? 'block' : 'hidden'} h-full rounded-xl overflow-hidden glass-panel border border-white/5 shadow-2xl`}>
                {entries.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="w-full overflow-x-auto bg-white/5">
                        {/* Header */}
                        <div className="flex bg-white/5 text-gray-200 uppercase tracking-wider font-semibold border-b border-white/5 text-sm min-w-[800px]">
                            <div className="px-6 py-4 w-16 shrink-0">#</div>
                            <div className="px-6 py-4 w-40 shrink-0">Date</div>
                            <div className="px-6 py-4 w-40 shrink-0">Timings</div>
                            {isAdmin && <div className="px-6 py-4 w-40 shrink-0">Visited By</div>}
                            <div className="px-6 py-4 w-48 shrink-0">Status / Duration</div>
                            {isAdmin && <div className="px-6 py-4 w-40 shrink-0">Region / Branch</div>}
                            <div className="px-6 py-4 flex-1 min-w-[200px]">Customer</div>
                            {!isAdmin && <div className="px-6 py-4 w-24 text-right shrink-0">Actions</div>}
                        </div>

                        {/* Virtualized Rows */}
                        <Virtuoso
                            useWindowScroll
                            data={entries}
                            endReached={loadMore}
                            components={{
                                Footer: Footer
                            }}
                            itemContent={(index, entry) => (
                                <div className="border-b border-white/5 hover:bg-white/5 transition-colors min-w-[800px]">
                                    <div className="grid grid-cols-[1fr] w-full"> {/* Wrapping row in a grid/flex container structure that matches header is tricky with Virtuoso unless using Table */}
                                        {/* 
                                           We can't use actual <table> with Virtuoso easily without 'react-virtuoso' Table support, 
                                           but that can be brittle with responsive layouts.
                                           Since this is Desktop-only list view, we can use a Flex-based row to simulate table 
                                           OR import TableVirtuoso.
                                           Let's stick to EntryTableRow but wrapped in a div, assuming EntryTableRow returns <tr>.
                                           Wait, EntryTableRow likely returns <tr>. If so, we need <TableVirtuoso>.
                                        */}
                                        
                                        {/* 
                                           Refactoring EntryTableRow content to be flexible or use TableVirtuoso. 
                                           Let's use TableVirtuoso for best semantic correctness if existing component is <tr>.
                                        */}
                                         <table className="w-full text-left text-sm text-gray-400 table-fixed">
                                            <tbody>
                                                <EntryTableRow
                                                    entry={entry}
                                                    isAdmin={isAdmin}
                                                    serialNumber={index + 1}
                                                />
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        />
                    </div>
                )}
            </div>
            
            {!hasMore && entries.length > 0 && (
                <p className="text-center text-xs text-gray-500 py-4">No more entries</p>
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
