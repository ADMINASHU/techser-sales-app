import { memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Circle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NotificationItem = memo(function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}) {
  const { id, title, body, data, createdAt, read } = notification;

  const handleClick = () => {
    // Mark as read if unread
    if (!read) {
      onMarkAsRead(id);
    }

    // Handle notification action
    if (data?.link) {
      window.location.href = data.link;
    }

    // Close dropdown
    if (onClick) {
      onClick();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent triggering item click
    onDelete(id);
  };

  const timeAgo = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : "";

  return (
    <div
      onClick={handleClick}
      className={cn(
        "px-4 py-3 cursor-pointer transition-colors hover:bg-white/5 group relative",
        !read && "bg-violet-500/5",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Unread Indicator */}
        {!read && (
          <div className="shrink-0 mt-1.5">
            <Circle className="h-2 w-2 fill-violet-500 text-violet-500" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <p
            className={cn(
              "text-sm leading-snug",
              read ? "text-gray-300" : "text-white font-medium",
            )}
          >
            {title}
          </p>
          {body && <p className="text-xs text-gray-400 line-clamp-2">{body}</p>}
          <p className="text-[10px] text-gray-500 mt-1">{timeAgo}</p>
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="shrink-0 p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
          title="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

export default NotificationItem;
