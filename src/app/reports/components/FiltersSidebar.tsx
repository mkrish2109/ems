'use client';

import { IoClose } from 'react-icons/io5';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ReportsFilters } from '@/types/reports';

interface FiltersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ReportsFilters;
  onFiltersChange: (filters: ReportsFilters) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  isFamilyHead: boolean;
  hasFamily: boolean;
  familyMembers: Array<{ value: number; label: string }>;
  isLoadingMembers: boolean;
  expenseCategoryOptions: Array<{ value: number; label: string }>;
  incomeCategoryOptions: Array<{ value: number; label: string }>;
  isLoadingCategories: boolean;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  isFamilyHead,
  hasFamily,
  familyMembers,
  isLoadingMembers,
  expenseCategoryOptions,
  incomeCategoryOptions,
  isLoadingCategories,
}) => {
  if (!isOpen) return null;

  const availableReportTypes = isFamilyHead && hasFamily
    ? [
        { value: 'personal', label: 'Personal Report' },
        { value: 'member', label: 'Member Report' },
        { value: 'family', label: 'Family Report' },
      ]
    : [{ value: 'personal', label: 'Personal Report' }];

  const handleFilterChange = (key: keyof ReportsFilters, value: string | number[]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="absolute inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="absolute top-0 right-0 h-full w-[300px] bg-white shadow-lg">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <IoClose className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-4 h-[calc(100%-80px)] overflow-y-auto space-y-4">
          {isFamilyHead && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Report Type
              </label>
              <select
                value={filters.reportType}
                onChange={(e) => handleFilterChange('reportType', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 text-sm"
              >
                {availableReportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {!hasFamily && isFamilyHead && (
                <p className="text-xs text-gray-500 mt-1">
                  Add family members to access Member and Family reports
                </p>
              )}
            </div>
          )}

          {filters.reportType === 'member' && isFamilyHead && (
            <MultiSelectDropdown
              label="Select Member(s)"
              options={familyMembers}
              selectedValues={filters.selectedMembers}
              onSelectionChange={(values) => handleFilterChange('selectedMembers', values)}
              placeholder="Select members..."
              isLoading={isLoadingMembers}
              emptyMessage="No family members available"
            />
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Data Type
            </label>
            <select
              value={filters.dataType}
              onChange={(e) => handleFilterChange('dataType', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 text-sm"
            >
              <option value="combined">Combined</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          {(filters.dataType === 'expense' || filters.dataType === 'combined') && (
            <MultiSelectDropdown
              label="Expense Categories"
              options={expenseCategoryOptions}
              selectedValues={filters.selectedExpenseCategories}
              onSelectionChange={(values) => handleFilterChange('selectedExpenseCategories', values)}
              placeholder="Select expense categories..."
              isLoading={isLoadingCategories}
              emptyMessage="No expense categories available"
            />
          )}

          {(filters.dataType === 'income' || filters.dataType === 'combined') && (
            <MultiSelectDropdown
              label="Income Categories"
              options={incomeCategoryOptions}
              selectedValues={filters.selectedIncomeCategories}
              onSelectionChange={(values) => handleFilterChange('selectedIncomeCategories', values)}
              placeholder="Select income categories..."
              isLoading={isLoadingCategories}
              emptyMessage="No income categories available"
            />
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Period
            </label>
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Date Range</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <button
            onClick={onResetFilters}
            className="w-full py-3 border rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
          <button
            onClick={onApplyFilters}
            className="w-full py-3 bg-[#008DD2] text-white rounded-lg font-medium hover:bg-[#0070f3] transition-colors cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersSidebar;