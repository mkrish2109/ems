import { useState } from 'react';
import { MessageState, DeleteConfirmState, UserProfile } from '@/types/profile';
import { FamilyService } from '@/lib/api/family';
import { cookieManager } from '@/lib/cookieManager'; // Updated import

interface UseProfileActionsProps {
  setMessage: (message: MessageState) => void;
  refetchProfile: () => Promise<void>;
  profile: UserProfile | null;
}

export const useProfileActions = ({
  setMessage,
  refetchProfile,
  profile,
}: UseProfileActionsProps) => {
  const [converting, setConverting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    show: false,
    userId: null,
    userName: '',
    inputText: '',
  });

  const handleConvertToFamilyHead = async () => {
    try {
      setConverting(true);
      setMessage({ type: '', text: '' });

      await FamilyService.convertToFamilyHead();

      // Update role in cookies
      const currentUserRole = cookieManager.get('userRole');
      if (currentUserRole === 'Solo User') {
        cookieManager.set('userRole', 'Family Head');
      }

      setMessage({
        type: 'success',
        text: 'Successfully converted to Family Head!',
      });

      await refetchProfile();

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to convert to family head',
      });
      console.error('Convert to family head error:', error);
    } finally {
      setConverting(false);
    }
  };

  const handleDeleteClick = () => {
    const userId = cookieManager.get('userId');
    const userName = profile?.user_name || '';

    if (userId) {
      setDeleteConfirm({
        show: true,
        userId,
        userName,
        inputText: '',
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({
      show: false,
      userId: null,
      userName: '',
      inputText: '',
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.inputText !== 'DELETE' || !deleteConfirm.userId) {
      return;
    }

    try {
      const accessToken = cookieManager.get('access_token');

      // Delete user profile
      const deleteRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${deleteConfirm.userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!deleteRes.ok) {
        const errData = await deleteRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete profile');
      }

      // Clear all cookies
      cookieManager.clearAll();

      console.log('All cookies cleared after delete profile + logout');

      handleDeleteCancel();
      window.location.href = '/welcome';
    } catch (error) {
      console.error('Failed to delete profile:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete profile',
      });
    }
  };

  return {
    converting,
    deleteConfirm,
    setDeleteConfirm,
    handleConvertToFamilyHead,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
  };
};