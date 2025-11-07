import { useState, useCallback } from 'react';
import { ProfileFormData, MessageState } from '@/types/profile';

export const useProfileForm = (initialData: ProfileFormData) => {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [message, setMessage] = useState<MessageState>({ type: '', text: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Use useCallback to memoize resetForm so it doesn't change on every render
  const resetForm = useCallback((newData: ProfileFormData) => {
    setFormData(newData);
  }, []);

  return {
    formData,
    message,
    setMessage,
    setFormData,
    handleInputChange,
    resetForm,
  };
};