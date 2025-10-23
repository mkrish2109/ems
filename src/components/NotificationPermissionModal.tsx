"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { IoIosNotifications } from "react-icons/io";
import { useFCMNotifications } from "@/hooks/useFCMNotifications";

interface NotificationPermissionModalProps {
  onClose?: () => void;
  className?: string;
  delay?: number;
}

export default function NotificationPermissionModal({
  onClose,
  className = "",
  delay = 3000,
}: NotificationPermissionModalProps) {
  const {
    isPermissionGranted,
    isNotificationLoading,
    requestNotificationPermission,
  } = useAuth();

  const [isDismissed, setIsDismissed] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { error, clearError } = useFCMNotifications();


  useEffect(() => {
    if (isPermissionGranted || isDismissed) return;

    const timer = setTimeout(() => {
      setShowModal(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPermissionGranted, isDismissed, delay]);


  if (isPermissionGranted || isDismissed || !showModal) {
    return null;
  }

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      setIsSupported(false);
      return;
    }

    try {
      await requestNotificationPermission();
      onClose?.();
      setIsDismissed(true);
    } catch (error) {
      console.error("Failed to request notification permission:", error);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onClose?.();
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${className}`}
    >
      <div className="w-full max-w-[350px] bg-white rounded-[20px] p-6 shadow-lg">
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 bg-[#008DD2]/10 rounded-full flex items-center justify-center mb-3">
            <IoIosNotifications size={24} className="text-[#008DD2]" />
          </div>
          <h3 className="text-[18px] font-bold text-[#052C4D]">
            Enable Notifications?
          </h3>
          <p className="text-[14px] text-[#052C4D] text-center mt-2">
            Stay updated with real-time notifications about your expenses and
            important updates.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleEnableNotifications}
            disabled={isNotificationLoading}
            className="w-full h-12 bg-[#008DD2] text-white rounded-[12px] font-semibold hover:bg-[#007cba] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isNotificationLoading ? "Enabling..." : "Allow Notifications"}
          </button>
          <button
            onClick={handleDismiss}
            className="w-full h-12 border border-gray-400 text-gray-600 rounded-[12px] font-semibold hover:bg-gray-50"
          >
            Skip for Now
          </button>
        </div>

        {(!!error || !isSupported) && (
          <div className="mt-3 rounded-[10px] bg-red-50 border border-red-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[12px] leading-5 text-red-700">
                {error || "Notifications not supported in your browser"}
              </p>
              {error && (
                <button
                  type="button"
                  onClick={clearError}
                  className="text-[12px] text-red-700/70 hover:text-red-800"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}