import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyAJ1Oo9auwzneNNw7qUrtf1v9jIazp_Jqc",
    authDomain: "techsersales-4e89c.firebaseapp.com",
    projectId: "techsersales-4e89c",
    storageBucket: "techsersales-4e89c.firebasestorage.app",
    messagingSenderId: "1094657939354",
    appId: "1:1094657939354:web:23c6af7cb789a8b036cc23",
    measurementId: "G-CT6W88HFXV"
};

let app;
let messaging;

if (typeof window !== "undefined" && getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    isSupported().then(supported => {
        if (supported) {
            messaging = getMessaging(app);
        }
    });
} else if (getApps().length > 0) {
    app = getApps()[0];
    isSupported().then(supported => {
        if (supported) {
            messaging = getMessaging(app);
        }
    });
}

/**
 * Subscribe to push notifications and save FCM token to database
 * @returns {Promise<string|null>} - FCM token or null if failed
 */
export async function subscribeToPushNotifications() {
    try {
        if (!messaging) {
            console.warn("[FCM] Messaging not supported in this browser");
            return null;
        }

        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("[FCM] Notification permission denied");
            return null;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        await navigator.serviceWorker.ready;

        // Get FCM token
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        const currentToken = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: registration
        });

        if (currentToken) {
            // Save token to database
            await fetch("/api/user/save-fcm-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: currentToken })
            });

            console.log("[FCM] Token registered successfully");
            return currentToken;
        } else {
            console.warn("[FCM] No registration token available");
            return null;
        }
    } catch (error) {
        console.error("[FCM] Error subscribing to push notifications:", error);
        return null;
    }
}

/**
 * Listen for foreground FCM messages
 * @param {Function} callback - Callback function to handle received message
 * @returns {Function} - Unsubscribe function
 */
export function onForegroundMessage(callback) {
    if (!messaging) {
        console.warn("[FCM] Messaging not supported");
        return () => { };
    }

    const { onMessage } = require("firebase/messaging");

    const unsubscribe = onMessage(messaging, (payload) => {
        console.log("[FCM] Foreground message received:", payload);
        callback(payload);
    });

    return unsubscribe;
}

/**
 * Unsubscribe from push notifications and cleanup FCM token
 * Deletes token from Firebase and backend database
 * @returns {Promise<boolean>} - Success status
 */
export async function unsubscribeFromPushNotifications() {
    try {
        if (!messaging) {
            console.warn("[FCM] Messaging not supported in this browser");
            return false;
        }

        // Get current token to delete from backend
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        const currentToken = await getToken(messaging, { vapidKey });

        if (currentToken) {
            // Delete token from backend database
            await fetch("/api/user/delete-fcm-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: currentToken })
            });

            // Delete token from Firebase
            const { deleteToken } = await import("firebase/messaging");
            await deleteToken(messaging);

            console.log("[FCM] Token deleted successfully");
        }

        // Unregister service worker
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
            if (registration.active?.scriptURL.includes("firebase-messaging-sw")) {
                await registration.unregister();
                console.log("[FCM] Service worker unregistered");
            }
        }

        return true;
    } catch (error) {
        console.error("[FCM] Error unsubscribing from push notifications:", error);
        return false;
    }
}

export { messaging, getToken };
