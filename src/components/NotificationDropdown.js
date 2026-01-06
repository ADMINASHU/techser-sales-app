"use client";

import { useState, useEffect } from "react";
import { CheckCheck, Loader2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationItem from "./NotificationItem";

export default function NotificationDropdown({ onMarkAllAsRead, onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingAllRead, setMarkingAllRead] = useState(false);

    useEffect(() => {
        fetchNotifications();

        // Listen for new notifications
        const handleNewNotification = (event) => {
            const { notification, data } = event.detail;
            const newNotification = {
                id: Date.now().toString(),
                title: notification.title,
                body: notification.body,
                data: data || {},
                createdAt: new Date().toISOString(),
                read: false
            };
            setNotifications(prev => [newNotification, ...prev]);
        };

        window.addEventListener("fcm-notification", handleNewNotification);

        return () => {
            window.removeEventListener("fcm-notification", handleNewNotification);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/notifications/list");
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            setMarkingAllRead(true);
            const response = await fetch("/api/notifications/mark-all-read", {
                method: "POST"
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notif => ({ ...notif, read: true }))
                );
                onMarkAllAsRead();
            }
        } catch (error) {
            console.error("Error marking all as read:", error);
        } finally {
            setMarkingAllRead(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const response = await fetch("/api/notifications/mark-read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId })
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === notificationId ? { ...notif, read: true } : notif
                    )
                );
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to delete all notifications? This cannot be undone.")) {
            return;
        }

        try {
            setMarkingAllRead(true); // Reuse loading state
            const response = await fetch("/api/notifications/clear-all", {
                method: "DELETE"
            });

            if (response.ok) {
                setNotifications([]);
                onMarkAllAsRead(); // Reset unread count
            }
        } catch (error) {
            console.error("Error clearing all notifications:", error);
        } finally {
            setMarkingAllRead(false);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="glass-header px-4 py-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <p className="text-xs text-gray-400">
                                {unreadCount} unread
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllRead}
                                disabled={markingAllRead}
                                className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 h-8 text-xs"
                            >
                                {markingAllRead ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                    <CheckCheck className="h-3 w-3 mr-1" />
                                )}
                                Mark all read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearAll}
                                disabled={markingAllRead}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 text-xs"
                            >
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <ScrollArea className="flex-1" style={{ maxHeight: "400px" }}>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="rounded-full bg-white/5 p-3 mb-3">
                            <Bell className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-300">
                            No notifications yet
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            You'll be notified of important updates here
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={handleMarkAsRead}
                                onClick={onClose}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
