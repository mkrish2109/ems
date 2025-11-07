"use client";
 
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
 
interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  isLoading: boolean;
  login: (tokens: { access_token: string; refresh_token: string }, role: string) => void;
  logout: () => void;
}
 
const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
 
  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/", "/welcome"];
 
  // Restricted routes for Family Member
  const restrictedForMembers = React.useMemo(() => ["/addMember", "/members"], []);
 
  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname);
 
  useEffect(() => {
    const checkAuth = () => {
      setIsLoading(true);
      const accessToken = Cookies.get("access_token");
      const role = Cookies.get("userRole");
 
      if (accessToken && role) {
        setIsAuthenticated(true);
        setUserRole(role);
 
        if (
          decodeURIComponent(role) === "Family Member" &&
          restrictedForMembers.includes(pathname)
        ) {
          router.push("/dashboard");
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
 
        if (!isPublicRoute) {
          router.push("/login");
        }
      }
      setIsLoading(false);
    };
 
    checkAuth();
  }, [pathname, router, isPublicRoute, restrictedForMembers]);
 
  const login = (
    tokens: { access_token: string; refresh_token: string },
    role: string
  ) => {
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
 
    setIsAuthenticated(true);
    setUserRole(role);
    router.push("/dashboard");
  };
 
  const logout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("userRole");
 
    setIsAuthenticated(false);
    setUserRole(null);
    router.push("/login");
  };
 
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userRole, isLoading, login, logout }}
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