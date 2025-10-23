"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; 
import { signIn } from "next-auth/react";
import Cookies from "js-cookie";
import BackButton from "@/components/ui/BackButton";
import { MdAlternateEmail, MdLockOutline } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";

// Move the main content to a separate component that uses useSearchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "success") {
      setMessage("Your email has been verified successfully! Please log in.");
    } else if (verified === "already") {
      setMessage("Your email is already verified. Please log in.");
    } else if (verified === "error") {
      setMessage("Verification link is invalid or expired.");
    }
  }, [searchParams]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", //  required for Laravel cookies to be stored
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ email: data.message || "Invalid credentials" });
        return;
      }

      // Save tokens and role in cookies
      Cookies.set("access_token", data.access_token, { expires: 365, secure: true, sameSite: "Strict" });
      Cookies.set("refresh_token", data.refresh_token, { expires: 30, secure: true, sameSite: "Strict" });
      const userRole = data.user?.role?.role_name || "user";
      Cookies.set("userRole", userRole, { expires: 365, secure: true, sameSite: "Strict" });

      router.push("/dashboard"); // Dashboard component handles role
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ email: "Server error. Please try again." });
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-white shadow-lg">
        <div className="px-[20px] pt-[40px]">
          <BackButton />
        </div>

        <div className="px-[23px] pt-[38px]">
          <div className="mb-[36px]">
            <h1 className="text-[30px] font-bold text-black mb-[16px]">Login</h1>
            <p className="text-[16px] text-black">
              Login now to track all your expenses and income at a place!
            </p>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded-2xl text-center text-[14px] font-medium ${
                message.includes("invalid") || message.includes("expired")
                  ? "bg-red-100 text-red-700"
                  : message.includes("already")
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-[28px]">
              <label className="block text-[16px] text-black mb-[6px]">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: abc@example.com"
                  className={`w-full h-14 border ${
                    errors.email ? "border-red-500" : "border-[#C8C8C8]"
                  } rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 ${
                    errors.email ? "focus:ring-red-500" : "focus:ring-[#008DD2]"
                  } placeholder:text-[#C8C8C8] text-gray-800`}
                  disabled={loading}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <MdAlternateEmail size={22} className="text-[#C8C8C8]" />
                </div>
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-[6px]">
              <label className="block text-[16px] text-black mb-[6px]">Your Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••"
                  className={`w-full h-14 border ${
                    errors.password ? "border-red-500" : "border-[#C8C8C8]"
                  } rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 ${
                    errors.password ? "focus:ring-red-500" : "focus:ring-[#008DD2]"
                  } placeholder:text-[#C8C8C8] text-gray-800`}
                  disabled={loading}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <MdLockOutline size={20} className="text-[#C8C8C8]" />
                </div>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Forgot password */}
            <div className="mb-[28px]">
              <Link href="#" className="text-[12px] font-bold text-[#008DD2] underline">
                Forgot Password?
              </Link>
            </div>

            {/* Submit button */}
            <div className="mb-[10px]">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#008DD2] rounded-2xl text-white font-bold text-[16px] disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>

            {/* Google login */}
            <div className="mb-[36px]">
              <button
                type="button"
                className="w-full h-14 border border-[#052C4D] rounded-2xl flex items-center justify-center hover:bg-gray-50"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <FcGoogle size={24} className="mr-2" />
                <span className="text-[16px] text-[#1C1C1C]">Continue with Google</span>
              </button>
            </div>
          </form>

          {/* Register link */}
          <div className="text-center">
            <p className="text-[16px] text-black">
              Don&#39;t have an account?
              <Link href="/register" className="text-[#008DD2] underline ml-1">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-[390px] min-h-[844px] bg-white shadow-lg flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}