export type MessageType = 'success' | 'error'; // Remove null to match your MessageAlert

export interface Category {
  category_id: number;
  category_name: string;
}

export interface ExpenseFormData {
  amount: string;
  description: string;
  selectedCategory: number | null;
  otherCategoryName: string;
  selectedPayment: string;
  shared: boolean;
  startDate: Date;
}