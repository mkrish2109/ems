export interface Expense {
  expense_id: number;
  amount: string;
  description: string;
  expense_date: string;
  payment_method: string;
  category: { category_name: string };
  member_user: { user_name: string };
}

export interface Income {
  income_id: number;
  amount: string;
  description: string;
  income_date: string;
  payment_method: string;
  category: { income_category_name: string };
  member_user: { user_name: string };
}

export interface OriginalData {
  expense_id?: number;
  income_id?: number;
  amount: string;
  description: string;
  expense_date?: string;
  income_date?: string;
  payment_method: string;
  other_category_name?: string;
  category?: {
    category_name?: string;
    income_category_name?: string;
  };
  member_user?: {
    user_name: string;
  };
}

export interface CombinedReportData {
  summary: {
    total_income: number;
    total_expense: number;
    net_flow: number;
    data_type: string;
    income_count: number;
    expense_count: number;
    period: string;
    start_date: string;
    end_date: string;
    savings_rate: number;
    expense_to_income_ratio: number;
  };
  monthly_trend: Array<{
    month: string;
    income_total: number;
    expense_total: number;
    income_count: number;
    expense_count: number;
    net_flow: number;
  }>;
  expense_details: {
    expenses: Expense[];
    category_breakdown: Record<string, { total: number; count: number; percentage: number }>;
    payment_method_breakdown: Record<string, { total: number; count: number; percentage: number }>;
  };
  income_details: {
    incomes: Income[];
    category_breakdown: Record<string, { total: number; count: number; percentage: number }>;
    payment_method_breakdown: Record<string, { total: number; count: number; percentage: number }>;
  };
  financial_health: {
    savings_rate: number;
    health_score: number;
    health_status: string;
    monthly_income: number;
    monthly_expense: number;
    recommendations: string[];
  };
  metadata: {
    report_type: string;
    period: string;
    data_type: string;
    start_date: string;
    end_date: string;
    generated_by: string;
    generated_at: string;
    user_id: number;
    time_range: string;
  };
  combined_timeline: Array<{
    id: number;
    type: string;
    amount: string | number;
    absolute_amount: string;
    description: string | null;
    category: string;
    date: string;
    created_at: string;
    updated_at: string;
    user_name: string;
    payment_method: string | null;
    original_data: OriginalData;
  }>;
}

export interface CombinedReportSummary {
  success: boolean;
  data: CombinedReportData;
  message?: string;
}

export interface FamilyMember {
  user_id: number;
  user_name: string;
  email: string;
  mobile: string;
  role_id: number;
  created_at: string;
  updated_at: string;
  email_verified_at: string;
  role: {
    role_id: number;
    role_name: string;
    is_active: number;
    created_at: string;
    updated_at: string;
  };
}

export interface ExpenseCategory {
  category_id: number;
  category_name: string;
  description: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface IncomeCategory {
  income_category_id: number;
  income_category_name: string;
  type: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  role_id: number;
  role_name: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface MultiSelectDropdownProps {
  label: string;
  options: Array<{ value: number; label: string }>;
  selectedValues: number[];
  onSelectionChange: (selected: number[]) => void;
  placeholder?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export interface ReportsFilters {
  reportType: string;
  period: string;
  dataType: 'expense' | 'income' | 'combined';
  selectedExpenseCategories: number[];
  selectedIncomeCategories: number[];
  selectedMembers: number[];
  startDate: Date;
  endDate: Date;
}