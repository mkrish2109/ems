"use client";

import { useEffect } from 'react';
import { refreshFCMToken } from '@/lib/firebase';
import Cookies from 'js-cookie';

export default function FCMProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Refresh FCM token when page loads
    const refreshTokenOnLoad = async () => {
      const accessToken = Cookies.get('access_token');
      if (accessToken && typeof window !== 'undefined' && Notification.permission === 'granted') {
        try {
          await refreshFCMToken();
          console.log('FCM token refreshed on page load');
        } catch (error) {
          console.error('Error refreshing FCM token on page load:', error);
        }
      }
    };

    refreshTokenOnLoad();
  }, []);

  return <>{children}</>;
}