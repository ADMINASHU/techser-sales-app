"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import CustomerForm from "@/components/CustomerForm";
import CustomerFilters from "@/components/CustomerFilters";
import InfiniteCustomerList from "@/components/InfiniteCustomerList";
import { Button } from "@/components/ui/button";
import { Building2, SearchX, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CustomerPageClient({
  initialCustomers,
  initialHasMore,
  locations,
  isAdmin,
  user,
  searchParams,
}) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const refreshListRef = useRef(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleFormSuccess = async () => {
    setIsFormOpen(false);
    setEditingCustomer(null);

    // Try direct list refresh first
    if (refreshListRef.current) {
      await refreshListRef.current();
    }

    // Fallback to global invalidation
    mutate((key) => Array.isArray(key) && key[0] === "customers", undefined, {
      revalidate: true,
    });

    router.refresh(); // Also refresh server data
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Desktop Title - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <h1 className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Customers
          </h1>
        </div>

        {/* Search / Filters - Flex-1 to take middle space */}
        {/* Search / Filters - Flex-1 to take middle space */}
        <div className="flex-1 w-full order-3 md:order-2 flex md:justify-end">
          <CustomerFilters locations={locations} isAdmin={isAdmin} />
        </div>

        {/* Add Button - Top on mobile, right on desktop */}
        {/* Add Button - Desktop Only */}
        <div className="hidden md:flex justify-end order-3 shrink-0">
          <Button
            onClick={() => setIsFormOpen(true)}
            className="glass-btn-primary h-11 px-6"
          >
            <div className="relative mr-2 flex items-center">
              <Building2 className="h-5 w-5" />
              <div className="absolute -left-4">
                <Plus className="h-2 w-2 text-white stroke-3" />
              </div>
            </div>
            <span className="whitespace-nowrap">New Customer</span>
          </Button>
        </div>
      </div>

      {/* Mobile FAB */}
      <Button
        onClick={() => setIsFormOpen(true)}
        className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full glass-btn-primary shadow-2xl z-50 flex items-center justify-center p-0"
      >
        <div className="relative">
          <Building2 className="h-6 w-6" />
          <div className="absolute -top-3 -right-3">
            <Plus className="h-3 w-3 text-white stroke-3" />
          </div>
        </div>
      </Button>

      {/* Shared Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingCustomer(null);
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto hide-scrollbar bg-card border-white/10 p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingCustomer
                ? "Update the details for this customer."
                : "Enter the details for the new customer."}
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            initialData={editingCustomer}
            user={user}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {initialCustomers.length > 0 ? (
        <InfiniteCustomerList
          initialCustomers={initialCustomers}
          initialHasMore={initialHasMore}
          searchParams={searchParams}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onRefresh={(refreshFn) => (refreshListRef.current = refreshFn)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl border border-white/5">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <SearchX className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No customers found
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            We couldn&apos;t find any customers matching your current filters.
            Try adjusting them or add a new customer.
          </p>
        </div>
      )}
    </div>
  );
}
