"use client";

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
import { AlertTriangle, MapPin } from "lucide-react";
import { formatDistance } from "@/lib/geoUtils";

export default function DuplicateCustomerWarning({ nearbyCustomers, open, onOpenChange, onProceed, onCancel }) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-2xl bg-linear-to-br from-[#0b0f19] to-[#1a1f2e] border-amber-500/30">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-amber-400">
                        <AlertTriangle className="w-6 h-6" />
                        Possible Duplicate Customer Location
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300 pt-2">
                        We found <span className="font-semibold text-amber-400">{nearbyCustomers.length}</span> existing customer(s) 
                        very close to this location. This might be a duplicate entry or a different customer in the same building.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="max-h-[300px] overflow-y-auto space-y-2 my-4">
                    {nearbyCustomers.map((customer, index) => (
                        <div
                            key={customer._id}
                            className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-amber-400">#{index + 1}</span>
                                        <h4 className="font-semibold text-white">{customer.name}</h4>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-gray-400">
                                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p>
                                            {customer.customerAddress}
                                            {customer.district && `, ${customer.district}`}
                                            {customer.state && `, ${customer.state}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0 text-right">
                                    <div className="text-xs text-gray-500">Distance</div>
                                    <div className={`font-bold ${customer.distance < 10 ? "text-red-400" : "text-amber-400"}`}>
                                        {formatDistance(customer.distance)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-200">
                    <p className="font-medium mb-1">💡 Is this a different floor or section?</p>
                    <p className="text-xs text-amber-300/80">
                        If you&apos;re adding a different company/section in the same building, you can proceed. 
                        Otherwise, you might be creating a duplicate entry.
                    </p>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel 
                        onClick={onCancel}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        Cancel & Review
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onProceed}
                        className="bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                    >
                        Proceed Anyway
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
