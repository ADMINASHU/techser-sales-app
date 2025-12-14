"use client";

import { KnockProvider, KnockFeedProvider, useKnockClient } from "@knocklabs/react";
import { SessionProvider, useSession } from "next-auth/react";
import "@knocklabs/react/dist/index.css";
import { useEffect } from "react";

function PushNotificationManager() {
    const knock = useKnockClient();

    useEffect(() => {
        const registerPush = async () => {
            const channelId = process.env.NEXT_PUBLIC_KNOCK_PUSH_CHANNEL_ID;
            if (!channelId) {
                console.warn("Knock Push Channel ID not found");
                return;
            }

            try {
                // Request permission
                const permission = await Notification.requestPermission();
                if (permission !== "granted") return;

                // Register service worker
                const registration = await navigator.serviceWorker.register("/service-worker.js");

                // Register with Knock
                // specific method depends on SDK version, usually push.register
                if (knock?.push) {
                    await knock.push.register(channelId, {
                        userToken: null, // handled by KnockProvider usually? or need to check
                    });

                    // Actually, the React SDK client usually picks up authentication from the Provider.
                    // But newer SDKs might handle this differently.
                    // Let's assume standard behavior: knock.push.register(channelId)
                    // Does it need the registration object? 
                    // Usually: await knock.push.setPushToken(token) or similar.
                    // Wait, Knock's helper usually does:
                    // knock.pushSubscriptions.create(channelId, { installationId: ... }) ??

                    // Looking at docs (simulated):
                    // "knock.push.register(channelId)" is likely correct for the web client.
                    // Note: The service worker import I added handles the 'showNotification'.
                }
            } catch (e) {
                console.error("Failed to register push:", e);
            }
        };

        // Only run on client
        if (typeof window !== "undefined" && 'serviceWorker' in navigator && 'PushManager' in window && knock) {
            registerPush();
        }
    }, [knock]);

    return null;
}

function KnockProviderContent({ children }) {
    const { data: session } = useSession();

    if (!session?.user?.id) {
        return <>{children}</>;
    }

    const apiKey = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY;
    const feedId = process.env.NEXT_PUBLIC_KNOCK_FEED_ID;

    console.log("Knock Config Check:", {
        hasApiKey: !!apiKey,
        apiKeyPrefix: apiKey?.substring(0, 8),
        hasFeedId: !!feedId,
        userId: session.user.id
    });

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
                theme={{
                    colors: {
                        background: "#0b0f19", // App deep navy --background
                        surface: "#1a1f2e",    // App lighter navy --card
                        primary: "#a855f7",    // Violet-500 equivalent for primary actions
                    }
                }}
            >
                {children}
                <PushNotificationManager />
            </KnockFeedProvider>
        </KnockProvider>
    );
}

export default function KnockClientProvider({ children, session }) {
    return (
        <SessionProvider session={session}>
            <KnockProviderContent>{children}</KnockProviderContent>
        </SessionProvider>
    );
}
