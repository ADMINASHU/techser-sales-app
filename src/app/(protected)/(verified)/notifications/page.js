"use client";

import { Card } from "@/components/ui/card";
import NotificationItem from "@/components/NotificationItem";
import useSWR from "swr";
import { Loader2 } from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function NotificationsPage() {
    const { data, mutate, isLoading } = useSWR("/api/notifications", fetcher);
    const notifications = data?.notifications || [];

    const handleMarkAsRead = async (id) => {
        try {
            await fetch("/api/notifications/mark-read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationIds: [id] })
            });
            mutate(); // Refresh list
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <Card className="min-h-[600px] glass-card border-white/10 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={handleMarkAsRead}
                            />
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
