"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
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
    const { data: session, status, update } = useSession();
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
        const notificationType = data?.type;

        // Handle session-critical notifications
        if (notificationType === "user-declined") {
            signOut({ callbackUrl: "/verification?reason=declined" });
            return;
        }

        if (notificationType === "user-deleted") {
            signOut({ callbackUrl: "/login" });
            return;
        }

        if (notificationType === "user-verified") {
            // Refresh session and redirect to dashboard
            update();
            window.location.href = "/dashboard";

            // Show toast
            toast.success("Account Verified!", {
                description: notification.body,
                duration: 5000
            });
            return;
        }

        if (notificationType === "user-role-updated") {
            // Refresh session to get new role
            update();

            toast.info("Role Updated", {
                description: notification.body,
                duration: 5000,
                action: {
                    label: "Reload",
                    onClick: () => window.location.reload()
                }
            });
            return;
        }

        // Regular notifications - show toast
        if (notification?.title) {
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
    }, [update]);

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

    // Listen for service worker messages (background notifications)
    useEffect(() => {
        const handleSWMessage = (event) => {
            const { type, reason, notificationType } = event.data || {};

            if (type === 'FORCE_LOGOUT') {
                // Redirect deleted users to login, declined users to verification
                if (reason === 'deleted') {
                    signOut({ callbackUrl: '/login' });
                } else {
                    signOut({ callbackUrl: `/verification?reason=${reason}` });
                }
            }

            if (type === 'REFRESH_SESSION') {
                update(); // Refresh NextAuth session

                if (notificationType === 'user-verified') {
                    window.location.href = '/dashboard';
                }
            }
        };

        navigator.serviceWorker?.addEventListener('message', handleSWMessage);

        return () => {
            navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
        };
    }, [update]);

    return (
        <NotificationContext.Provider value={{ permission, requestPermission, isSupported }}>
            {children}
        </NotificationContext.Provider>
    );
}
