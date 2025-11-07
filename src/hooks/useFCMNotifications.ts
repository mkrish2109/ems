import { useState, useEffect, useCallback } from "react";
import {
  onMessageListener,
  refreshFCMToken,
  deleteFCMToken,
} from "../lib/firebase";
import { ProfileService } from "../lib/api/profile";
import Cookies from "js-cookie";

// Define proper interfaces for FCM message payload
interface FCMNotificationPayload {
  notification?: {
    title?: string;
    body?: string;
    image?: string;
    icon?: string;
  };
  data?: {
    [key: string]: string;
  };
  from?: string;
  messageId?: string;
  collapseKey?: string;
  fcmMessageId?: string;
  priority?: string;
  sentTime?: string;
  ttl?: number;
}

interface ServiceWorkerMessage {
  type: string;
  payload?: FCMNotificationPayload;
}

// Type guard to check if the value is a valid FCMNotificationPayload
const isFCMNotificationPayload = (value: unknown): value is FCMNotificationPayload => {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value.hasOwnProperty('notification') || value.hasOwnProperty('data'))
  );
};

export const useFCMNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentNotification, setCurrentNotification] = useState<FCMNotificationPayload | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  // Helper function to update FCM token and state
  const updateFCMTokenAndState = async (token: string | null) => {
    const access_token = await Cookies.get("access_token");
    if (access_token && token) {
      setFcmToken(token);
      await ProfileService.updateFcmToken(token);
      return token;
    }
    return null;
  };

  // Check service worker status; if missing, attempt to register it so permission flow isn't blocked
  const checkServiceWorker = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return false;
    }

    try {
      // Try existing registration
      let registration = await navigator.serviceWorker.getRegistration(
        "/firebase-messaging-sw.js"
      );

      // If not registered yet, register now
      if (!registration) {
        registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          { scope: "/" }
        );
      }

      // Ensure the SW is active/ready
      await navigator.serviceWorker.ready;
      // Optionally trigger update in background
      registration.update?.();
      return true;
    } catch (error) {
      console.error("Error ensuring service worker:", error);
      return false;
    }
  }, []);

  const initializeFCM = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check service worker first
      const swActive = await checkServiceWorker();
      if (!swActive) {
        return;
      }

      // Check notification permission
      const permission = Notification.permission;
      setIsPermissionGranted(permission === "granted");

      if (permission === "granted") {
        const token = await refreshFCMToken();
        if (!token) {
          setError(
            "Notifications supported partially: failed to obtain FCM token. Check browser support and HTTPS."
          );
          return;
        }
        await updateFCMTokenAndState(token);
      }
    } catch (err) {
      console.error("Error initializing FCM:", err);
      setError("Failed to initialize notifications");
    } finally {
      setIsLoading(false);
    }
  }, [checkServiceWorker]);

  const requestPermission = useCallback(async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Check service worker
      const swActive = await checkServiceWorker();
      if (!swActive) {
        setError("Service worker not available. Please refresh the page.");
        return null;
      }

      // Basic API support check
      if (typeof window !== "undefined" && !("Notification" in window)) {
        setError("This browser does not support Notifications API.");
        return null;
      }

      if (Notification.permission === "granted") {
        const token = await refreshFCMToken();
        setIsPermissionGranted(true);
        if (!token) {
          setError(
            "Permission granted but failed to get FCM token. Your device/browser may not fully support push notifications."
          );
          return null;
        }
        return await updateFCMTokenAndState(token);
      }

      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        setIsPermissionGranted(true);
        const token = await refreshFCMToken();
        if (!token) {
          setError(
            "Permission granted but failed to get FCM token. Your device/browser may not fully support push notifications."
          );
          return null;
        }
        return await updateFCMTokenAndState(token);
      } else {
        setError(
          `Permission ${permission}. You can enable notifications in browser settings.`
        );
      }

      return null;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get FCM token";
      setError(errorMessage);
      console.error("Error requesting notification permission:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkServiceWorker]);

  const removeFCMToken = useCallback(async () => {
    try {
      await deleteFCMToken();
      setFcmToken(null);
      setIsPermissionGranted(false);
    } catch (err) {
      console.error("Error removing FCM token:", err);
    }
  }, []);

  useEffect(() => {
    const setupMessageListener = async () => {
      try {
        onMessageListener()
          .then((payload: unknown) => {
            // Use type guard to safely handle the unknown payload
            if (isFCMNotificationPayload(payload)) {
              setCurrentNotification(payload);
              setNotificationCount((prev) => prev + 1);
            } else {
              console.warn('Received invalid FCM payload:', payload);
            }
          })
          .catch((error) => {
            console.error("Message listener error:", error);
          });
      } catch (err) {
        console.error("Error setting up message listener:", err);
      }
    };

    if (isPermissionGranted) {
      setupMessageListener();
    }
  }, [isPermissionGranted]);

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const messageData = event.data as ServiceWorkerMessage;
      if (messageData && messageData.type === "NEW_NOTIFICATION") {
        setCurrentNotification(messageData.payload || null);
        setNotificationCount((prev) => prev + 1);
      }
    };

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener(
        "message",
        handleServiceWorkerMessage
      );
    }

    return () => {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener(
          "message",
          handleServiceWorkerMessage
        );
      }
    };
  }, []);

  useEffect(() => {
    initializeFCM();
  }, [initializeFCM]);

  return {
    fcmToken,
    isPermissionGranted,
    isLoading,
    error,
    currentNotification,
    notificationCount,
    requestPermission,
    removeFCMToken,
    initializeFCM,
    checkServiceWorker,
    clearError: () => setError(null),
    clearNotifications: () => {
      setCurrentNotification(null);
      setNotificationCount(0);
    },
  };
};