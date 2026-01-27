import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteCustomer, getCustomers } from "@/app/actions/customerActions";
import { toast } from "sonner";
import { useState, useCallback, useEffect } from "react";
import CustomerCard from "@/components/CustomerCard";
import { Loader2 } from "lucide-react";
import { VirtuosoGrid } from "react-virtuoso";
import useSWRInfinite from "swr/infinite";

// Helper function safely outside component if needed, or keep logic inside.

// Helper function safely outside component if needed, or keep logic inside.

export default function InfiniteCustomerList({
  initialCustomers,
  initialHasMore,
  searchParams,
  isAdmin,
  onEdit,
  onCustomerCreated,
  onRefresh,
}) {
  // ... existing hooks ...

  // Delete State
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteCustomer(customerToDelete._id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Customer deleted");
        await handleCustomerDeleted(customerToDelete._id);
      }
    } catch (error) {
      toast.error("Failed to delete customer");
    } finally {
      setIsDeleting(false);
      setCustomerToDelete(null);
    }
  };

  const getKey = (pageIndex, previousPageData) => {
    // ... existing getKey logic ...
    if (previousPageData && !previousPageData.hasMore) return null;
    return ["customers", JSON.stringify(searchParams), pageIndex];
  };

  const fetcher = async ([_, paramsStr, pageIndex]) => {
    // ... existing fetcher logic ...
    const params = JSON.parse(paramsStr);
    return await getCustomers({
      filters: params,
      skip: pageIndex * PAGE_SIZE,
      limit: PAGE_SIZE,
    });
  };

  const { data, size, setSize, isLoading, isValidating, mutate } =
    useSWRInfinite(getKey, fetcher, {
      fallbackData: [
        {
          customers: initialCustomers || [],
          hasMore: initialHasMore,
        },
      ],
      revalidateFirstPage: false,
      parallel: true,
    });

  const handleRefresh = useCallback(() => mutate(), [mutate]);

  useEffect(() => {
    if (onRefresh && typeof onRefresh === "function") {
      onRefresh(handleRefresh);
    }
  }, [onRefresh, handleRefresh]);

  const handleCustomerDeleted = useCallback(
    async (deletedId) => {
      await mutate(
        (currentData) => {
          if (!currentData) return [];
          return currentData.map((page) => ({
            ...page,
            customers: page.customers.filter((c) => c._id !== deletedId),
          }));
        },
        { revalidate: false },
      );
    },
    [mutate],
  );

  const customers = data ? data.flatMap((page) => page.customers) : [];
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.customers?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.hasMore === false);
  const hasMore = !isReachingEnd;
  const isRefreshing = isValidating && data && data.length === size;
  const showLoadingSpinner = isLoadingMore || (isRefreshing && size > 1);

  const loadMore = () => {
    if (isLoadingMore || !hasMore) return;
    setSize(size + 1);
  };

  return (
    <div className="pb-20 h-full min-h-[500px]">
      <div className="h-full">
        {customers.length === 0 && !isLoading ? (
          <EmptyCustomerState />
        ) : (
          <VirtuosoGrid
            useWindowScroll
            data={customers}
            endReached={loadMore}
            overscan={200}
            context={{ loading: showLoadingSpinner, hasMore }}
            components={{
              Footer: ListFooter,
            }}
            itemContent={(index, customer) => (
              <div className="h-full">
                <CustomerCard
                  customer={customer}
                  isAdmin={isAdmin}
                  onEdit={onEdit}
                  onDeleteClick={(c) => setCustomerToDelete(c)}
                />
              </div>
            )}
            listClassName="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-20"
          />
        )}
      </div>

      {/* Shared Delete Dialog */}
      <AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
        <AlertDialogContent className="glass-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete the customer &quot;{customerToDelete?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Customer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!hasMore && customers.length > 0 && (
        <div className="flex flex-col items-center justify-center py-8 opacity-50">
          <div className="w-12 h-1 bg-white/10 rounded-full mb-3" />
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            No more customers
          </p>
        </div>
      )}
    </div>
  );
}

function EmptyCustomerState() {
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
      <h3 className="text-lg font-medium text-white mb-1">
        No customers found
      </h3>
      <p className="text-gray-400 max-w-sm">
        Try adjusting your filters or add a new customer to get started.
      </p>
    </div>
  );
}

function ListFooter({ context }) {
  const { loading, hasMore } = context;

  if (!loading && !hasMore) return null;

  return (
    <div className="flex justify-center py-8">
      {loading ? (
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
      ) : (
        <div className="h-8" />
      )}
    </div>
  );
}
