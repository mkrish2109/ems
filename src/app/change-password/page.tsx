"use client";

import PageHeader from "@/components/ui/PageHeader";
import PasswordForm from "@/components/forms/PasswordForm";
import SecurityTips from "@/components/ui/SecurityTips";
import { useChangePassword } from "@/hooks/useChangePassword";

export default function ChangePassword() {
  const {
    passwordData,
    loading,
    message,
    handleInputChange,
    handlePasswordChange
  } = useChangePassword();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg">
        <PageHeader 
          title="Change Password" 
          showBackButton={true}
          className="text-[20px]"
        />
        
        <div className="px-6 mt-4">
          <PasswordForm
            passwordData={passwordData}
            loading={loading}
            message={message}
            onInputChange={handleInputChange}
            onSubmit={handlePasswordChange}
          />
          
          <SecurityTips />
        </div>
      </div>
    </div>
  );
}