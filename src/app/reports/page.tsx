'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import PageHeader from '@/components/ui/PageHeader';
import { AiOutlineCalendar, AiOutlineFilter } from 'react-icons/ai';

import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useCategories } from '@/hooks/useCategories';
import { useUserInfo } from '@/hooks/useUserInfo';
import { useReports } from '@/hooks/useReports';
import { ReportsFilters, Expense, Income, OriginalData } from '@/types/reports';

import FiltersSidebar from './components/FiltersSidebar';
import SummaryCards from './components/SummaryCards';
import TransactionsList from './components/TransactionsList';
import PaginationControls from './components/PaginationControls';

// Define the timeline item type based on the actual API response
type TimelineItem = {
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
};

export default function Reports() {
  const today = new Date();
  
  // Initial filters state
  const [filters, setFilters] = useState<ReportsFilters>({
    reportType: 'personal',
    period: 'custom',
    dataType: 'combined',
    selectedExpenseCategories: [],
    selectedIncomeCategories: [],
    selectedMembers: [],
    startDate: startOfMonth(today),
    endDate: endOfMonth(today),
  });

  const [showFilters, setShowFilters] = useState(false);
  const [shouldFetchData, setShouldFetchData] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Custom hooks
  const { familyMembers, isLoading: isLoadingMembers, hasFamily } = useFamilyMembers();
  const { expenseCategories, incomeCategories, isLoading: isLoadingCategories } = useCategories();
  const { isFamilyHead } = useUserInfo();
  const { summary, loading, generateReport } = useReports(filters, shouldFetchData);

  // Calculate dynamic items per page
  useEffect(() => {
    const calculateItemsPerPage = () => {
      const screenHeight = window.innerHeight;
      if (screenHeight < 700) return 3;
      if (screenHeight < 800) return 4;
      return 6;
    };

    setItemsPerPage(calculateItemsPerPage());

    const handleResize = () => {
      setItemsPerPage(calculateItemsPerPage());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply filters
  const applyFilters = () => {
    if (filters.reportType === 'member' && filters.selectedMembers.length === 0) {
      setShouldFetchData(false);
    } else {
      setShouldFetchData(true);
    }
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters: ReportsFilters = {
      reportType: 'personal',
      period: 'custom',
      dataType: 'combined',
      selectedExpenseCategories: [],
      selectedIncomeCategories: [],
      selectedMembers: [],
      startDate: startOfMonth(today),
      endDate: endOfMonth(today),
    };
    
    setFilters(defaultFilters);
    setShouldFetchData(true);
  };

  // Get period display text
  const getPeriodDisplayText = () => {
    switch (filters.period) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      case 'all': return 'All Time';
      case 'custom': return `${format(filters.startDate, 'MMM d, yyyy')} - ${format(filters.endDate, 'MMM d, yyyy')}`;
      default: return 'Custom Date Range';
    }
  };

  // Prepare data for display
  const totalIncome = summary?.data?.summary?.total_income || 0;
  const totalExpenses = summary?.data?.summary?.total_expense || 0;
  const netBalance = summary?.data?.summary?.net_flow || 0;

  // Type guard to check if item is expense or income
  const isExpenseOrIncome = (item: TimelineItem): item is TimelineItem & { type: 'expense' | 'income' } => {
    return item.type === 'expense' || item.type === 'income';
  };

  // Convert combined timeline to items
  const getCurrentItems = (): Array<Expense | Income> => {
    if (!summary?.data) return [];

    const combinedTimeline = summary.data.combined_timeline || [];

    const convertedItems = combinedTimeline
      .map((item: TimelineItem): Expense | Income | null => {
        if (!item || !isExpenseOrIncome(item)) return null;
        const originalData = item.original_data || {};

        if (item.type === 'expense') {
          return {
            expense_id: originalData.expense_id || 0,
            amount: originalData.amount,
            description: originalData.description,
            expense_date: originalData.expense_date || '',
            payment_method: originalData.payment_method,
            category: {
              category_name: originalData.other_category_name || originalData.category?.category_name || 'Other',
            },
            member_user: {
              user_name: originalData.member_user?.user_name || 'Unknown',
            },
          } as Expense;
        }

        if (item.type === 'income') {
          return {
            income_id: originalData.income_id || 0,
            amount: originalData.amount,
            description: originalData.description,
            income_date: originalData.income_date || '',
            payment_method: originalData.payment_method,
            category: {
              income_category_name: originalData.category?.income_category_name || 'Other',
            },
            member_user: {
              user_name: originalData.member_user?.user_name || 'Unknown',
            },
          } as Income;
        }

        return null;
      })
      .filter((item): item is Expense | Income => item !== null);

    return convertedItems.sort((a: Expense | Income, b: Expense | Income) => {
      const dateA = 'expense_date' in a ? a.expense_date : a.income_date;
      const dateB = 'expense_date' in b ? b.expense_date : b.income_date;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  };

  // Pagination
  const currentItems = getCurrentItems();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedItems = currentItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);

  // Prepare options for dropdowns
  const memberOptions = familyMembers.map((member) => ({
    value: member.user_id,
    label: member.user_name,
  }));

  const expenseCategoryOptions = expenseCategories.map((cat) => ({
    value: cat.category_id,
    label: cat.category_name,
  }));

  const incomeCategoryOptions = incomeCategories.map((cat) => ({
    value: cat.income_category_id,
    label: cat.income_category_name,
  }));

  const hasItems = currentItems.length > 0;
  const canExport = hasItems && !(filters.reportType === 'member' && filters.selectedMembers.length === 0);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="relative w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg flex flex-col">
        <PageHeader title="Reports" />

        <div className="flex-1 mt-[18px] px-6 space-y-4">
          {/* Period Display */}
          {filters.period !== 'custom' && (
            <div className="flex justify-between items-center mb-[20px]">
              <div className="flex justify-center items-center w-full h-[44px] bg-white rounded-2xl shadow-sm">
                <div className="flex items-center gap-1 text-[#052C4D]">
                  <AiOutlineCalendar className="h-[21px] w-[20px] text-[#008DD2]" />
                  <span className="text-[16px] font-normal">
                    {getPeriodDisplayText()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Date Pickers */}
          {filters.period === 'custom' && (
            <div className="flex justify-between items-center mb-[20px] relative">
              <div className="flex justify-center items-center w-[160px] h-[44px] bg-white rounded-2xl shadow-sm relative">
                <DatePicker
                  selected={filters.startDate}
                  onChange={(date) => date && setFilters({ ...filters, startDate: date })}
                  dateFormat="MMM d, yyyy"
                  popperClassName="!z-[100]"
                  popperPlacement="bottom-start"
                  popperModifiers={[
                    {
                      name: "preventOverflow",
                      options: {
                        boundary: "viewport",
                      },
                      fn: (state) => state,
                    },
                  ]}
                  customInput={
                    <div className="flex items-center gap-1 mt-[5px] text-[#052C4D] cursor-pointer">
                      <AiOutlineCalendar className="h-[21px] w-[20px] text-[#008DD2]" />
                      <span className="text-[16px] font-normal">
                        {format(filters.startDate, "MMM d, yyyy")}
                      </span>
                    </div>
                  }
                />
              </div>
              <div className="flex justify-center items-center w-[160px] h-[44px] bg-white rounded-2xl shadow-sm relative">
                <DatePicker
                  selected={filters.endDate}
                  onChange={(date) => date && setFilters({ ...filters, endDate: date })}
                  dateFormat="MMM d, yyyy"
                  popperClassName="!z-[100]"
                  popperPlacement="bottom-end"
                  popperModifiers={[
                    {
                      name: "preventOverflow",
                      options: {
                        boundary: "viewport",
                      },
                      fn: (state) => state,
                    },
                  ]}
                  customInput={
                    <div className="flex items-center gap-1 mt-[5px] text-[#052C4D] cursor-pointer">
                      <AiOutlineCalendar className="h-[21px] w-[20px] text-[#008DD2]" />
                      <span className="text-[16px] font-normal">
                        {format(filters.endDate, "MMM d, yyyy")}
                      </span>
                    </div>
                  }
                />
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div>
            <div className="flex justify-between items-center mb-[7px]">
              <h3 className="text-[20px] font-semibold text-[#052C4D]">
                Summary
              </h3>
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 text-[#008DD2] text-sm font-medium cursor-pointer"
              >
                <AiOutlineFilter className="h-5 w-5" />
                Filters
              </button>
            </div>
            <SummaryCards
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              netBalance={netBalance}
            />
          </div>

          {/* Transactions Section */}
          <div className="mt-3 flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[20px] font-semibold text-[#052C4D]">
                Transaction
              </h3>
              {hasItems && (
                <span className="text-sm text-[#052C4D]">
                  {currentPage} of {totalPages}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-auto space-y-4 mb-4 min-h-[200px]">
              <TransactionsList
                items={paginatedItems}
                loading={loading}
                reportType={filters.reportType}
                selectedMembers={filters.selectedMembers}
              />
            </div>

            {/* Pagination Controls */}
            {hasItems && currentItems.length > itemsPerPage && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-auto sticky bottom-0 px-6">
          <div className="my-4">
            <button
              onClick={generateReport}
              disabled={!canExport}
              className="w-full h-[56px] bg-[#008DD2] rounded-2xl flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="text-[18px] font-bold text-white">
                Export as PDF
              </span>
            </button>
          </div>
        </div>

        {/* Filters Sidebar */}
        <FiltersSidebar
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
          isFamilyHead={isFamilyHead}
          hasFamily={hasFamily}
          familyMembers={memberOptions}
          isLoadingMembers={isLoadingMembers}
          expenseCategoryOptions={expenseCategoryOptions}
          incomeCategoryOptions={incomeCategoryOptions}
          isLoadingCategories={isLoadingCategories}
        />
      </div>
    </div>
  );
}