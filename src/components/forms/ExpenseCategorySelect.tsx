import { useState } from "react";
import { HiChevronDown } from "react-icons/hi";
import { Category } from "@/types/expense";

interface ExpenseCategorySelectProps {
  categories: Category[];
  selectedCategory: number | null;
  otherCategoryName: string;
  showOtherCategoryInput: boolean;
  onCategorySelect: (categoryId: number) => void;
  onOtherCategoryChange: (name: string) => void;
  onShowOtherInputChange: (show: boolean) => void;
}

export default function ExpenseCategorySelect({
  categories,
  selectedCategory,
  otherCategoryName,
  showOtherCategoryInput,
  onCategorySelect,
  onOtherCategoryChange,
  onShowOtherInputChange,
}: ExpenseCategorySelectProps) {
  const [open, setOpen] = useState(false);

  const getCategoryDisplayText = () => {
    if (selectedCategory) {
      const selectedCat = categories.find(cat => cat.category_id === selectedCategory);
      if (selectedCat) {
        if (selectedCat.category_name.toLowerCase() === "other" && otherCategoryName) {
          return otherCategoryName;
        }
        return selectedCat.category_name;
      }
    }
    return "Select Category";
  };

  const handleCategorySelect = (categoryId: number) => {
    onCategorySelect(categoryId);
    setOpen(false);
  };

  const mainCategories = categories.filter(cat => cat.category_name.toLowerCase() !== "other");
  const otherCategory = categories.find(cat => cat.category_name.toLowerCase() === "other");

  return (
    <div className="w-full mb-[24px]">
      <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
        Category
      </label>
      
      {showOtherCategoryInput && (
        <div className="mb-3">
          <input
            type="text"
            placeholder="Enter category name"
            value={otherCategoryName}
            onChange={(e) => onOtherCategoryChange(e.target.value)}
            className="w-full h-14 bg-white rounded-2xl px-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-[16px] text-gray-800"
            maxLength={100}
          />
          <button
            type="button"
            onClick={() => {
              onShowOtherInputChange(false);
              onOtherCategoryChange("");
              if (mainCategories.length > 0) {
                onCategorySelect(mainCategories[0].category_id);
              }
            }}
            className="text-sm text-[#008DD2] mt-2 hover:underline cursor-pointer"
          >
            ← Back to predefined categories
          </button>
        </div>
      )}

      {!showOtherCategoryInput && (
        <div className="relative">
          <button
            type="button"
            className="w-full h-14 bg-white rounded-2xl px-4 flex items-center justify-between focus:outline-none cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            <span className="text-[16px] text-[#052C4D]">
              {getCategoryDisplayText()}
            </span>
            <HiChevronDown
              className="text-[#008DD2] transition-transform"
              size={20}
            />
          </button>
          {open && (
            <div className="absolute right-[15px] w-[180px] -mt-[18px] bg-white rounded-2xl shadow-md z-10 max-h-60 overflow-y-auto">
              {mainCategories.map((cat) => (
                <button
                  key={cat.category_id}
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-[4px] text-left text-[14px] text-[#052C4D] hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleCategorySelect(cat.category_id)}
                >
                  <span>{cat.category_name}</span>
                  <span
                    className={`h-[11px] w-[11px] rounded-full border-2 flex items-center justify-center ${
                      selectedCategory === cat.category_id
                        ? "border-[#008DD2]"
                        : "border-[#C8C8C8]"
                    }`}
                  >
                    {selectedCategory === cat.category_id && (
                      <span className="w-full h-full bg-[#008DD2] rounded-full"></span>
                    )}
                  </span>
                </button>
              ))}
              
              {otherCategory && (
                <>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-[4px] text-left text-[14px] text-[#008DD2] hover:bg-gray-50 font-medium cursor-pointer"
                    onClick={() => otherCategory && handleCategorySelect(otherCategory.category_id)}
                  >
                    <span>Other</span>
                    <span
                      className={`h-[11px] w-[11px] rounded-full border-2 flex items-center justify-center ${
                        showOtherCategoryInput
                          ? "border-[#008DD2]"
                          : "border-[#C8C8C8]"
                      }`}
                    >
                      {showOtherCategoryInput && (
                        <span className="w-full h-full bg-[#008DD2] rounded-full"></span>
                      )}
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}