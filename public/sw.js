// Service Worker version
const SW_VERSION = '1.0.2'; // Increment version for each update

const CACHE_NAME = `my-pwa-cache-${SW_VERSION}`;
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icon.png',
];

// Install event: cache files and activate immediately
self.addEventListener('install', (event) => {
  console.log('Service Worker installing, version:', SW_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker caching files:', FILES_TO_CACHE);
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Force activation
  );
});

// Activate event: remove old caches and take control of clients
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating, version:', SW_VERSION);
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Service Worker removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take over active tabs
      .then(() => {
        console.log('Service Worker claiming clients...');
        return self.clients.matchAll({ type: 'window' });
      })
      .then((clients) => {
        clients.forEach((client) => client.navigate(client.url)); // Force reload on all open tabs
      })
  );
});

// Fetch event: try cache first, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Push event: notify user
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  if (event.data) {
    const data = event.data.json();
    console.log('Push data:', data);

    const options = {
      body: data.body || 'No message content',
      icon: data.icon || '/icon.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      requireInteraction: true,
      data: {
        dateOfArrival: Date.now(),
        url: data.url || '/',
        notificationId: data.notificationId
      },
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'close', title: 'Close' },
      ]
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'New Notification',
        options
      )
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow(event.notification.data.url || '/');
      })
  );
});
