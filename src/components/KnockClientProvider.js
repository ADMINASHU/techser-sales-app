"use client";

import { KnockProvider, KnockFeedProvider } from "@knocklabs/react";
import { SessionProvider, useSession } from "next-auth/react";
import "@knocklabs/react/dist/index.css";

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
