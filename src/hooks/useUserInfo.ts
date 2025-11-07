import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { UserRole } from '@/types/reports';

export const useUserInfo = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isFamilyHead, setIsFamilyHead] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setIsLoading(true);
        const token = Cookies.get('access_token');
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

        if (!token) {
          console.error('No access token found');
          setIsLoading(false);
          return;
        }

        const endpoints = [
          `${BASE_URL}/profile`,
          `${BASE_URL}/auth/profile`,
          `${BASE_URL}/me`,
        ];

        let userData = null;

        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              userData = await response.json();
              break;
            }
          } catch (error) {
            console.warn(`Error with ${endpoint}:`, error);
          }
        }

        if (userData) {
          let userRoleData: UserRole | null = null;

          if (userData.role) userRoleData = userData.role;
          else if (userData.data?.role) userRoleData = userData.data.role;
          else if (userData.user?.role) userRoleData = userData.user.role;

          setUserRole(userRoleData);
          setIsFamilyHead(userRoleData?.role_name === 'Family Head');
        }
      } catch (error) {
        console.error('Error loading user info:', error);
        setIsFamilyHead(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  return { userRole, isFamilyHead, isLoading };
};