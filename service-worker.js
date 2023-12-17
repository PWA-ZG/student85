self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
  };

  event.waitUntil(
    self.registration.showNotification('Podsjetnik', options)
  );
});
const urlBase64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
const CACHE_NAME = 'my-app-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/index.html',
   '/styles/styles.css',
  '/scripts/app.js',
   '/images/reminderIcon.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request.url, responseToCache);
          });

          return response;
        });
      })
    );
  }
});
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
    );
  }
});


const saveSubscription = async (subscription) => {
  const response = await fetch('/save-subscription', {
      method: 'post',
      headers: { 'Content-type': "application/json" },
      body: JSON.stringify(subscription)
  })

  return response.json()
}

self.addEventListener("activate", async (e) => {
  const subscription = await self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array("BGEgIkIqtM35J4UW-lZBhI0KrIVIbiFoBCyQog4M7g-53UPUVcwfhORKFDqUunqhPvD9V42GTHbFtCK6VnSYL84")
  })

  const response = await saveSubscription(subscription)
  console.log(response)
})

self.addEventListener("push", e => {
  self.registration.showNotification("Novi podsjetnik", { body: e.data.text() })
})