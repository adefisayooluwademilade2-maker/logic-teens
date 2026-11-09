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

messaging.onBackgroundMessage(payload => {
  const title = payload.data?.title || "LOGIC TEENS";
  const options = {
    body: payload.data?.body || "You have a new notification.",
    icon: "./logic-app-icon.png",
    badge: "./logic-app-icon.png",
    data: {
      url: payload.data?.url || "./"
    }
  };

  self.registration.showNotification(title, options);
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
  
