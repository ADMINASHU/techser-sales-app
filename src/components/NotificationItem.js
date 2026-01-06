"use client";

import { formatDistanceToNow } from "date-fns";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationItem({ notification, onMarkAsRead, onClick }) {
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

    const timeAgo = createdAt
        ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
        : "";

    return (
        <div
            onClick={handleClick}
            className={cn(
                "px-4 py-3 cursor-pointer transition-colors hover:bg-white/5",
                !read && "bg-violet-500/5"
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
                    <p className={cn(
                        "text-sm leading-snug",
                        read ? "text-gray-300" : "text-white font-medium"
                    )}>
                        {title}
                    </p>
                    {body && (
                        <p className="text-xs text-gray-400 line-clamp-2">
                            {body}
                        </p>
                    )}
                    <p className="text-[10px] text-gray-500 mt-1">
                        {timeAgo}
                    </p>
                </div>
            </div>
        </div>
    );
}
