"use client";
import { useState, useRef } from "react";
import { NotificationFeedPopover } from "@knocklabs/react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationFeed() {
    const [isVisible, setIsVisible] = useState(false);
    const notifButtonRef = useRef(null);

    return (
        <>
            <Button
                variant="ghost"
                ref={notifButtonRef}
                onClick={() => setIsVisible(!isVisible)}
                className="relative h-8 w-8 px-0"
            >
                <Bell className="h-5 w-5" />
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
