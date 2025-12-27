"use client";
import { useState, useRef, useEffect } from "react";
import { NotificationFeedPopover, useKnockFeed } from "@knocklabs/react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NotificationFeed() {
    const [isVisible, setIsVisible] = useState(false);
    const notifButtonRef = useRef(null);
    
    // Safely check if we're inside the provider
    // Note: useKnockFeed will throw if not in provider. 
    // We assume this component is used within KnockFeedProvider.
    const knockFeed = useKnockFeed();
    const useFeedStore = knockFeed.useFeedStore;
    const feedClient = knockFeed.feedClient;
    
    const meta = useFeedStore((state) => state.metadata);

    useEffect(() => {
        if (!feedClient) return;

        const onNotificationsReceived = ({ items }) => {
            items.forEach((item) => {
                // Show a toast for each new notification
                toast.info("New Notification", {
                    description:  <div dangerouslySetInnerHTML={{ __html: item.blocks[0].rendered }} />,
                    action: {
                        label: "View",
                        onClick: () => setIsVisible(true),
                    },
                });
            });
        };

        // Subscribe to real-time updates
        feedClient.on("items.received.realtime", onNotificationsReceived);

        return () => {
            feedClient.off("items.received.realtime", onNotificationsReceived);
        };
    }, [feedClient]);

    return (
        <>
            <Button
                variant="ghost"
                ref={notifButtonRef}
                onClick={() => setIsVisible(!isVisible)}
                className="relative h-8 w-8 px-0"
            >
                <Bell className="h-5 w-5" />
                {meta?.unread_count > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600" />
                )}
            </Button>
            <NotificationFeedPopover
                buttonRef={notifButtonRef}
                isVisible={isVisible}
                onClose={() => setIsVisible(false)}
            />
        </>
    );
}
