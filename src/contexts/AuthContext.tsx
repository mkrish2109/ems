"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useFCMNotifications } from "../hooks/useFCMNotifications";

interface UserData {
  user_id: number;
  user_name: string;
  email: string;
  mobile: string;
  role_id: number;
  is_solo_user: boolean;
  fcm_token: string | null;
  email_verified_at: string | null;
  converted_to_family_at: string | null;
  created_at: string;
  updated_at: string;
  role: {
    role_id: number;
    role_name: string;
    is_active: number;
    created_at: string;
    updated_at: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  userData: UserData | null;
  isLoading: boolean;
  fcmToken: string | null;
  isNotificationLoading: boolean;
  isPermissionGranted: boolean;
  login: (
    tokens: { access_token: string; refresh_token: string },
    role: string,
    userData: UserData
  ) => void;
  logout: () => void;
  requestNotificationPermission: () => Promise<string | null>;
  checkServiceWorker: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // FCM Notifications Hook
  const {
    fcmToken,
    isPermissionGranted,
    isLoading: isNotificationLoading,
    requestPermission: requestNotificationPermission,
    removeFCMToken,
    initializeFCM,
    checkServiceWorker,
  } = useFCMNotifications();

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/", "/welcome","/test-ads"];

  // Restricted routes for Family Member
  const restrictedForMembers = React.useMemo(
    () => ["/addMember", "/members"],
    []
  );

  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoading(true);
      const accessToken = Cookies.get("access_token");
      const role = Cookies.get("userRole");
      const storedUserData = Cookies.get("userData");

      if (accessToken && role) {
        setIsAuthenticated(true);
        setUserRole(role);

        if (storedUserData) {
          try {
            setUserData(JSON.parse(storedUserData));
          } catch (e) {
            console.error("Error parsing user data from cookies:", e);
          }
        }

        // Initialize FCM for authenticated user
        setTimeout(() => {
          initializeFCM();
        }, 1000);

        if (
          decodeURIComponent(role) === "Family Member" &&
          restrictedForMembers.includes(pathname)
        ) {
          router.push("/dashboard");
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserData(null);

        if (!isPublicRoute) {
          router.push("/login");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router, isPublicRoute, restrictedForMembers, initializeFCM]);

  const login = (
    tokens: { access_token: string; refresh_token: string },
    role: string,
    userData?: any
  ) => {
    // Set tokens in cookies
    Cookies.set("access_token", tokens.access_token, {
      expires: 365,
      secure: true,
      sameSite: "Strict",
    });
    Cookies.set("refresh_token", tokens.refresh_token, {
      expires: 30,
      secure: true,
      sameSite: "Strict",
    });
    Cookies.set("userRole", role, {
      expires: 365,
      secure: true,
      sameSite: "Strict",
    });

    // Store user data in cookies if provided
    if (userData) {
      Cookies.set("userData", JSON.stringify(userData), {
        expires: 365,
        secure: true,
        sameSite: "Strict",
      });
      setUserData(userData);
    }

    setIsAuthenticated(true);
    setUserRole(role);

    // Initialize FCM after login with a slight delay
    setTimeout(async () => {
      await initializeFCM();
    }, 500);

    router.push("/dashboard");
  };

  const logout = async () => {
    // Remove FCM token from backend
    await removeFCMToken();

    // Clear cookies
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("userRole");
    Cookies.remove("userData");

    setIsAuthenticated(false);
    setUserRole(null);
    setUserData(null);

    router.push("/login");
  };

  // Enhanced notification permission request
  const enhancedRequestNotificationPermission = async (): Promise<
    string | null
  > => {
    if (!isAuthenticated) {
      console.log(
        "User not authenticated, cannot request notification permission"
      );
      return null;
    }

    try {
      const token = await requestNotificationPermission();
      return token;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        isAuthenticated,
        userRole,
        isLoading,
        fcmToken,
        isNotificationLoading,
        isPermissionGranted,
        login,
        logout,
        requestNotificationPermission: enhancedRequestNotificationPermission,
        checkServiceWorker,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
