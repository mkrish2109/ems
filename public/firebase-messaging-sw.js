importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Notification type constants
const NOTIFICATION_TYPES = {
  NEW_EXPENSE: "new_expense",
  EXPENSE_ADDED_FOR_YOU: "expense_added_for_you",
  SIGNIFICANT_EXPENSE: "significant_expense",
  FAMILY_INVITATION: "family_invitation",
};

const NOTIFICATION_ROUTES = {
  [NOTIFICATION_TYPES.NEW_EXPENSE]: "/expenses",
  [NOTIFICATION_TYPES.EXPENSE_ADDED_FOR_YOU]: "/expenses",
  [NOTIFICATION_TYPES.SIGNIFICANT_EXPENSE]: "/expenses",
  [NOTIFICATION_TYPES.FAMILY_INVITATION]: "/family",
};

const MESSAGE_TYPES = {
  INIT_FIREBASE_CONFIG: "INIT_FIREBASE_CONFIG",
  SKIP_WAITING: "SKIP_WAITING",
  CHECK_SERVICE_WORKER: "CHECK_SERVICE_WORKER",
  NEW_NOTIFICATION: "NEW_NOTIFICATION",
  NOTIFICATION_CLICKED: "NOTIFICATION_CLICKED",
};

// Firebase config will be injected from main thread
let firebaseConfig = null;
let isInitialized = false;

// Handle messages from main thread
self.addEventListener("message", (event) => {
  console.log("Service worker received message:", event.data?.type);

  if (event.data?.type === MESSAGE_TYPES.INIT_FIREBASE_CONFIG) {
    firebaseConfig = event.data.config;
    try {
      firebase.initializeApp(firebaseConfig);
      isInitialized = true;
      console.log("Firebase initialized in service worker");
    } catch (error) {
      console.error("Error initializing Firebase:", error);
    }
  }

  if (event.data?.type === MESSAGE_TYPES.SKIP_WAITING) {
    self.skipWaiting();
  }

  if (event.data?.type === MESSAGE_TYPES.CHECK_SERVICE_WORKER) {
    event.ports[0].postMessage({
      type: "SERVICE_WORKER_ACTIVE",
    });
  }
});

// Enhanced background message handler with better reliability
function setupMessaging() {
  if (!isInitialized) {
    console.warn("Firebase not yet initialized, waiting for config...");
    setTimeout(setupMessaging, 1000);
    return;
  }

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(async (payload) => {
    console.log("Received background message:", payload);

    // Ensure service worker is ready
    await self.registration.ready;

    const notificationTitle = payload.notification?.title || "EMS Notification";
    const notificationOptions = {
      body: payload.notification?.body || "You have a new notification",
      icon: "/assets/Icon/android-launchericon-192-192.png",
      badge: "/assets/Icon/android-launchericon-144-144.png",
      tag: payload.data?.expense_id || `bg-${Date.now()}`,
      renotify: true,
      requireInteraction: true,
      silent: false,
      vibrate: [200, 100, 200],
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
      // Send message to all clients about the new notification
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        try {
          client.postMessage({
            type: MESSAGE_TYPES.NEW_NOTIFICATION,
            payload: payload,
          });
        } catch (error) {
          console.error("Error sending message to client:", error);
        }
      });
    } catch (error) {
      console.error("Error showing background notification:", error);
    }
  });
}

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
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            try {
              client.focus();

              // Send notification data to client
              client.postMessage({
                type: MESSAGE_TYPES.NOTIFICATION_CLICKED,
                data: notificationData,
              });
              return;
            } catch (error) {
              console.error("Error communicating with client:", error);
            }
          }
        }

        // If no window found, open a new one
        if (self.clients.openWindow) {
          const url =
            NOTIFICATION_ROUTES[notificationData?.type] || "/";
          return self.clients.openWindow(url).catch((error) => {
            console.error("Error opening window:", error);
          });
        }
      })
      .catch((error) => {
        console.error("Error handling notification click:", error);
      })
  );
});

// Service worker lifecycle events
self.addEventListener("install", (_event) => {
  console.log("Service worker installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activating...");
  event.waitUntil(self.clients.claim());
});

// Initialize messaging when ready
setupMessaging();
