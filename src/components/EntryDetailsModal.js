"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation, Edit, X } from "lucide-react";
import { formatInIST } from "@/lib/utils";
import EntryUserCard from "@/components/EntryUserCard";
import { useEffect, useState } from "react";



function Label({ children, className }) {
  return (
    <p className={`text-xs uppercase tracking-wider ${className}`}>
      {children}
    </p>
  );
}

export default function EntryDetailsModal({ entry, isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!entry || !mounted) return null;

  const statusColor =
    entry.status === "Completed"
      ? "default"
      : entry.status === "In Process"
      ? "secondary"
      : "outline";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-6xl max-h-[90vh] overflow-y-auto hide-scrollbar bg-card border-white/10 p-6 rounded-xl">
        <DialogHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between pr-12">
            <DialogTitle className="text-xl font-bold">
              Visit Details
            </DialogTitle>
            <Badge variant={statusColor}>{entry.status}</Badge>
          </div>
        </DialogHeader>

        <div className={`grid grid-cols-1 gap-6 mt-4`}>
          {/* Details Column */}
          <div className={`max-w-3xl mx-auto w-full space-y-4`}>
            {/* Removed glass-panel wrapper */}
            <div>
              <Label className="text-muted-foreground mb-2">Visited By</Label>
              <EntryUserCard user={entry.userId} />
            </div>
            <div>
              <Label className="text-muted-foreground">Customer</Label>
              <div className="font-medium text-lg text-white">
                {entry.customerId?.name || entry.customerName}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Address</Label>
              <div className="font-medium mb-2 text-gray-300">
                {entry.customerId?.customerAddress || entry.customerAddress}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Contact Person</Label>
                <div className="font-medium text-sm sm:text-base">
                  {entry.customerId?.contactPerson ||
                    entry.contactPerson ||
                    "-"}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Contact Number</Label>
                <div className="font-medium text-sm sm:text-base">
                  {entry.customerId?.contactNumber ||
                    entry.contactNumber ||
                    "-"}
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Stamp In:</span>
                <span className="text-gray-200 font-medium">
                  {entry.stampIn?.time
                    ? formatInIST(entry.stampIn.time, "PPpp")
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Stamp Out:</span>
                <span className="text-gray-200 font-medium">
                  {entry.stampOut?.time
                    ? formatInIST(entry.stampOut.time, "PPpp")
                    : "-"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {(entry.customerId?.location?.lat || entry.location?.lat) && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${
                    entry.customerId?.location?.lat || entry.location?.lat
                  },${entry.customerId?.location?.lng || entry.location?.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
