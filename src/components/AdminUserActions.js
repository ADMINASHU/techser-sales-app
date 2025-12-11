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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { verifyUser, declineUser, deleteUser } from "@/app/actions/adminActions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, Trash2 } from "lucide-react";
import { useState } from "react";




export default function AdminUserActions({ user }) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // { action: 'verify'|'decline'|'delete', id: string }

    async function executeAction() {
        if (!pendingAction) return;
        setLoading(true);
        setOpen(false); // Close dialog immediately or wait? better wait? No, generic UI pattern usually closes.

        // We can show loading toast instead of valid loading state if we close dialog.
        const loadingToast = toast.loading("Processing...");

        let res;
        if (pendingAction.action === "verify") res = await verifyUser(pendingAction.id);
        if (pendingAction.action === "decline") res = await declineUser(pendingAction.id);
        if (pendingAction.action === "delete") res = await deleteUser(pendingAction.id);

        setLoading(false);
        toast.dismiss(loadingToast);
        setPendingAction(null);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Done");
        }
    }

    function triggerConfirm(action, id) {
        setPendingAction({ action, id });
        setOpen(true);
    }

    if (user.role === "admin") return null;

    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently {pendingAction?.action} this user.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.preventDefault(); executeAction(); }}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex justify-end gap-2">
                {user.status === "pending" && (
                    <>
                        <Button size="icon" variant="outline" onClick={() => triggerConfirm("verify", user._id)} disabled={loading} className="text-green-600 hover:text-green-700">
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => triggerConfirm("decline", user._id)} disabled={loading} className="text-red-500 hover:text-red-600">
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                )}
                <Button size="icon" variant="ghost" onClick={() => triggerConfirm("delete", user._id)} disabled={loading} className="text-gray-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </>
    );
}
