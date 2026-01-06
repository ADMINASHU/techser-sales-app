"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { subscribeToPushNotifications, onForegroundMessage } from "@/lib/firebase";
import { toast } from "sonner";

export default function FCMNotificationProvider({ children }) {
    const { data: session, status } = useSession();
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        // Only subscribe if user is authenticated
        if (status === "authenticated" && session?.user && !isSubscribed) {
            initializeFCM();
        }
    }, [status, session, isSubscribed]);

    const initializeFCM = async () => {
        try {
            // Check if browser supports notifications
            if (!("Notification" in window)) {
                console.warn("[FCM] This browser does not support notifications");
                return;
            }

            // Check if already granted
            if (Notification.permission === "granted") {
                await registerFCMToken();
            } else if (Notification.permission !== "denied") {
                // We'll handle permission request separately in a user-initiated action
                console.log("[FCM] Notification permission not yet requested");
            }

            // Set up foreground message listener
            const unsubscribe = onForegroundMessage((payload) => {
                handleForegroundMessage(payload);
            });

            setIsSubscribed(true);

            // Cleanup on unmount
            return () => {
                if (typeof unsubscribe === "function") {
                    unsubscribe();
                }
            };
        } catch (error) {
            console.error("[FCM] Initialization error:", error);
        }
    };

    const registerFCMToken = async () => {
        try {
            const token = await subscribeToPushNotifications();
            if (token) {
                console.log("[FCM] Successfully registered for push notifications");
            }
        } catch (error) {
            console.error("[FCM] Token registration failed:", error);
        }
    };

    const handleForegroundMessage = (payload) => {
        const { notification, data } = payload;

        if (notification) {
            // Show toast notification
            toast.info(notification.title, {
                description: notification.body,
                duration: 5000,
                action: data?.link ? {
                    label: "View",
                    onClick: () => {
                        if (data.link) {
                            window.location.href = data.link;
                        }
                    }
                } : undefined
            });
        }

        // Dispatch custom event for notification components to listen
        window.dispatchEvent(new CustomEvent("fcm-notification", {
            detail: { notification, data }
        }));
    };

    return <>{children}</>;
}
