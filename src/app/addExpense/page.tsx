"use client";

import "react-datepicker/dist/react-datepicker.css";
import PageHeader from "@/components/ui/PageHeader";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { HiChevronDown, HiCheckCircle, HiXCircle } from "react-icons/hi";
import DatePicker from "react-datepicker";
import { AiOutlineCalendar, AiOutlineClockCircle } from "react-icons/ai";
import { fetchCategories, addExpense, ExpensePayload } from "@/lib/api";

type MessageType = "success" | "error" | null;

export default function AddExpense() {
  const [categories, setCategories] = useState<
    { category_id: number; category_name: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [otherCategoryName, setOtherCategoryName] = useState("");
  const [showOtherCategoryInput, setShowOtherCategoryInput] = useState(false);
  const [open, setOpen] = useState(false);
  const paymentMethods = ["UPI Pay", "Cash", "Card"];
  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [openPayment, setOpenPayment] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [shared, setShared] = useState(false);

  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<MessageType>(null);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
        if (data.length > 0) setSelectedCategory(data[0].category_id);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Auto update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setStartDate((prevDate) => {
        const newDate = new Date();
        prevDate.setHours(
          newDate.getHours(),
          newDate.getMinutes(),
          newDate.getSeconds()
        );
        return new Date(prevDate);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  // Show message function
  const showMessage = (text: string, type: MessageType) => {
    setMessage(text);
    setMessageType(type);
  };

  // Reset form function
  const resetForm = () => {
    setAmount("");
    setDescription("");
    setSelectedCategory(
      categories.length > 0 ? categories[0].category_id : null
    );
    setOtherCategoryName("");
    setShowOtherCategoryInput(false);
    setSelectedPayment("Cash");
    setShared(false);
    setStartDate(new Date());
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: number) => {
    const selectedCat = categories.find(cat => cat.category_id === categoryId);
    
    if (selectedCat && selectedCat.category_name.toLowerCase() === "other") {
      setShowOtherCategoryInput(true);
      setSelectedCategory(categoryId); // Set to the existing "other" category ID (4)
      setOpen(false);
    } else {
      setSelectedCategory(categoryId);
      setShowOtherCategoryInput(false);
      setOtherCategoryName("");
      setOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setMessage("");
    setMessageType(null);

    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      showMessage("Please enter a valid amount", "error");
      return;
    }

    if (!selectedCategory) {
      showMessage("Please select a category", "error");
      return;
    }

    // Additional validation for "other" category
    const selectedCat = categories.find(cat => cat.category_id === selectedCategory);
    const isOtherCategory = selectedCat && selectedCat.category_name.toLowerCase() === "other";
    
    if (isOtherCategory && !otherCategoryName.trim()) {
      showMessage("Please enter a description for the other category", "error");
      return;
    }

    if (!description.trim()) {
      showMessage("Please enter a description", "error");
      return;
    }

    setIsSubmitting(true);

    // Prepare payload
    const payload: ExpensePayload = {
      amount: parseFloat(amount),
      description: description.trim(),
      expense_date: format(startDate, "dd-MM-yyyy"),
      payment_method: selectedPayment,
      shared,
      category_id: selectedCategory,
    };

    // Add other_category_name only when using the "other" category
    if (isOtherCategory && otherCategoryName.trim()) {
      payload.other_category_name = otherCategoryName.trim();
    }

    try {
      const result = await addExpense(payload);
      console.log("Expense added:", result);

      // Clear form on successful submission
      resetForm();
      showMessage("Expense saved successfully!", "success");
    } catch (err: unknown) {
      console.error("Error adding expense:", err);
      if (err instanceof Error) {
        showMessage(err.message, "error");
      } else {
        showMessage("Failed to save expense", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const currentTime = startDate;
      date.setHours(
        currentTime.getHours(),
        currentTime.getMinutes(),
        currentTime.getSeconds()
      );
      setStartDate(date);
    }
  };

  // Get display text for category dropdown
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

  // Filter out the "other" category from the main list since we handle it separately
  const mainCategories = categories.filter(cat => cat.category_name.toLowerCase() !== "other");
  const otherCategory = categories.find(cat => cat.category_name.toLowerCase() === "other");

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg">
        <PageHeader title="Add Expense" />

        {/* Message Display */}
        {message && (
          <div
            className={`mx-6 mt-4 p-4 rounded-2xl flex items-center space-x-3 ${
              messageType === "success"
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            {messageType === "success" ? (
              <HiCheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <HiXCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="text-sm font-medium">{message}</span>
            <button
              onClick={() => {
                setMessage("");
                setMessageType(null);
              }}
              className="ml-auto text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <HiXCircle className="h-4 w-4" />
            </button>
          </div>
        )}

        <form className="px-6 space-y-6" onSubmit={handleSubmit}>
          {/* Amount */}
          <div className="mb-[19px]">
            <label className="block text-[16px] font-medium text-[#052C4D] mt-[12px] mb-[6px]">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#052C4D] text-[18px]">
                $
              </span>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-[56px] bg-white rounded-2xl pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-[18px] text-gray-800"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Category */}
          <div className="w-full mb-[24px]">
            <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
              Category
            </label>
            
            {/* Other Category Input (shown when "Other" is selected) */}
            {showOtherCategoryInput && (
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Enter category name"
                  value={otherCategoryName}
                  onChange={(e) => setOtherCategoryName(e.target.value)}
                  className="w-full h-14 bg-white rounded-2xl px-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-[16px] text-gray-800"
                  maxLength={100}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowOtherCategoryInput(false);
                    setOtherCategoryName("");
                    setSelectedCategory(mainCategories.length > 0 ? mainCategories[0].category_id : null);
                  }}
                  className="text-sm text-[#008DD2] mt-2 hover:underline cursor-pointer"
                >
                  ← Back to predefined categories
                </button>
              </div>
            )}

            {/* Category Dropdown (hidden when "Other" input is shown) */}
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
                    {/* Predefined Categories (excluding "other") */}
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
                    
                    {/* Divider */}
                    {otherCategory && (
                      <>
                        <div className="border-t border-gray-200 my-1"></div>
                        
                        {/* Other Category Option */}
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

          {/* Description */}
          <div className="mb-[19px]">
            <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense description"
              className="w-full bg-white rounded-2xl p-4 focus:outline-none focus:ring-[#008DD2] resize-none placeholder:text-[#C8C8C8] text-[18px] text-gray-800"
            />
          </div>

          {/* Date & Time */}
          <div className="mb-[24px]">
            <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
              Date & Time
            </label>
            <div className="flex h-[56px] justify-between bg-white rounded-2xl p-4 shadow-sm">
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                dateFormat="MMM d, yyyy"
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
                  <div className="flex items-center gap-2 text-[#052C4D] cursor-pointer">
                    <AiOutlineCalendar className="h-[21px] w-[20px] text-[#008DD2]" />
                    <span className="text-[16px] font-normal">
                      {format(startDate, "MMM d, yyyy")}
                    </span>
                  </div>
                }
              />

              <div className="flex items-center gap-2 text-[#052C4D]">
                <span className="text-[16px] font-normal">
                  {format(startDate, "h:mm aa")}
                </span>
                <AiOutlineClockCircle size={20} className="text-[#008DD2]" />
              </div>
            </div>
          </div>

          {/* Shared Toggle */}
          <div className="flex items-center justify-between mb-[14px]">
            <span className="text-[20px] font-medium text-[#052C4D]">
              Shared with Family
            </span>
            <button
              type="button"
              onClick={() => setShared(!shared)}
              className={`relative inline-flex h-[44px] w-[86px] items-center rounded-full transition cursor-pointer ${
                shared ? "bg-[#008DD2]" : "bg-white"
              }`}
            >
              <span
                className={`absolute h-[36px] w-[36px] rounded-full transition ${
                  shared
                    ? "translate-x-[42px] bg-white"
                    : "translate-x-1 bg-[#008DD2]"
                }`}
              ></span>
            </button>
          </div>

          {/* Payment Method */}
          <div className="w-full mb-[75px]">
            <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
              Payment Method
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full h-14 bg-white rounded-2xl px-4 flex items-center justify-between focus:outline-none cursor-pointer"
                onClick={() => setOpenPayment(!openPayment)}
              >
                <span className="text-[16px] text-[#052C4D]">
                  {selectedPayment}
                </span>
                <HiChevronDown
                  className="text-[#008DD2] transition-transform"
                  size={20}
                />
              </button>
              {openPayment && (
                <div className="absolute right-[15px] w-[160px] -mt-[18px] bg-white rounded-2xl shadow-md z-10">
                  {paymentMethods.map((method) => (
                    <button
                      key={method}
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-[6px] text-left text-[14px] text-[#052C4D] hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedPayment(method);
                        setOpenPayment(false);
                      }}
                    >
                      <span>{method}</span>
                      <span
                        className={`h-[11px] w-[11px] rounded-full border-2 flex items-center justify-center ${
                          selectedPayment === method
                            ? "border-[#008DD2]"
                            : "border-[#C8C8C8]"
                        }`}
                      >
                        {selectedPayment === method && (
                          <span className="w-full h-full bg-[#008DD2] rounded-full"></span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-[#008DD2] rounded-2xl flex items-center justify-center mt-[24px] mb-[29px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="text-[18px] font-bold text-white">
              {isSubmitting ? "Saving..." : "Save"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}