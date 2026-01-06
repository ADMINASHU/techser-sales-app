"use client";
import { useState, useRef } from "react";
import { NotificationFeedPopover, useKnockFeed, KnockFeedProvider } from "@knocklabs/react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const KNOCK_THEME = {
    colors: {
        background: "#0b0f19",
        surface: "#1a1f2e",
        primary: "#a855f7",
    }
};

const feedId = process.env.NEXT_PUBLIC_KNOCK_FEED_ID;

function NotificationBell() {
    const [isVisible, setIsVisible] = useState(false);
    const notifButtonRef = useRef(null);
    
    // Safely check if we're inside the provider
    const knockFeed = useKnockFeed();
    const useFeedStore = knockFeed.useFeedStore;
    
    const meta = useFeedStore((state) => state.metadata);

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
            {isVisible && (
                <NotificationFeedPopover
                    buttonRef={notifButtonRef}
                    isVisible={isVisible}
                    onClose={() => setIsVisible(false)}
                />
            )}
        </>
    );
}

export default function NotificationFeed() {
    if (!feedId) {
        return null;
    }

    return (
        <KnockFeedProvider feedId={feedId} colorMode="dark" theme={KNOCK_THEME}>
            <NotificationBell />
        </KnockFeedProvider>
    );
}
