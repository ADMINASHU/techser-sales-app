"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCustomerVisitDetails } from "@/app/actions/adminCustomerActions";
import { format } from "date-fns";
import EntryUserCard from "@/components/EntryUserCard";

export default function CustomerVisitsModal({
  customer,
  filters,
  isOpen,
  onClose,
}) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customer?._id) {
      setLoading(true);
      getCustomerVisitDetails({
        customerId: customer._id,
        filters,
      })
        .then((res) => {
          setVisits(res.visits || []);
        })
        .finally(() => {
          setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    customer?._id,
    filters.month,
    filters.year,
    filters.search,
    filters.region,
    filters.branch,
  ]);

  // Handle format duration
  const formatDuration = (ms) => {
    if (!ms) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-[#0b0f19] border-white/10 text-white p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {customer?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4  max-h-[60vh] overflow-y-auto border border-white/10 rounded-lg hide-scrollbar overflow-x-hidden">
          <Table className="w-full table-fixed">
            <TableHeader className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-gray-400 font-semibold w-[35%] sm:w-[180px]">
                  Visit Date
                </TableHead>
                <TableHead className="text-gray-400 font-semibold w-[65%] sm:w-auto">
                  Visited By
                </TableHead>
                <TableHead className="text-gray-400 font-semibold text-right hidden sm:table-cell sm:w-[140px]">
                  Duration
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={3} className="h-40 text-center">
                    <div className="flex justify-center items-center gap-2 text-blue-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-sm">Loading visits...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : visits.length > 0 ? (
                visits.map((visit) => (
                  <TableRow
                    key={visit._id}
                    className="border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-300 text-sm align-top">
                      {visit.entryDate
                        ? format(new Date(visit.entryDate), "PPP")
                        : "-"}
                      <div className="text-xs text-blue-400 font-medium mt-0.5">
                        {visit.stampInTime
                          ? format(new Date(visit.stampInTime), "p")
                          : "?"}{" "}
                        -
                        {visit.stampOutTime
                          ? format(new Date(visit.stampOutTime), "p")
                          : "?"}
                      </div>
                      <div className="text-xs text-emerald-400 font-medium mt-0.5 sm:hidden">
                        {formatDuration(visit.duration)}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300 p-2 align-top">
                      <EntryUserCard
                        user={visit.user}
                        className="p-2! gap-2! [&_.h-14]:h-10! [&_.w-14]:w-10! [&_.text-base]:text-sm! [&_.min-w-\[70px\]]:min-w-[50px]! sm:[&_.h-14]:h-14! sm:[&_.w-14]:w-14! sm:[&_.min-w-\[70px\]]:min-w-[70px]! sm:p-4! sm:gap-4! sm:[&_.text-base]:text-sm!"
                      />
                    </TableCell>
                    <TableCell className="text-right font-mono text-emerald-400 font-medium text-sm hidden sm:table-cell align-top">
                      {formatDuration(visit.duration)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={3}
                    className="h-40 text-center text-gray-500"
                  >
                    No visits found for the selected period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
