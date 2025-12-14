// Placeholder service worker
// The previous importScripts URL was invalid.
// Real web push requires Firebase/FCM scripts here.
self.addEventListener('push', (event) => {
    console.log('Push received', event);
});
