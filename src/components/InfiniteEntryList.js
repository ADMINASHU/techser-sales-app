"use client";

import { useMemo, useCallback } from "react";
import EntryCard from "@/components/EntryCard";
import { fetchEntries } from "@/app/actions/entryActions";
import { Loader2 } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { format, isToday, isYesterday } from "date-fns";
import useSWRInfinite from "swr/infinite";

const PAGE_SIZE = 12;

export default function InfiniteEntryList({
  initialEntries,
  searchParams,
  isAdmin,
}) {
  const getKey = (pageIndex, previousPageData) => {
    // If we have previous data and no more items, stop
    if (previousPageData && !previousPageData.hasMore) return null;

    // Stable key for caching, includes filters and page index
    return ["entries", JSON.stringify(searchParams), pageIndex];
  };

  const fetcher = async ([_, paramsStr, pageIndex]) => {
    const params = JSON.parse(paramsStr);
    return await fetchEntries({
      filters: params,
      skip: pageIndex * PAGE_SIZE,
      limit: PAGE_SIZE,
    });
  };

  const { data, size, setSize, isLoading, isValidating, mutate } =
    useSWRInfinite(getKey, fetcher, {
      fallbackData: [
        {
          entries: initialEntries || [],
          // We don't strictly know if there's more from just initialEntries prop
          // usually, but we can assume true or rely on the first fetch to correct it.
          // Better yet, if initialEntries < limit, hasMore is false.
          hasMore: initialEntries && initialEntries.length === PAGE_SIZE,
        },
      ],
      revalidateFirstPage: false,
      parallel: true,
    });

  const handleEntryDeleted = useCallback(
    async (deletedId) => {
      // Optimistically update the cache bound to this specific list instance
      await mutate(
        (currentData) => {
          if (!currentData) return [];
          return currentData.map((page) => ({
            ...page,
            entries: page.entries.filter((e) => e._id !== deletedId),
          }));
        },
        { revalidate: false },
      );
    },
    [mutate],
  );

  const handleEntryUpdated = useCallback(
    async (updatedEntry) => {
      // Optimistically update the cache bound to this specific list instance
      await mutate(
        (currentData) => {
          if (!currentData) return [];
          return currentData.map((page) => ({
            ...page,
            entries: page.entries.map((e) =>
              e._id === updatedEntry._id ? { ...e, ...updatedEntry } : e,
            ),
          }));
        },
        { revalidate: false },
      );
    },
    [mutate],
  );

  const flatEntries = useMemo(
    () => (data ? data.flatMap((page) => page.entries) : []),
    [data],
  );
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.entries?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.hasMore === false);
  const hasMore = !isReachingEnd;
  const isRefreshing = isValidating && data && data.length === size;

  const showLoadingSpinner = isLoadingMore || (isRefreshing && size > 1);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups = {};
    flatEntries.forEach((entry) => {
      const date = entry.entryDate || entry.createdAt;
      const dateKey = format(new Date(date), "yyyy-MM-dd");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(entry);
    });

    return Object.entries(groups)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .map(([date, groupEntries]) => ({
        date,
        title: isToday(new Date(date))
          ? "Today"
          : isYesterday(new Date(date))
            ? "Yesterday"
            : format(new Date(date), "dd MMM yyyy"),
        entries: groupEntries,
      }));
  }, [flatEntries]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setSize(size + 1);
  }, [isLoadingMore, hasMore, setSize, size]);

  return (
    <div className="pb-20 h-full min-h-[500px]">
      {/* Entry List (Grid View) */}
      <div className="h-full">
        {flatEntries.length === 0 && !isLoading ? (
          <EmptyState />
        ) : (
          <Virtuoso
            useWindowScroll
            data={groupedEntries}
            endReached={loadMore}
            context={{ showLoadingSpinner }}
            components={{
              Footer: Footer,
            }}
            itemContent={(index, group) => (
              <div className="mb-6">
                <h3 className="text-white/50 text-sm font-medium mb-3 px-1 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-10 py-2">
                  {group.title}{" "}
                  <span className="text-xs opacity-50 ml-2">
                    ({group.entries.length})
                  </span>
                </h3>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {group.entries.map((entry) => (
                    <div key={entry._id} className="h-full">
                      <EntryCard
                        entry={entry}
                        isAdmin={isAdmin}
                        onDelete={handleEntryDeleted}
                        onUpdate={handleEntryUpdated}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          />
        )}
      </div>

      {!hasMore && flatEntries.length > 0 && (
        <div className="flex flex-col items-center justify-center py-8 opacity-50">
          <div className="w-12 h-1 bg-white/10 rounded-full mb-3" />
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            No more entries
          </p>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center glass-panel rounded-xl border border-white/5">
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white mb-1">No entries found</h3>
      <p className="text-gray-400 max-w-sm">
        Try adjusting your filters or create a new entry to get started.
      </p>
    </div>
  );
}

function Footer({ context }) {
  const { showLoadingSpinner } = context;
  return showLoadingSpinner ? (
    <div className="flex justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
    </div>
  ) : null;
}
