import { useState } from "react";
import { HiChevronDown } from "react-icons/hi";
import { IncomeCategory } from "@/types/income";

interface IncomeCategorySelectProps {
  categories: IncomeCategory[];
  selectedCategory: string;
  loading: boolean;
  error: string;
  onCategorySelect: (categoryName: string, categoryId: number) => void;
  onErrorClear: () => void;
}

export default function IncomeCategorySelect({
  categories,
  selectedCategory,
  loading,
  error,
  onCategorySelect,
  onErrorClear,
}: IncomeCategorySelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full mb-[24px]">
      <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
        Category / Source of Income *
      </label>

      <div className="relative">
        <button
          type="button"
          className={`w-full h-14 bg-white rounded-2xl px-4 flex items-center justify-between focus:outline-none focus:ring-2 cursor-pointer ${
            error ? "focus:ring-red-500 border border-red-400" : "focus:ring-[#008DD2]"
          }`}
          onClick={() => setOpen(!open)}
          disabled={loading}
        >
          <span className="text-[16px] text-[#052C4D]">
            {loading ? "Loading..." : selectedCategory || "Select Category"}
          </span>
          <HiChevronDown
            className="text-[#008DD2] transition-transform"
            size={20}
          />
        </button>

        {open && !loading && (
          <div className="absolute right-[15px] w-[124px] -mt-[18px] bg-white rounded-2xl shadow-md z-10 max-h-60 overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.income_category_id}
                type="button"
                className="w-full flex items-center justify-between px-4 py-[4px] text-left text-[14px] text-[#052C4D] hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  onCategorySelect(cat.income_category_name, cat.income_category_id);
                  onErrorClear();
                  setOpen(false);
                }}
              >
                <span>{cat.income_category_name}</span>
                <span
                  className={`h-[11px] w-[11px] rounded-full border-2 flex items-center justify-center ${
                    selectedCategory === cat.income_category_name
                      ? "border-[#008DD2]"
                      : "border-[#C8C8C8]"
                  }`}
                >
                  {selectedCategory === cat.income_category_name && (
                    <span className="w-full h-full bg-[#008DD2] rounded-full"></span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1 ml-2">{error}</p>
      )}
    </div>
  );
}