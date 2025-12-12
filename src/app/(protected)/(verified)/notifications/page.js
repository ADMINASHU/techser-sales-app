"use client";

import { NotificationFeed } from "@knocklabs/react";
import { Card } from "@/components/ui/card";

export default function NotificationsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <Card className="min-h-[600px] p-4">
                <NotificationFeed />
            </Card>
        </div>
    );
}
