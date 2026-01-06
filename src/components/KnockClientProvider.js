"use client";

import { KnockProvider, KnockFeedProvider, useKnockClient } from "@knocklabs/react";
import { useSession } from "next-auth/react";
import "@knocklabs/react/dist/index.css";
import { useEffect } from "react";

import { toast } from "sonner";

function PushNotificationManager() {
    const knock = useKnockClient();

    useEffect(() => {
        const registerPush = async () => {
            try {
                const channelId = process.env.NEXT_PUBLIC_KNOCK_PUSH_CHANNEL_ID;
                if (!channelId) {
                    console.warn("Knock Push Channel ID not found");
                    return;
                }

                // console.log("Requesting notification permission...");
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    console.warn("Notification permission denied");
                    toast.error("Notification permission denied. Enable them in browser settings.");
                    return;
                }

                // console.log("Permission granted. Registering service worker...");
                const registration = await navigator.serviceWorker.register("/service-worker.js");
                // console.log("Service Worker registered:", registration);

                if (knock?.push) {
                    // console.log("Registering push with Knock channel:", channelId);
                    await knock.push.register(channelId); // Check if this requires specific options
                    // console.log("Knock Push Registered Successfully");
                    // toast.success("Push Notifications Enabled!"); // Too noisy for every login
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

function KnockProviderContent({ children }) {
    const { data: session } = useSession();
    
    console.log("[KnockProviderContent] Render", { 
        hasSession: !!session, 
        userId: session?.user?.id,
        timestamp: Date.now() 
    });

    if (!session?.user?.id) {
        return <>{children}</>;
    }

    const apiKey = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY;
    const feedId = process.env.NEXT_PUBLIC_KNOCK_FEED_ID;

    // Only render providers if we have the required configuration
    if (!apiKey || !feedId) {
        console.warn("Knock configuration incomplete. Skipping provider initialization.");
        return <>{children}</>;
    }

    return (
        <KnockProvider
            apiKey={apiKey}
            userId={session.user.id}
        >
            <KnockFeedProvider
                feedId={feedId}
                colorMode="dark"
                theme={KNOCK_THEME}
            >
                {children}
                <RealtimeNotificationListener />
            </KnockFeedProvider>
        </KnockProvider>
    );
}

export default function KnockClientProvider({ children }) {
    return <KnockProviderContent>{children}</KnockProviderContent>;
}
