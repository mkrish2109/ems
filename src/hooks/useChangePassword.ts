import { useState } from 'react';
import Cookies from 'js-cookie';
import { PasswordData, MessageType } from '@/types/auth';

export const useChangePassword = () => {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageType>({ type: '', text: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = (data: PasswordData): string => {
    if (data.newPassword !== data.confirmPassword) {
      return 'New passwords do not match';
    }

    if (data.newPassword.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    return '';
  };

  const handlePasswordChange = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const validationError = validatePassword(passwordData);
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      setLoading(false);
      return false;
    }

    try {
      const accessToken = Cookies.get('access_token');
      const userId = Cookies.get('userId');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          password: passwordData.newPassword,
          password_confirmation: passwordData.confirmPassword
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        return true;
      } else {
        const errorData = await response.json();
        
        if (errorData.errors && errorData.errors.password) {
          const errorMessage = errorData.errors.password.join(' ');
          setMessage({ type: 'error', text: errorMessage });
        } else {
          setMessage({ 
            type: 'error', 
            text: errorData.message || 'Failed to change password. Please check your current password.' 
          });
        }
        return false;
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error occurred. Please try again.' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    passwordData,
    loading,
    message,
    handleInputChange,
    handlePasswordChange,
    setMessage
  };
};