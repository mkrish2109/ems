'use client';

import { format } from 'date-fns';
import { Expense, Income } from '@/types/reports';

interface TransactionsListProps {
  items: Array<Expense | Income>;
  loading: boolean;
  reportType: string;
  selectedMembers: number[];
  // currentPage: number; // Removed unused prop
  // totalPages: number; // Removed unused prop
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  items,
  loading,
  reportType,
  selectedMembers,
  // currentPage, // Removed unused prop
  // totalPages, // Removed unused prop
}) => {
  const renderTransactionItem = (item: Expense | Income) => {
    const isExpense = 'expense_id' in item;
    const amount = parseFloat(item.amount);
    const date = isExpense ? item.expense_date : item.income_date;
    const categoryName = isExpense
      ? item.category.category_name
      : item.category.income_category_name;
    const description = item.description || 'No description';
    const userName = item.member_user?.user_name || 'Unknown';
    const userInitial = userName.charAt(0).toUpperCase();

    return (
      <div
        key={isExpense ? `expense-${item.expense_id}` : `income-${item.income_id}`}
        className="flex items-center"
      >
        <div className="w-[50px] h-[50px] bg-[#008DD2] rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-[20px] font-medium">
            {userInitial}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="text-[18px] font-medium text-[#052C4D] leading-none line-clamp-2">
            {description}
          </h4>
          <p className="text-[11px] text-[#052C4D] mt-1 line-clamp-1">
            {format(new Date(date), 'dd MMM yy')} • {categoryName}
          </p>
        </div>
        <span
          className={`text-[20px] font-medium ${
            isExpense ? 'text-[#FF0004]' : 'text-[#26BB84]'
          }`}
        >
          {isExpense ? '-' : '+'} ${Math.abs(amount).toFixed(2)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <span className="text-[#052C4D]">
          Loading transactions...
        </span>
      </div>
    );
  }

  if (reportType === 'member' && selectedMembers.length === 0) {
    return (
      <div className="text-center py-4">
        <span className="text-[#052C4D]">
          Please select family members to view transactions
        </span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-4">
        <span className="text-[#052C4D]">
          No transactions found for selected filters
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map(renderTransactionItem)}
    </div>
  );
};

export default TransactionsList;