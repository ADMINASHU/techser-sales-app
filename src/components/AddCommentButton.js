"use client";

import { useState } from "react";
import { updateEntryComment } from "@/app/actions/entryActions";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AddCommentButton({
  entryId,
  currentComment = "",
  onUpdate,
}) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [comment, setComment] = useState(currentComment);
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateEntryComment(entryId, comment);
      if (result.success) {
        toast.success("Comment saved successfully");
        setOpen(false);
        router.refresh();

        // Invalidate InfiniteEntryList cache to show new comment
        mutate((key) => Array.isArray(key) && key[0] === "entries", undefined, {
          revalidate: true,
        });

        // Optimistic UI Update
        if (onUpdate) {
          onUpdate({ _id: entryId, comment });
        }
      } else {
        toast.error(result.error || "Failed to save comment");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            setComment(currentComment);
          }}
          disabled={isSaving}
          aria-label="Add comment"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Add Comment</DialogTitle>
          <DialogDescription>
            Add a note or comment for this entry
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comment here..."
            rows={4}
            className="resize-none"
          />
          <div className="text-xs text-gray-500 text-right">
            {comment.length} characters
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-yellow-500 text-black hover:bg-yellow-400"
          >
            {isSaving ? "Saving..." : "Save Comment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
