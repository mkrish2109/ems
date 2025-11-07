import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ExpenseCategory, IncomeCategory } from '@/types/reports';

export const useCategories = () => {
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const token = Cookies.get('access_token');
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

        if (!token) {
          console.error('No access token found');
          setExpenseCategories([]);
          setIncomeCategories([]);
          return;
        }

        const [expenseResponse, incomeResponse] = await Promise.all([
          fetch(`${BASE_URL}/expense-categories`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${BASE_URL}/income-categories`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        // Process expense categories
        if (expenseResponse.ok) {
          const data = await expenseResponse.json();
          let expenseCategoriesData: ExpenseCategory[] = [];
          if (Array.isArray(data)) expenseCategoriesData = data;
          else if (data.data && Array.isArray(data.data)) expenseCategoriesData = data.data;
          else if (data.categories && Array.isArray(data.categories)) expenseCategoriesData = data.categories;
          setExpenseCategories(expenseCategoriesData);
        }

        // Process income categories
        if (incomeResponse.ok) {
          const data = await incomeResponse.json();
          let incomeCategoriesData: IncomeCategory[] = [];
          if (Array.isArray(data)) incomeCategoriesData = data;
          else if (data.data && Array.isArray(data.data)) incomeCategoriesData = data.data;
          else if (data.categories && Array.isArray(data.categories)) incomeCategoriesData = data.categories;
          setIncomeCategories(incomeCategoriesData);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setExpenseCategories([]);
        setIncomeCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  return { expenseCategories, incomeCategories, isLoading };
}; 