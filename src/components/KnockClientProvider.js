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

    return (
        <KnockProvider
            apiKey={apiKey}
            userId={session.user.id}
        >
            <KnockFeedProvider feedId={feedId}>
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
