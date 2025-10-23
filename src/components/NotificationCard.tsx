"use client";

import { useState, useEffect, useCallback } from "react";
import { ProfileService, Notification } from "@/lib/api/profile";
import { RiErrorWarningFill } from "react-icons/ri";
import Link from "next/link";
import NotificationBadge from "./NotificationBadge";
import notification from "../../public/assets/Icon/notification.svg";
import Image from "next/image";
import { useNotificationContext } from "@/contexts/NotificationContext";
import PageLoader from "./ui/PageLoader";
import { LoaderTwo } from "./ui/loader";

interface NotificationCardProps {
  maxItems?: number;
  className?: string;
}

export default function NotificationCard({
  maxItems = 3,
  className = "",
}: NotificationCardProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { refreshTrigger, setUnreadCount } = useNotificationContext();

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProfileService.getNotifications(1, Math.max(maxItems, 50));
      setNotifications(response.notifications.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  }, [maxItems]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      loadNotifications();
    }
  }, [refreshTrigger, loadNotifications]);

  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.is_read).length;
    setUnreadCount(unreadCount);
  }, [notifications, setUnreadCount]);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (loading) {
    return (
      <LoaderTwo />
    );
  }

  if (error) {
    return (
      <div
        className={`h-[116px] bg-white rounded-[10px] mx-auto py-[13px] px-[11px] shadow-sm ${className}`}
      >
        <h4 className="text-[14px] font-semibold text-[#052C4D] mb-[9px]">
          Notifications
        </h4>
        <p className="text-[12px] text-red-500">Failed to load notifications</p>
      </div>
    );
  }

  return (
    <div
      className={`h-auto bg-white rounded-[10px] mx-auto py-[13px] px-[11px] shadow-sm ${className}`}
    >
      <div className="flex justify-between items-center mb-[5px]">
        <h4 className="text-[14px] font-semibold text-[#052C4D]">
          Notifications{" "}
          {notifications.filter((n) => !n.is_read).length > 0 && (
            <span className="text-[#FF0004] text-[12px]">
              ({notifications.filter((n) => !n.is_read).length} unread)
            </span>
          )}
        </h4>
        <span className="mr-4 relative">
          <Link href="/notifications">
            <Image src={notification} alt="notifications" />
          </Link>
          <NotificationBadge />
        </span>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.slice(0, maxItems).map((notification) => (
            <div
              key={notification.notification_id}
              className="flex items-center mb-[2px]"
            >
              <div
                className={`text-[#FF0004] mr-1 ${
                  notification.is_read ? "opacity-50" : ""
                }`}
              >
                <RiErrorWarningFill />
              </div>
              <div className="flex justify-between items-center w-full">
                <p
                  className={`text-[12px] truncate max-w-[200px] ${
                    !notification.is_read
                      ? "text-[#052C4D] font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {notification.message}
                </p>
                <p className="text-[10px] text-gray-400 ml-2 whitespace-nowrap">
                  {formatTimeAgo(notification.created_at)}
                </p>
              </div>
            </div>
          ))}
          {notifications.length > maxItems && (
            <div className="text-center">
              <Link href="/notifications" className="text-[10px] text-[#008DD2] hover:text-[#007BBC] transition-colors">
                View all {notifications.length} notifications
              </Link>
            </div>
          )}
        </div>
      ) : (
        <p className="text-[12px] text-[#052C4D]">No notifications</p>
      )}
    </div>
  );
}
