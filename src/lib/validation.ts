import { LoginFormData } from '@/types/auth';

export const validateIncomeForm = (data: {
  amount: string;
  selectedCategory: string;
  memberId: string | null;
  file?: File | null;
}): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (!data.amount || parseFloat(data.amount) <= 0) {
    errors.amount = "Please enter a valid amount greater than 0";
  }

  if (!data.selectedCategory) {
    errors.category = "Please select a category";
  }

  if (!data.memberId) {
    errors.member = "Member ID is required";
  }

  if (data.file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(data.file.type)) {
      errors.file = "Please upload a valid file (JPEG, PNG, JPG, PDF)";
    }

    if (data.file.size > maxSize) {
      errors.file = "File size must be less than 5MB";
    }
  }

  return errors;
};

export const validateLoginForm = (data: LoginFormData): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};
  
  if (!data.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Enter a valid email";
  }

  if (!data.password) {
    errors.password = "Password is required";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
};