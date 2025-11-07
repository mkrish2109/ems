export type IncomeCategory = {
  income_category_id: number;
  income_category_name: string;
  type: string;
  is_active: number;
};

export type IncomeData = {
  income_id?: number;
  amount: string;
  description: string;
  income_date: string;
  payment_method: string;
  income_category_id: number;
  member_user_id: string;
  attachment?: File | null;
};

export type ApiResponse<T> = {
  message?: string;
  data?: T;
  error?: string;
};

export type IncomeApiResponse = ApiResponse<{
  income_id: number;
  amount: string;
  description: string;
  income_date: string;
  payment_method: string;
  income_category_id: number;
  member_user_id: number;
}>;