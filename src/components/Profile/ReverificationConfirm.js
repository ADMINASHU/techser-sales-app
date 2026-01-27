"use client";

import { AlertTriangle } from "lucide-react";
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

export function ReverificationConfirm({ open, onOpenChange, onConfirm }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#1a1f2e] border-white/10 text-white">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-orange-500/20 text-orange-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <AlertDialogTitle>Re-verification Required</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-400 text-base">
            If you update your region or branch, your profile will need to be{" "}
            <strong>re-verified</strong>. Your current access will be restricted
            until an admin approves the change.
            <br />
            <br />
            Do you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-3">
          <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white mt-0">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white border-0"
          >
            Proceed
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
