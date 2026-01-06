"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { subscribeToPushNotifications, onForegroundMessage } from "@/lib/firebase";
import { toast } from "sonner";

export const NotificationContext = createContext({
    permission: "default",
    usersPermission: "default", // distinct from browser permission
    requestPermission: async () => { },
    isSupported: true
});

export const useNotification = () => useContext(NotificationContext);

export default function FCMNotificationProvider({ children }) {
    const { data: session, status } = useSession();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permission, setPermission] = useState("default");
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        // Initial permission check
        if (typeof window !== "undefined") {
            if (!("Notification" in window)) {
                setIsSupported(false); // eslint-disable-line react-hooks/set-state-in-effect
                return;
            }
            setPermission(Notification.permission);
        }
    }, []);

    const handleForegroundMessage = useCallback((payload) => {
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
    }, []);

    const setupForegroundListener = useCallback(() => {
        try {
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
            console.error("[FCM] Listener setup error:", error);
        }
    }, [handleForegroundMessage]);

    const requestPermission = useCallback(async () => {
        try {
            if (!isSupported) return;

            const token = await subscribeToPushNotifications();
            if (token) {
                console.log("[FCM] Successfully registered for push notifications");
                setPermission("granted");
                return true;
            } else {
                // Check if it was denied
                if (Notification.permission === "denied") {
                    setPermission("denied");
                }
            }
        } catch (error) {
            console.error("[FCM] Token registration failed:", error);
            if (Notification.permission === "denied") {
                setPermission("denied");
            }
        }
        return false;
    }, [isSupported]);

    useEffect(() => {
        // Only initialize listener if we have permission
        if (status === "authenticated" && session?.user && permission === "granted") {
            // Ensure token is synced with backend even if already granted (e.g. new login, cleared DB)
            if (!isSubscribed) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setupForegroundListener();
                requestPermission(); // Sync token
            }
        }
    }, [status, session, permission, isSubscribed, setupForegroundListener, requestPermission]);

    return (
        <NotificationContext.Provider value={{ permission, requestPermission, isSupported }}>
            {children}
        </NotificationContext.Provider>
    );
}
