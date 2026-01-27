"use client";

import { useState, memo } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, User } from "lucide-react";
import { deleteUser } from "@/app/actions/adminActions";
import { toast } from "sonner";
import { formatRole } from "@/lib/formatters";
import UserProfileModal from "./UserProfileModal";

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

const AdminUserRow = memo(function AdminUserRow({ user, index, session }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isAdmin = session?.user?.role === "admin";
  const isSelf = session?.user?.id === user._id;

  const handleAction = async (actionFn, ...args) => {
    setIsLoading(true);
    try {
      const result = await actionFn(...args);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Action successful");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TableRow
      className="hover:bg-white/5 border-white/5 group cursor-pointer transition-colors"
      onClick={() => setShowProfile(true)}
    >
      <TableCell className="hidden md:table-cell text-center text-gray-500 font-mono text-xs w-12">
        {index}
      </TableCell>
      <TableCell className="font-medium text-white">{user.name}</TableCell>
      <TableCell className="hidden lg:table-cell text-gray-300">
        {user.contactNumber || "-"}
      </TableCell>
      <TableCell className="hidden xl:table-cell text-gray-300">
        {user.email}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-col">
          <span className="text-gray-300 font-medium">
            {user.branch || "-"}
          </span>
          <span className="text-xs text-gray-500">{user.region || "-"}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={
            user.role === "admin"
              ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
          }
        >
          {formatRole(user.role)}
        </Badge>
        {/* Modals rendered here when Actions column is hidden */}
        {!isAdmin && (
          <>
            <UserProfileModal
              user={user}
              open={showProfile}
              onOpenChange={setShowProfile}
              session={session}
              showActions={!isSelf}
            />
            <AlertDialog
              open={showDeleteConfirm}
              onOpenChange={setShowDeleteConfirm}
            >
              <AlertDialogContent className="glass-panel border-white/10 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    This action cannot be undone. This will permanently delete
                    the user account and remove their data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-white">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      handleAction(e, deleteUser, user._id);
                      setShowDeleteConfirm(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white border-none"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={
            user.status === "verified"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : user.status === "declined"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
          }
        >
          {user.status}
        </Badge>
      </TableCell>
      {isAdmin && (
        <TableCell className="text-right">
          {isSelf ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
              onClick={(e) => {
                e.stopPropagation();
                setShowProfile(true);
              }}
              title="View Profile"
            >
              <User className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <UserProfileModal
            user={user}
            open={showProfile}
            onOpenChange={setShowProfile}
            session={session}
            showActions={!isSelf}
          />

          <AlertDialog
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
          >
            <AlertDialogContent className="glass-panel border-white/10 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This action cannot be undone. This will permanently delete the
                  user account and remove their data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    handleAction(e, deleteUser, user._id);
                    setShowDeleteConfirm(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white border-none"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TableCell>
      )}
    </TableRow>
  );
});

export default AdminUserRow;
