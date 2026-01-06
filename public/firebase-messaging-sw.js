// Firebase Cloud Messaging Service Worker
// Handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase app
firebase.initializeApp({
    apiKey: "AIzaSyAJ1Oo9auwzneNNw7qUrtf1v9jIazp_Jqc",
    authDomain: "techsersales-4e89c.firebaseapp.com",
    projectId: "techsersales-4e89c",
    storageBucket: "techsersales-4e89c.firebasestorage.app",
    messagingSenderId: "1094657939354",
    appId: "1:1094657939354:web:23c6af7cb789a8b036cc23",
    measurementId: "G-CT6W88HFXV"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    const notificationType = payload.data?.type;

    // For logout scenarios, send message to client
    if (notificationType === "user-declined" || notificationType === "user-deleted") {
        self.clients.matchAll({ type: 'window' }).then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'FORCE_LOGOUT',
                    reason: notificationType === "user-declined" ? "declined" : "deleted",
                    data: payload.data
                });
            });
        });
    }

    // For session refresh scenarios
    if (notificationType === "user-verified" || notificationType === "user-role-updated") {
        self.clients.matchAll({ type: 'window' }).then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'REFRESH_SESSION',
                    notificationType: notificationType,
                    data: payload.data
                });
            });
        });
    }

    // Show notification
    const notificationTitle = payload.notification?.title || 'Techser Sales';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: payload.data || {},
        tag: payload.data?.type || 'default',
        vibrate: [200, 100, 200],
        requireInteraction: notificationType === "user-declined" || notificationType === "user-deleted"
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[FCM Service Worker] Notification clicked:', event);

    event.notification.close();

    const urlToOpen = event.notification.data?.link || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }

            // Open new window if no existing window found
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
