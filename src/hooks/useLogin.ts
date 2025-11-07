import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";
import Cookies from "js-cookie";
import { LoginFormData, LoginResponse } from '@/types/auth';
import { validateLoginForm } from '@/lib/validation';

export const useLogin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleLogin = async (formData: LoginFormData) => {
    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return { success: false };
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        setErrors({ email: data.message || "Invalid credentials" });
        return { success: false };
      }

      // Save tokens and role in cookies
      Cookies.set("access_token", data.access_token, { expires: 365, secure: true, sameSite: "Strict" });
      Cookies.set("refresh_token", data.refresh_token, { expires: 30, secure: true, sameSite: "Strict" });
      const userRole = data.user?.role?.role_name || "user";
      Cookies.set("userRole", userRole, { expires: 365, secure: true, sameSite: "Strict" });

      router.push("/dashboard");
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ email: "Server error. Please try again." });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  return {
    loading,
    errors,
    handleLogin,
    handleGoogleLogin,
    setErrors,
  };
};