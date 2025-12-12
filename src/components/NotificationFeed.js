"use client";
import { useState, useRef } from "react";
import { NotificationFeedPopover, useKnockFeed } from "@knocklabs/react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationFeed() {
    const [isVisible, setIsVisible] = useState(false);
    const notifButtonRef = useRef(null);
    const { useFeedStore } = useKnockFeed();
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
            <NotificationFeedPopover
                buttonRef={notifButtonRef}
                isVisible={isVisible}
                onClose={() => setIsVisible(false)}
            />
        </>
    );
}
