"use client";

import { useEffect, useCallback } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { DeleteConfirmationModal } from "@/components/forms/DeleteConfirmationModal";
import { useProfile } from "@/hooks/useProfile";
import { useProfileForm } from "@/hooks/useProfileForm";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import { useProfileActions } from "@/hooks/useProfileActions";
import { DeleteConfirmState } from "@/types/profile";

export default function EditProfile() {
  const { profile, loading: profileLoading, error, refetch } = useProfile();
  const { formData, message, setMessage, handleInputChange, resetForm } = useProfileForm({
    user_name: "",
    mobile: "",
  });
  const { mutationLoading, updateProfile } = useProfileUpdate();
  const {
    converting,
    deleteConfirm,
    setDeleteConfirm,
    handleConvertToFamilyHead,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
  } = useProfileActions({
    setMessage,
    refetchProfile: refetch,
    profile,
  });

  // Memoize the reset effect
  const resetFormWithProfile = useCallback(() => {
    if (profile) {
      resetForm({
        user_name: profile.user_name,
        mobile: profile.mobile || "",
      });
    }
  }, [profile, resetForm]);

  // Update form when profile loads
  useEffect(() => {
    resetFormWithProfile();
  }, [resetFormWithProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData, setMessage);
  };

  const handleDeleteInputChange = (value: string) => {
    setDeleteConfirm((prev: DeleteConfirmState) => ({
      ...prev,
      inputText: value,
    }));
  };

  // Memoize the error effect
  const handleError = useCallback(() => {
    if (error) {
      setMessage({ type: 'error', text: error });
    }
  }, [error, setMessage]);

  // Show error from profile loading
  useEffect(() => {
    handleError();
  }, [handleError]);

  const loading = profileLoading || mutationLoading;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg">
        <PageHeader title="Edit Profile" className="text-[20px]" />

        <DeleteConfirmationModal
          deleteConfirm={deleteConfirm}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          onInputChange={handleDeleteInputChange}
        />

        <div className="px-6 mt-8">
          <ProfileForm
            formData={formData}
            profile={profile}
            loading={loading}
            message={message}
            onSubmit={handleSubmit}
            onInputChange={handleInputChange}
            onConvertToFamilyHead={handleConvertToFamilyHead}
            converting={converting}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </div>
    </div>
  );
}