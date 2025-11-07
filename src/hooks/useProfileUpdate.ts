import { useState } from 'react';
import { ProfileFormData, MessageState } from '@/types/profile';
import { ProfileService } from '@/lib/api/profile';

export const useProfileUpdate = () => {
  const [mutationLoading, setMutationLoading] = useState(false);

  const validateProfileForm = (formData: ProfileFormData): string | null => {
    if (!formData.user_name.trim()) {
      return 'User name is required';
    }

    if (!formData.mobile.trim()) {
      return 'Mobile number is required';
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      return 'Please enter a valid 10-digit mobile number';
    }

    return null;
  };

  const updateProfile = async (
    formData: ProfileFormData,
    setMessage: (message: MessageState) => void
  ) => {
    setMutationLoading(true);
    setMessage({ type: '', text: '' });

    const validationError = validateProfileForm(formData);
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      setMutationLoading(false);
      return false;
    }

    try {
      await ProfileService.updateProfile(formData);
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!',
      });
      return true;
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update profile',
      });
      console.error('Profile update error:', error);
      return false;
    } finally {
      setMutationLoading(false);
    }
  };

  return {
    mutationLoading,
    updateProfile,
  };
};