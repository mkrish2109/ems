"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ProfileService, Notification } from "@/lib/api/profile";
import { RiErrorWarningFill } from "react-icons/ri";
import { IoMdCheckmark, IoMdTrash } from "react-icons/io";
import PageLoader from "./ui/PageLoader";
import { useNotificationContext } from "@/contexts/NotificationContext";

interface NotificationListProps {
  maxItems?: number;
  showActions?: boolean;
  onNotificationUpdate?: () => void;
  className?: string;
  containerHeight?: number;
}

interface SwipeState {
  isSwiping: boolean;
  startX: number;
  currentX: number;
  notificationId: number;
}

export default function NotificationList({
  maxItems = 15,
  showActions = false,
  onNotificationUpdate,
  className = "",
  containerHeight = 600,
}: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [swipeState, setSwipeState] = useState<SwipeState | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const touchAreaRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { refreshTrigger, setUnreadCount, setHasNewNotification } = useNotificationContext();

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProfileService.getNotifications(1, maxItems);
      setNotifications(response.notifications.data);
      setHasMore(response.notifications.data.length === maxItems);
      setPage(1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  }, [maxItems]);

  const loadMoreNotifications = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await ProfileService.getNotifications(
        nextPage,
        maxItems
      );

      if (response.notifications.data.length > 0) {
        setNotifications((prev) => [...prev, ...response.notifications.data]);
        setPage(nextPage);
        setHasMore(response.notifications.data.length === maxItems);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more notifications:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, maxItems]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      loadNotifications();
      setHasNewNotification(false);
    }
  }, [refreshTrigger, loadNotifications, setHasNewNotification]);

  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.is_read).length;
    setUnreadCount(unreadCount);
  }, [notifications, setUnreadCount]);

  useEffect(() => {
    if (!hasMore || loadingMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreNotifications();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loadMoreNotifications]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      setActionLoading(notificationId);
      await ProfileService.markNotificationAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
      onNotificationUpdate?.();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      setActionLoading(notificationId);
      await ProfileService.deleteNotification(notificationId);

      setNotifications((prev) =>
        prev.filter((notif) => notif.notification_id !== notificationId)
      );
      onNotificationUpdate?.();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(-1);
      await ProfileService.markAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      onNotificationUpdate?.();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setActionLoading(-2);
      await ProfileService.deleteAllNotifications();

      setNotifications([]);
      setPage(1);
      setHasMore(true);
      onNotificationUpdate?.();
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent, notificationId: number) => {
    const touch = e.touches[0];
    setSwipeState({
      isSwiping: true,
      startX: touch.clientX,
      currentX: touch.clientX,
      notificationId,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeState?.isSwiping) return;

    const touch = e.touches[0];
    setSwipeState((prev) =>
      prev ? { ...prev, currentX: touch.clientX } : null
    );
  };

  const handleTouchEnd = (notificationId: number) => {
    if (!swipeState) return;

    const deltaX = swipeState.currentX - swipeState.startX;
    const swipeThreshold = 60;

    if (deltaX < -swipeThreshold) {
      handleDeleteNotification(notificationId);
    } else if (deltaX > swipeThreshold) {
      const notification = notifications.find(
        (n) => n.notification_id === notificationId
      );
      if (notification && !notification.is_read) {
        handleMarkAsRead(notificationId);
      }
    }

    setSwipeState(null);
  };

  const getSwipeTransform = (notificationId: number) => {
    if (!swipeState || swipeState.notificationId !== notificationId)
      return "translateX(0)";

    const deltaX = swipeState.currentX - swipeState.startX;
    const maxSwipe = 80;
    const limitedDeltaX = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));

    return `translateX(${limitedDeltaX}px)`;
  };

  const getSwipeBackground = (notificationId: number) => {
    if (!swipeState || swipeState.notificationId !== notificationId) return "";

    const deltaX = swipeState.currentX - swipeState.startX;
    const swipeThreshold = 30;

    if (deltaX < -swipeThreshold) {
      return "bg-red-50";
    } else if (deltaX > swipeThreshold) {
      return "bg-green-50";
    }

    return "";
  };

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
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
            <RiErrorWarningFill className="text-red-500 text-xl" />
          </div>
          <p className="text-red-500 text-sm mb-2">{error}</p>
          <button
            onClick={loadNotifications}
            className="px-4 py-2 bg-[#008DD2] text-white text-sm rounded-lg hover:bg-[#007BBC] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} flex flex-col h-full`} ref={touchAreaRef}>
      {/* Header with actions */}
      {showActions && notifications.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                notifications.filter((n) => !n.is_read).length > 0
                  ? "bg-red-500 animate-pulse"
                  : "bg-gray-300"
              }`}
            ></div>
            <h4 className="text-[15px] font-semibold text-[#052C4D]">
              Notifications ({notifications.filter((n) => !n.is_read).length})
            </h4>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleMarkAllAsRead}
              disabled={
                actionLoading === -1 || notifications.every((n) => n.is_read)
              }
              className="text-[13px] text-[#008DD2] hover:text-[#007BBC] disabled:opacity-30 flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <IoMdCheckmark size={16} />
              <span>Read All</span>
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={actionLoading === -2}
              className="text-[13px] text-red-500 hover:text-red-600 disabled:opacity-30 flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <IoMdTrash size={14} />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      )}

      {/* Notification List Container */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ maxHeight: containerHeight }}
      >
        {/* Empty State */}
        {notifications.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <RiErrorWarningFill className="text-gray-400 text-2xl" />
            </div>
            <p className="text-[15px] text-gray-600 font-medium mb-1">
              No notifications yet
            </p>
            <p className="text-[13px] text-gray-500">
              We’ll notify you when something arrives
            </p>
          </div>
        )}

        {/* Notification List with Swipe Gestures */}
        <div className="p-3 space-y-2">
          {notifications.map((notification) => {
            const isUnread = !notification.is_read;
            const isSwiping =
              swipeState?.notificationId === notification.notification_id;

            return (
              <div
                key={notification.notification_id}
                className={`relative overflow-hidden rounded-lg transition-colors ${getSwipeBackground(
                  notification.notification_id
                )}`}
              >
                {/* Swipe Actions Background */}
                <div className="absolute inset-0 flex pointer-events-none">
                  <div className="flex-1 bg-green-500 flex items-center justify-start pl-4">
                    <div className="flex items-center space-x-2 text-white">
                      <IoMdCheckmark size={16} />
                      <span className="text-xs font-medium">Mark Read</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-red-500 flex items-center justify-end pr-4">
                    <div className="flex items-center space-x-2 text-white">
                      <span className="text-xs font-medium">Delete</span>
                      <IoMdTrash size={16} />
                    </div>
                  </div>
                </div>

                {/* Notification Content */}
                <div
                  className={`relative transform transition-transform duration-200 ${
                    isSwiping ? "" : "hover:shadow-md"
                  }`}
                  style={{
                    transform: getSwipeTransform(notification.notification_id),
                  }}
                  onTouchStart={(e) =>
                    handleTouchStart(e, notification.notification_id)
                  }
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() =>
                    handleTouchEnd(notification.notification_id)
                  }
                >
                  <div
                    className={`
                    flex items-start p-3 rounded-lg border cursor-pointer transition-all min-h-[70px]
                    ${
                      isUnread
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200"
                    }
                    ${isSwiping ? "shadow-lg" : ""}
                  `}
                  >
                    {/* Status Indicator */}
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <div
                        className={`
                        w-2 h-2 rounded-full transition-colors
                        ${isUnread ? "bg-red-500 animate-pulse" : "bg-gray-400"}
                      `}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3
                          className={`
                          text-[14px] font-semibold leading-tight line-clamp-1
                          ${isUnread ? "text-[#052C4D]" : "text-gray-800"}
                        `}
                        >
                          {notification.title}
                        </h3>
                        <div className="flex space-x-1 ml-2 flex-shrink-0">
                          {showActions && (
                            <>
                              {isUnread && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(
                                      notification.notification_id
                                    );
                                  }}
                                  disabled={
                                    actionLoading ===
                                    notification.notification_id
                                  }
                                  className="px-1.5 py-0.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                                  title="Mark as read"
                                >
                                  <IoMdCheckmark size={14} />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(
                                    notification.notification_id
                                  );
                                }}
                                disabled={
                                  actionLoading === notification.notification_id
                                }
                                className="px-1.5 py-0.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete"
                                >
                                <IoMdTrash size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <p
                        className={`
                        text-[13px] leading-relaxed mb-2 line-clamp-2
                        ${isUnread ? "text-[#052C4D]" : "text-gray-600"}
                      `}
                      >
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-500 font-medium">
                          {formatTimeAgo(notification.created_at)}
                        </span>

                        {/* Swipe Hint - Only show for first few notifications */}
                        {showActions &&
                          !isSwiping &&
                          notifications.indexOf(notification) < 3 && (
                            <div className="flex items-center space-x-1 text-gray-400">
                              <span className="text-[10px]">
                                Swipe to action
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Load More Trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {loadingMore ? (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#008DD2]"></div>
                  <span className="text-[12px]">Loading more...</span>
                </div>
              ) : (
                <div className="w-6 h-6"></div>
              )}
            </div>
          )}

          {/* End of List */}
          {!hasMore && notifications.length > 0 && (
            <div className="text-center py-4">
              <p className="text-[12px] text-gray-400">No more notifications</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-3">
          <p className="text-center text-[11px] text-gray-500">
            Swipe left to delete • Swipe right to mark as read
          </p>
        </div>
      )}
    </div>
  );
}