import { useState, useCallback } from 'react';
import Cookies from 'js-cookie';

interface IncomeData {
  amount: string;
  income_category_id: number;
  income_date: string;
  payment_method: string;
  member_user_id: string;
  description: string;
  attachment?: File | null;
}

export const useIncomeMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const saveIncome = async (data: IncomeData) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const accessToken = Cookies.get('access_token');
      const formData = new FormData();
      
      // Append all form data
      formData.append('amount', data.amount);
      formData.append('income_category_id', data.income_category_id.toString());
      formData.append('income_date', data.income_date);
      formData.append('payment_method', data.payment_method);
      formData.append('member_user_id', data.member_user_id);
      formData.append('description', data.description);
      
      // Add file if exists
      if (data.attachment) {
        formData.append('attachment', data.attachment);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income`, {
        method: 'POST',
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: formData,
      });

      if (!response.ok) {
        // Try to get specific error message from response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setSuccessMessage('Income saved successfully!');
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save income';
      setError(errorMessage);
      console.error('Income save error:', err);
      throw err; // Re-throw to let the calling component handle it
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  return {
    saveIncome,
    loading,
    error,
    successMessage,
    clearMessages
  };
};