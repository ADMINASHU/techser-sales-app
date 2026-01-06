"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Listen for new notifications
        const handleNewNotification = () => {
            setUnreadCount(prev => prev + 1);
        };

        window.addEventListener("fcm-notification", handleNewNotification);

        // Fetch initial unread count
        fetchUnreadCount();

        return () => {
            window.removeEventListener("fcm-notification", handleNewNotification);
        };
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch("/api/notifications/unread-count");
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.count || 0);
            }
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    };

    const handleMarkAllAsRead = () => {
        setUnreadCount(0);
    };

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
                />
            </PopoverContent>
        </Popover>
    );
}
