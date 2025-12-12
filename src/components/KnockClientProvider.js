"use client";

import { KnockProvider, KnockFeedProvider } from "@knocklabs/react";
import { SessionProvider, useSession } from "next-auth/react";
import "@knocklabs/react/dist/index.css";

function KnockProviderContent({ children }) {
    const { data: session } = useSession();

    if (!session?.user?.id) {
        return <>{children}</>;
    }

    return (
        <KnockProvider
            apiKey={process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY}
            userId={session.user.id}
        >
            <KnockFeedProvider feedId={process.env.NEXT_PUBLIC_KNOCK_FEED_ID}>
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
