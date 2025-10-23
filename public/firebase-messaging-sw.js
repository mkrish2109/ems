importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyDXcQQ--LvE9xNvGYvNZ2umasJdjPzmtHU",
  authDomain: "expense-management-syste-97064.firebaseapp.com",
  projectId: "expense-management-syste-97064",
  storageBucket: "expense-management-syste-97064.firebasestorage.app",
  messagingSenderId: "597211057105",
  appId: "1:597211057105:web:8412b7f1ccdac352626ef0",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Enhanced background message handler with better reliability
messaging.onBackgroundMessage(async (payload) => {
  console.log("Received background message:", payload);

  // Ensure service worker is ready
  await self.registration.ready;

  const notificationTitle = payload.notification?.title || "EMS Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/assets/Icon/android-launchericon-192-192.png",
    badge: "/assets/Icon/android-launchericon-144-144.png",
    tag: payload.data?.expense_id || `bg-${Date.now()}`, // Unique tag for each notification
    renotify: true,
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200], // Vibration pattern
    data: payload.data || {},
    actions: [
      {
        action: "view",
        title: "View Details",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  try {
    // Show notification
    await self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
    // console.log('Background notification shown successfully:', payload.data);
    // Send message to all clients about the new notification
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "NEW_NOTIFICATION",
        payload: payload,
      });
    });
  } catch (error) {
    console.error("Error showing background notification:", error);
  }
});

// Enhanced notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received:", event.notification.tag);

  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === "dismiss") {
    console.log("Notification dismissed by user");
    return;
  }

  // Default action - open/focus the app
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            client.focus();

            // Send notification data to client
            client.postMessage({
              type: "NOTIFICATION_CLICKED",
              data: notificationData,
            });
            return;
          }
        }

        // If no window found, open a new one
        if (clients.openWindow) {
          let url = "/";

          // Navigate to specific page based on notification data
          if (
            notificationData?.type === "new_expense" ||
            notificationData?.type === "expense_added_for_you" ||
            notificationData?.type === "significant_expense"
          ) {
            url = "/expenses";
          } else if (notificationData?.type === "family_invitation") {
            url = "/family";
          }

          return clients.openWindow(url);
        }
      })
  );
});

// Handle messages from main thread
self.addEventListener("message", (event) => {
  console.log("Service worker received message:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CHECK_SERVICE_WORKER") {
    event.ports[0].postMessage({
      type: "SERVICE_WORKER_ACTIVE",
    });
  }
});

// Service worker lifecycle events
self.addEventListener("install", (_event) => {
  console.log("Service worker installing...");
  self.skipWaiting(); // Activate immediately
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activating...");
  event.waitUntil(self.clients.claim()); // Take control of all clients
});
