"use client";

import { NotificationFeed, KnockFeedProvider } from "@knocklabs/react";
import { Card } from "@/components/ui/card";

const KNOCK_THEME = {
    colors: {
        background: "#0b0f19",
        surface: "#1a1f2e",
        primary: "#a855f7",
    }
};

const feedId = process.env.NEXT_PUBLIC_KNOCK_FEED_ID;

export default function NotificationsPage() {
    if (!feedId) {
        return <div>Knock Feed ID not configured</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <Card className="min-h-[600px] p-4 glass-card">
                <KnockFeedProvider 
                    feedId={feedId} 
                    colorMode="dark" 
                    theme={KNOCK_THEME}
                    defaultFeedOptions={{
                        auto_manage_socket_connection: false
                    }}
                >
                    <NotificationFeed />
                </KnockFeedProvider>
            </Card>
        </div>
    );
}
