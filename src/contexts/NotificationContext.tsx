"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useFCMNotifications } from "@/hooks/useFCMNotifications";

interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  hasNewNotification: boolean;
  setHasNewNotification: (hasNew: boolean) => void;
  refreshNotificationList: () => void;
  refreshTrigger: number;
  fcmToken: string | null;
  isPermissionGranted: boolean;
  isLoading: boolean;
  error: string | null;
  currentNotification: any;
  notificationCount: number;
  requestPermission: () => Promise<string | null>;
  removeFCMToken: () => Promise<void>;
  initializeFCM: () => Promise<void>;
  checkServiceWorker: () => Promise<boolean>;
  clearError: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fcmData = useFCMNotifications();

  const refreshNotificationList = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    setHasNewNotification(false);
  }, []);

  useEffect(() => {
    if (fcmData.currentNotification) {
      setHasNewNotification(true);
      setRefreshTrigger((prev) => prev + 1);

      setTimeout(() => {
        fcmData.clearNotifications();
      }, 1000);
    }
  }, [fcmData.currentNotification, fcmData.clearNotifications, fcmData]);

  useEffect(() => {
    if (fcmData.notificationCount > 0) {
      setHasNewNotification(true);
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [fcmData.notificationCount, fcmData]);

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "NEW_NOTIFICATION") {
        setHasNewNotification(true);
        setRefreshTrigger((prev) => prev + 1);
      }
    };

    const handleFCMNotification = (_event: CustomEvent) => {
      setHasNewNotification(true);
      setRefreshTrigger((prev) => prev + 1);
    };

    if (typeof window !== "undefined") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener(
          "message",
          handleServiceWorkerMessage
        );
      }

      window.addEventListener(
        "fcm-notification-received",
        handleFCMNotification as EventListener
      );
    }

    return () => {
      if (typeof window !== "undefined") {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.removeEventListener(
            "message",
            handleServiceWorkerMessage
          );
        }
        window.removeEventListener(
          "fcm-notification-received",
          handleFCMNotification as EventListener
        );
      }
    };
  }, []);

  const contextValue: NotificationContextType = {
    unreadCount,
    setUnreadCount,
    hasNewNotification,
    setHasNewNotification,
    refreshNotificationList,
    refreshTrigger,
    ...fcmData,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
}
