importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js"
);

// FIREBASE INITIALIZATION
firebase.initializeApp({
  apiKey: "AIzaSyA3rI1PVBHOGN24VLqgAKBiI50BkYlXW_o",
  authDomain: "logic-teens.firebaseapp.com",
  projectId: "logic-teens",
  storageBucket: "logic-teens.firebasestorage.app",
  messagingSenderId: "542931056170",
  appId: "1:542931056170:web:7c9f7951bd5150618f3553"
});

const messaging = firebase.messaging();

// CACHE VERSION
const CACHE_NAME = "logic-teens-v5";
const CACHE_PREFIX = "logic-teens-";

const APP_FILES = [
  "./",
  "./index.html",
  "./auth.html",
  "./manifest.json"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key =>
              key.startsWith(CACHE_PREFIX) &&
              key !== CACHE_NAME
            )
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// BACKGROUND PUSH NOTIFICATIONS
messaging.onBackgroundMessage(payload => {
  const data = payload.data || {};
  const notification = payload.notification || {};

  const title = "LOGIC TEENS CHURCH";

  const body =
    data.title ||
    notification.title ||
    notification.body ||
    data.body ||
    "You have a new notification.";

  const targetUrl = data.url || "./";

  const appIcon = new URL(
    "./logic-app-icon.png",
    self.registration.scope
  ).href;

  return self.registration.showNotification(title, {
    body: body,
    icon: appIcon,
    badge: appIcon,
    data: {
      url: targetUrl
    }
  });
});

// NOTIFICATION CLICK
self.addEventListener("notificationclick", event => {
  event.notification.close();

  event.waitUntil((async () => {
    const scopeUrl = new URL(self.registration.scope);

    let targetUrl;

    try {
      targetUrl = new URL(
        event.notification.data?.url || "./",
        scopeUrl
      );

      if (
        targetUrl.origin !== scopeUrl.origin ||
        !targetUrl.pathname.startsWith(scopeUrl.pathname)
      ) {
        targetUrl = scopeUrl;
      }
    } catch (error) {
      targetUrl = scopeUrl;
    }

    const windowClients = await clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

    const appClient = windowClients.find(client =>
      client.url.startsWith(scopeUrl.href)
    );

    if (appClient) {
      try {
        await appClient.navigate(targetUrl.href);
        await appClient.focus();
        return;
      } catch (error) {
        console.error("Could not focus app window:", error);
      }
    }

    await clients.openWindow(targetUrl.href);
  })());
});

// OFFLINE NAVIGATION SUPPORT
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();

          event.waitUntil(
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, copy))
          );
        }

        return response;
      })
      .catch(async () => {
        return (
          await caches.match(event.request) ||
          await caches.match("./index.html")
        );
      })
  );
});
