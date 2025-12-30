"use client";

import { useEffect, useRef } from "react";
import { useKnockFeed } from "@knocklabs/react";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import { getCurrentUser } from "@/app/actions/userActions";

export default function RealtimeNotificationListener() {
    const { update } = useSession();
    const knockFeed = useKnockFeed();
    const feedClient = knockFeed.feedClient;
    const lastNotificationId = useRef(null);

    useEffect(() => {
        if (!feedClient) return;

        const onNotificationsReceived = async ({ items }) => {
            console.log("[RealtimeListener] New items received:", items);
            
            for (const item of items) {
                if (lastNotificationId.current === item.id) continue;
                lastNotificationId.current = item.id;

                toast.info("New Notification", {
                    description: <div dangerouslySetInnerHTML={{ __html: item.blocks[0].rendered }} />,
                    duration: 5000,
                });

                const workflowKey = item.source?.workflow_id || item.workflow || item.source?.workflow?.slug || item.key;
                const notificationContent = item.blocks?.[0]?.rendered?.toLowerCase() || "";
                
                // 1. Check for Deletion (Immediate Action)
                if (workflowKey === "user-deleted" || notificationContent.includes("account has been deleted")) {
                    console.log("[RealtimeListener] User account deleted. Logging out...");
                    toast.error("Your account has been removed. Logging out...", { duration: 3000 });
                    setTimeout(() => {
                        signOut({ callbackUrl: "/login" });
                    }, 2000);
                    return;
                }

                // 2. Check for Role/Status Updates
                const isCriticalUpdate = 
                    workflowKey === "user-verified" || 
                    workflowKey === "user-role-updated" ||
                    workflowKey === "user-declined" ||
                    notificationContent.includes("role has been updated") ||
                    notificationContent.includes("account has been verified") ||
                    notificationContent.includes("account has been declined");

                if (isCriticalUpdate) {
                    console.log(`[RealtimeListener] Critical update: ${workflowKey}`);
                    try {
                        const freshUser = await getCurrentUser();
                        if (freshUser) {
                            await update({ 
                                role: freshUser.role, 
                                status: freshUser.status 
                            });
                            
                            toast.success(`Account permissions updated to ${freshUser.role}!`, {
                                description: "Refreshing workspace..."
                            });
                            
                            setTimeout(() => {
                                window.location.href = "/dashboard";
                            }, 1500);
                        }
                    } catch (err) {
                        console.error("[RealtimeListener] Sync failed:", err);
                    }
                }
            }
        };

        feedClient.on("items.received.realtime", onNotificationsReceived);

        return () => {
            feedClient.off("items.received.realtime", onNotificationsReceived);
        };
    }, [feedClient, update]);

    return null;
}
