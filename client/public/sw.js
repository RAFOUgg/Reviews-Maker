// One-time service worker to unregister existing SWs, clear caches and reload clients
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      // Clear all caches
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch (e) {
      // ignore
    }

    try {
      // Try to unregister this registration (and any associated SW)
      await self.registration.unregister();
    } catch (e) {
      // ignore
    }

    try {
      // Reload all controlled clients
      const allClients = await self.clients.matchAll({ includeUncontrolled: true });
      for (const client of allClients) {
        try {
          // navigate will cause a full reload
          client.navigate(client.url);
        } catch (err) {
          // fallback to postMessage asking client to reload
          client.postMessage({ type: 'RELOAD' });
        }
      }
    } catch (e) {
      // ignore
    }
  })());
});

// Listen for messages from clients to perform reload if navigate fails
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PING') {
    event.source && event.source.postMessage({ type: 'PONG' });
  }
});
