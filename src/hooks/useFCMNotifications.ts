import { useState, useEffect, useCallback } from "react";
import {
  onMessageListener,
  refreshFCMToken,
  deleteFCMToken,
} from "../lib/firebase";
import { ProfileService } from "../lib/api/profile";

export const useFCMNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);

    const updateFCMTokenAndState = async (token: string | null) => {
    if (token) {
      setFcmToken(token);
      await ProfileService.updateFcmToken(token);
      return token;
    }
    return null;
  };

    const checkServiceWorker = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return false;
    }

    try {
            let registration = await navigator.serviceWorker.getRegistration(
        "/firebase-messaging-sw.js"
      );

            if (!registration) {
        registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          { scope: "/" }
        );
      }

            await navigator.serviceWorker.ready;
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

            const swActive = await checkServiceWorker();
      if (!swActive) {
        return;
      }

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

            const swActive = await checkServiceWorker();
      if (!swActive) {
        setError("Service worker not available. Please refresh the page.");
        return null;
      }

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
          .then((payload: any) => {
            setCurrentNotification(payload);
            setNotificationCount((prev) => prev + 1);
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
      if (event.data && event.data.type === "NEW_NOTIFICATION") {
        setCurrentNotification(event.data.payload);
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
