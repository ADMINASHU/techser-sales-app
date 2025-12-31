"use client";

import { useState } from "react";
import CustomerForm from "@/components/CustomerForm";
import CustomerFilters from "@/components/CustomerFilters";
import InfiniteCustomerList from "@/components/InfiniteCustomerList";
import { Button } from "@/components/ui/button";
import { PlusCircle, SearchX, Users } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function CustomerPageClient({ initialCustomers, initialHasMore, locations, isAdmin, user, searchParams }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingCustomer(null);
        window.location.reload();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Desktop Title - Hidden on Mobile */}
                <div className="hidden md:flex items-center gap-3 shrink-0">
                    <div className="p-3 rounded-2xl bg-linear-to-br from-blue-500/20 to-fuchsia-500/20 border border-white/10">
                        <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Customers
                    </h1>
                </div>

                {/* Search / Filters - Flex-1 to take middle space */}
                <div className="flex-1 w-full order-3 md:order-2">
                    <CustomerFilters 
                        locations={locations} 
                        isAdmin={isAdmin} 
                    />
                </div>

                {/* Add Button - Top on mobile, right on desktop */}
                <div className="flex justify-end order-2 md:order-3 shrink-0">
                    <Dialog open={isFormOpen} onOpenChange={(open) => {
                        setIsFormOpen(open);
                        if (!open) setEditingCustomer(null);
                    }}>
                        <DialogTrigger asChild>
                            <Button className="glass-btn-primary h-11 px-6">
                                <PlusCircle className="mr-2 h-5 w-5" />
                                <span className="whitespace-nowrap">Add New Customer</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-white/10 max-w-3xl max-h-[90vh] overflow-y-auto">
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
                </div>
            </div>

            {initialCustomers.length > 0 ? (
                <InfiniteCustomerList 
                    initialCustomers={initialCustomers}
                    initialHasMore={initialHasMore}
                    searchParams={searchParams}
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                />
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl border border-white/5">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <SearchX className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No customers found</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                        We couldn't find any customers matching your current filters. Try adjusting them or add a new customer.
                    </p>
                </div>
            )}
        </div>
    );
}
