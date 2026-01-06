"use client";

import { KnockProvider, KnockFeedProvider, useKnockClient } from "@knocklabs/react";
import { useSession } from "next-auth/react";
import "@knocklabs/react/dist/index.css";
import { useEffect, useRef, useMemo } from "react";

import { toast } from "sonner";

function PushNotificationManager() {
    const knock = useKnockClient();

    useEffect(() => {
        const registerPush = async () => {
            try {
                const channelId = process.env.NEXT_PUBLIC_KNOCK_PUSH_CHANNEL_ID;
                if (!channelId) {
                    if (process.env.NODE_ENV === 'production') {
                        console.warn("Knock Push Channel ID not found");
                    }
                    return;
                }

                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    if (process.env.NODE_ENV === 'production') {
                        console.warn("Notification permission denied");
                    }
                    toast.error("Notification permission denied. Enable them in browser settings.");
                    return;
                }

                const registration = await navigator.serviceWorker.register("/service-worker.js");

                if (knock?.push) {
                    await knock.push.register(channelId);
                }
            } catch (e) {
                console.error("Failed to register push:", e);
                toast.error("Failed to enable push notifications");
            }
        };

        // Only run on client
        if (typeof window !== "undefined" && 'serviceWorker' in navigator && 'PushManager' in window && knock) {
            registerPush();
        }
    }, [knock]);

    return null;
}

import RealtimeNotificationListener from "./RealtimeNotificationListener";

const KNOCK_THEME = {
    colors: {
        background: "#0b0f19",
        surface: "#1a1f2e",
        primary: "#a855f7",
    }
};

const apiKey = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY;
const feedId = process.env.NEXT_PUBLIC_KNOCK_FEED_ID;

export default function KnockClientProvider({ children }) {
    const { data: session } = useSession();
    const userId = session?.user?.id;

    if (!userId) {
        return <>{children}</>;
    }

    if (!apiKey || !feedId) {
        if (process.env.NODE_ENV === 'production') {
            console.warn("Knock configuration incomplete. Skipping provider initialization.");
        }
        return <>{children}</>;
    }

    // Render children inside the providers
    return (
        <KnockProvider apiKey={apiKey} userId={userId}>
            <KnockFeedProvider feedId={feedId} colorMode="dark" theme={KNOCK_THEME}>
                {children}
            </KnockFeedProvider>
        </KnockProvider>
    );
}
