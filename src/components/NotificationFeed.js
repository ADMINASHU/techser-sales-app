"use client";
import { useState, useRef, useEffect } from "react";
import { NotificationFeedPopover, useKnockFeed } from "@knocklabs/react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { getCurrentUser } from "@/app/actions/userActions";

export default function NotificationFeed() {
    const { update } = useSession();
    const [isVisible, setIsVisible] = useState(false);
    const notifButtonRef = useRef(null);
    
    // Safely check if we're inside the provider
    const knockFeed = useKnockFeed();
    const useFeedStore = knockFeed.useFeedStore;
    const feedClient = knockFeed.feedClient;
    
    const meta = useFeedStore((state) => state.metadata);

    useEffect(() => {
        if (!feedClient) return;

        const onNotificationsReceived = async ({ items }) => {
            console.log("[Knock] Real-time items received:", items);
            for (const item of items) {
                // Show a toast for each new notification
                toast.info("New Notification", {
                    description:  <div dangerouslySetInnerHTML={{ __html: item.blocks[0].rendered }} />,
                    action: {
                        label: "View",
                        onClick: () => setIsVisible(true),
                    },
                });

                // Real-time Session Update Logic
                // We check multiple possible fields where Knock stores the workflow key/slug
                const workflowKey = item.source?.workflow_id || item.workflow || item.source?.workflow?.slug || item.key;
                const notificationContent = item.blocks?.[0]?.rendered?.toLowerCase() || "";
                
                const isCriticalUpdate = 
                    workflowKey === "user-verified" || 
                    workflowKey === "user-role-updated" ||
                    notificationContent.includes("role has been updated") ||
                    notificationContent.includes("account has been verified");

                if (isCriticalUpdate) {
                    console.log(`[Notification] Critical update detected (${workflowKey}). Syncing session...`);
                    
                    try {
                        const freshUser = await getCurrentUser();
                        console.log("[Notification] Fresh user data from DB:", freshUser);
                        
                        if (freshUser) {
                            // Update the client-side session cookie
                            const updatedSession = await update({ 
                                role: freshUser.role, 
                                status: freshUser.status 
                            });
                            
                            console.log("[Notification] Session update response:", updatedSession);
                            toast.success(`Account permissions updated to ${freshUser.role}!`, {
                                description: "Refreshing workspace..."
                            });
                            
                            // Force a hard reload to ensure server-side components (Navbar, Layouts)
                            // read the updated cookie immediately.
                            setTimeout(() => {
                                window.location.href = "/dashboard"; // Direct redirect to force clean state
                            }, 1500);
                        }
                    } catch (err) {
                        console.error("[Notification] Sync failed:", err);
                    }
                }
            }
        };

        // Subscribe to real-time updates
        feedClient.on("items.received.realtime", onNotificationsReceived);

        return () => {
            feedClient.off("items.received.realtime", onNotificationsReceived);
        };
    }, [feedClient, update]);

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
