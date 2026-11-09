
importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyA3rI1PVBHOGN24VLqgAKBiI50BkYlXW_o",
  authDomain: "logic-teens.firebaseapp.com",
  projectId: "logic-teens",
  storageBucket: "logic-teens.firebasestorage.app",
  messagingSenderId: "542931056170",
  appId: "1:542931056170:web:7c9f7951bd5150618f3553"
});

const messaging = firebase.messaging();

const CACHE_NAME = "logic-teens-v4";

const APP_FILES = [
  "./",
  "./index.html",
  "./auth.html",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

messaging.onBackgroundMessage(payload => {
  const data = payload.data || {};

  self.registration.showNotification(
    data.title || "LOGIC TEENS",
    {
      body: data.body || "You have a new notification.",
      icon: "./logic-app-icon.png",
      badge: "./logic-app-icon.png",
      data: {
        url: data.url || "./"
      }
    }
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "./",
    self.location.origin
  ).href;

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(windowClients => {
      for (const client of windowClients) {
        if ("focus" in client) {
          return client.navigate(targetUrl).then(() => client.focus());
        }
      }

      return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, copy)
          );
          return response;
        })
        .catch(async () =>
          (await caches.match(event.request)) ||
          (await caches.match("./index.html"))
        )
    );
  }
});
