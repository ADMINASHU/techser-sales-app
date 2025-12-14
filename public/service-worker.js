self.addEventListener('install', function (event) {
    console.log('[Service Worker] Install');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activate');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push Received.', event);

    let data = { title: "New Notification", body: "Check your dashboard!" };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            console.log('Push data is not JSON:', event.data.text());
            data.body = event.data.text();
        }
    }

    const title = data.title || "Techser Sales";
    const options = {
        body: data.body,
        icon: '/icon-192x192.png', // Fallback icon
        badge: '/icon-192x192.png',
        requireInteraction: true,
        data: {
            url: data.url || data.link || "/" // Knock sends 'link' or 'url' typically
        }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click received.');
    event.notification.close();

    const urlToOpen = event.notification.data?.url || "/";

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
