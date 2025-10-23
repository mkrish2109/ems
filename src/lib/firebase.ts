import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  deleteToken,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let messagingInstance: ReturnType<typeof getMessaging> | null = null;

const getMessagingInstance = async () => {
  if (messagingInstance) {
    return messagingInstance;
  }

  const isSupportedBrowser = await isSupported();
  if (!isSupportedBrowser) {
    console.log("FCM not supported in this browser");
    return null;
  }

  messagingInstance = getMessaging(app);
  return messagingInstance;
};

// Get FCM token
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.log("FCM not supported in this browser");
      return null;
    }

    // Check current permission
    if (Notification.permission !== "granted") {
      console.log("Notification permission not granted");
      return null;
    }

    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration:
        (await getServiceWorkerRegistration()) || undefined,
    });

    if (currentToken) {

      // Store token in localStorage for persistence check
      localStorage.setItem("fcm_token", currentToken);
      localStorage.setItem("fcm_token_timestamp", Date.now().toString());

      return currentToken;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

// Get or register service worker
const getServiceWorkerRegistration = async () => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      // Try to get existing registration first
      let registration = await navigator.serviceWorker.getRegistration(
        "/firebase-messaging-sw.js"
      );

      if (!registration) {
        // Register new service worker
        registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          {
            scope: "/",
          }
        );
      } else {

        // Update service worker if needed
        registration.update();
      }

      await navigator.serviceWorker.ready;
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }
  return null;
};

// Delete token (for logout)
export const deleteFCMToken = async (): Promise<boolean> => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return false;

    await deleteToken(messaging);

    // Clear local storage
    localStorage.removeItem("fcm_token");
    localStorage.removeItem("fcm_token_timestamp");

    return true;
  } catch (error) {
    console.error("Error deleting FCM token:", error);
    return false;
  }
};

// Refresh FCM token
export const refreshFCMToken = async (): Promise<string | null> => {
  return await getFCMToken();
};

// Message listener with better error handling
export const onMessageListener = () => {
  return new Promise((resolve, reject) => {
    getMessagingInstance()
      .then((messaging) => {
        if (messaging) {
          onMessage(messaging, (payload) => {
            showForegroundNotification(payload);

            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent('fcm-notification-received', {
                detail: payload
              }));
            }

            resolve(payload);
          });
        } else {
          reject(new Error("Messaging not available"));
        }
      })
      .catch(reject);
  });
};

// Show notification when app is in foreground
const showForegroundNotification = (payload: any) => {
  if (typeof window === "undefined") return;

  if (Notification.permission === "granted" && payload.notification) {
    const { title, body } = payload.notification;

    const notification = new Notification(title, {
      body: body,
      icon: "/assets/Icon/android-launchericon-192-192.png",
      badge: "/assets/Icon/android-launchericon-144-144.png",
      tag: payload.data?.expense_id || `foreground-${Date.now()}`,
      data: payload.data || {},
      requireInteraction: true, // Keep notification until user interacts
    });

    notification.onclick = () => {
      window.focus();
      notification.close();

      handleNotificationNavigation(payload.data);
    };

    notification.onclose = () => {
    };
  }
};

// Handle navigation based on notification data
const handleNotificationNavigation = (data: any) => {
  if (!data || typeof window === "undefined") return;

  switch (data.type) {
    case "new_expense":
    case "expense_added_for_you":
    case "significant_expense":
      window.location.href = "/expenses";
      break;
    case "family_invitation":
      window.location.href = "/family";
      break;
    default:
      window.location.href = "/dashboard";
  }
};
