"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NotificationDropdown from "./NotificationDropdown";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  // Proper way to detect if we're on the client
  const mounted = useSyncExternalStore(
    () => () => {}, // subscribe: no-op
    () => true, // getSnapshot: returns true on client
    () => false // getServerSnapshot: returns false on server
  );

  // useSWR handles polling (refreshInterval) and auto-revalidation on focus
  const { data, mutate } = useSWR("/api/notifications/unread-count", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    fallbackData: { count: 0 },
  });

  const unreadCount = data?.count || 0;

  useEffect(() => {
    // Listen for new notifications to trigger instant refresh
    const handleNewNotification = () => {
      mutate();
    };

    window.addEventListener("fcm-notification", handleNewNotification);

    return () => {
      window.removeEventListener("fcm-notification", handleNewNotification);
    };
  }, [mutate]);

  const handleMarkAllAsRead = () => {
    // Optimistically update or just trigger revalidate
    mutate({ count: 0 }, false);
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-white/10 transition-colors"
        aria-label="Notifications"
        disabled
      >
        <Bell className="h-5 w-5 text-gray-300" />
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-white/10 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] max-w-[calc(100vw-2rem)] p-0 glass-panel border-white/10"
        align="end"
        sideOffset={8}
      >
        <NotificationDropdown
          onMarkAllAsRead={handleMarkAllAsRead}
          onClose={() => setIsOpen(false)}
          onUpdate={() => mutate()}
        />
      </PopoverContent>
    </Popover>
  );
}
