"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BackButton from "@/components/ui/BackButton";
import LoginForm from "@/components/forms/LoginForm";

function LoginContent() {
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  
  const getMessage = () => {
    if (verified === "success") {
      return "Your email has been verified successfully! Please log in.";
    } else if (verified === "already") {
      return "Your email is already verified. Please log in.";
    } else if (verified === "error") {
      return "Verification link is invalid or expired.";
    }
    return "";
  };

  const message = getMessage();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-white shadow-lg">
        <div className="px-[20px] pt-[40px]">
          <BackButton />
        </div>
        <LoginForm message={message} />
      </div>
    </div>
  );
}

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