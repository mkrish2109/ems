"use client";

import { useEffect, useState } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';

interface NotificationBadgeProps {
  className?: string;
}

export default function NotificationBadge({ className = "" }: NotificationBadgeProps) {
  const { unreadCount } = useNotificationContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(unreadCount > 0);
  }, [unreadCount]);
  if (!isVisible || unreadCount === 0) {
    return null;
  }

  return (
    <span className={`absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold ${className}`}>
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
}
