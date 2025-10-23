"use client";

import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import PageHeader from "@/components/ui/PageHeader";
import { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import { AiOutlineCalendar } from "react-icons/ai";
import { HiChevronDown } from "react-icons/hi";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

type IncomeCategory = {
  income_category_id: number;
  income_category_name: string;
  type: string;
  is_active: number;
};

type FamilyMember = {
  user_id: number;
  user_name: string;
  email: string;
  mobile: string;
  role: {
    role_id: number;
    role_name: string;
  };
};

type ApiResponse = {
  message?: string;
  data?: any;
  error?: string;
};

export default function MemberIncomeContent() {
  const searchParams = useSearchParams();
  const memberId = searchParams.get("member_id");
  
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  
  const paymentMethods = ["UPI Pay", "Cash", "Card"];
  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [openPayment, setOpenPayment] = useState(false);
  
  const [startDate, setStartDate] = useState(new Date());
  const [fileName, setFileName] = useState("No file chosen");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [selectedMember, setSelectedMember] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState("");

  // Memoized fetch functions to avoid useEffect dependency warnings
  const fetchIncomeCategories = useCallback(async () => {
    try {
      const accessToken = Cookies.get("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income-categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0) {
          setSelected(data[0].income_category_name);
        }
      } else {
        console.error("Failed to fetch income categories");
      }
    } catch (error) {
      console.error("Failed to fetch income categories:", error);
    }
  }, []);

  const fetchFamilyMembers = useCallback(async () => {
    try {
      const accessToken = Cookies.get("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family/members`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        const data: ApiResponse = await res.json();
        // Handle both response formats
        const membersData = data.data || data || [];
        
        // Auto-select the member based on member_id from URL
        if (memberId && membersData.length > 0) {
          const member = membersData.find((m: FamilyMember) => m.user_id.toString() === memberId);
          if (member) {
            setSelectedMember(member.user_name);
          }
        }
      } else {
        console.error("Failed to fetch family members");
      }
    } catch (error) {
      console.error("Failed to fetch family members:", error);
    }
  }, [memberId]);

  useEffect(() => {
    if (memberId) {
      fetchIncomeCategories();
      fetchFamilyMembers();
    }
  }, [memberId, fetchIncomeCategories, fetchFamilyMembers]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }

    if (!selected) {
      newErrors.category = "Please select a category";
    }

    if (!memberId) {
      newErrors.member = "Member ID is required";
    }

    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        newErrors.file = "Please upload a valid file (JPEG, PNG, JPG, PDF)";
      }

      if (file.size > maxSize) {
        newErrors.file = "File size must be less than 5MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setFileName(selectedFile?.name || "No file chosen");
    
    // Clear file error when new file is selected
    if (errors.file) {
      setErrors(prev => ({ ...prev, file: "" }));
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleSaveIncome = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const accessToken = Cookies.get("access_token");
      const selectedCategory = categories.find(cat => cat.income_category_name === selected);
      
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("description", "Income entry");
      formData.append("income_date", format(startDate, "yyyy-MM-dd"));
      formData.append("payment_method", selectedPayment);
      formData.append("income_category_id", selectedCategory?.income_category_id?.toString() || "");
      formData.append("member_user_id", memberId || "");
      
      if (file) {
        formData.append("attachment", file);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const result: ApiResponse = await res.json();

      if (!res.ok) {
        throw new Error(result.message || result.error || "Failed to save income");
      }

      setSuccessMessage(result.message || "Income saved successfully!");
      
      // Reset form
      setAmount("");
      setFileName("No file chosen");
      setFile(null);
      setErrors({});
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
      
    } catch (error) {
      console.error("Failed to save income:", error);
      setErrors({ submit: error instanceof Error ? error.message : "Failed to save income. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    // Allow only numbers and one decimal point
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value) || value === "") {
      setAmount(value);
      // Clear amount error when user starts typing
      if (errors.amount) {
        setErrors(prev => ({ ...prev, amount: "" }));
      }
    }
  };

  // Show loading state while memberId is being retrieved
  if (!memberId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg">
          <PageHeader title="Add Member Income" />
          <div className="flex items-center justify-center h-40">
            <span className="text-[#052C4D]">Loading member information...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg">
        <PageHeader title="Add Member Income" />
        
        {/* Success Message */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errors.submit}
          </div>
        )}

        <form className="px-6 mt-[11px] space-y-5.5" onSubmit={(e) => e.preventDefault()}>
          {/* Amount */}
          <div className="w-full">
            <label className="block text-[16px] font-medium text-[#052C4D] mt-[12px] mb-[6px]">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#052C4D] text-[18px]">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`w-full h-[56px] bg-white rounded-2xl pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-[18px] text-gray-800 ${
                  errors.amount ? 'border-2 border-red-500' : ''
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Categories */}
          <div className="w-full mb-[24px]">
            <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
              Categories *
            </label>
            <div className="relative">
              <button
                type="button"
                className={`w-full h-14 bg-white rounded-2xl px-4 flex items-center justify-between focus:outline-none cursor-pointer ${
                  errors.category ? 'border-2 border-red-500' : ''
                }`}
                onClick={() => setOpen(!open)}
              >
                <span className="text-[16px] text-[#052C4D]">
                  {selected || "Select category"}
                </span>
                <HiChevronDown
                  className="text-[#008DD2] transition-transform"
                  size={20}
                />
              </button>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}

              {open && (
                <div className="absolute right-[15px] w-[124px] -mt-[18px] bg-white rounded-2xl shadow-md z-10 max-h-60 overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.income_category_id}
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-[4px] text-left text-[14px] text-[#052C4D] cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelected(cat.income_category_name);
                        setOpen(false);
                        if (errors.category) {
                          setErrors(prev => ({ ...prev, category: "" }));
                        }
                      }}
                    >
                      <span>{cat.income_category_name}</span>
                      <span
                        className={`h-[11px] w-[11px] rounded-full border-2 flex items-center justify-center ${
                          selected === cat.income_category_name
                            ? "border-[#008DD2]"
                            : "border-[#C8C8C8]"
                        }`}
                      >
                        {selected === cat.income_category_name && (
                          <span className="w-full h-full bg-[#008DD2] rounded-full"></span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
              Date & Time *
            </label>
            <div className="flex h-[56px] justify-between bg-white rounded-2xl p-4 shadow-sm">
              <DatePicker
                selected={startDate}
                onChange={(date) => date && setStartDate(date)}
                dateFormat="MMM d, yyyy"
                popperClassName="!z-[100]"
                popperPlacement="bottom-start"
                customInput={
                  <div className="flex items-center gap-2 text-[#052C4D] cursor-pointer">
                    <AiOutlineCalendar className="h-6 w-6 text-[#008DD2]" />
                    <span className="text-lg font-normal">
                      {format(startDate, "MMM d, yyyy")}
                    </span>
                  </div>
                }
              />
            </div>
          </div>

          {/* Member - Disabled */}
          <div className="w-full">
            <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
              Member *
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full h-14 bg-gray-100 rounded-2xl px-4 flex items-center justify-between cursor-not-allowed"
                disabled
              >
                <span className="text-[16px] text-[#052C4D]">
                  {selectedMember || "Loading..."}
                </span>
                <HiChevronDown
                  className="text-[#C8C8C8] transition-transform"
                  size={20}
                />
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="w-full">
            <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
              Payment Method *
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
                      className="w-full flex items-center justify-between px-4 py-[6px] text-left text-[14px] text-[#052C4D] cursor-pointer hover:bg-gray-50"
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

          {/* Attachment */}
          <div>
            <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
              Attachment / Proof
            </label>
            <div className={`w-full h-[56px] bg-white rounded-2xl px-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-[#008DD2] ${
              errors.file ? 'border-2 border-red-500' : ''
            }`}>
              <input
                type="file"
                id="attachment"
                onChange={handleFileChange}
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
              />
              <label
                htmlFor="attachment"
                className="bg-[#E5E7EB] text-gray-700 text-[14px] flex items-center font-medium px-4 py-1 rounded-lg cursor-pointer hover:bg-[#d1d5db] transition"
              >
                Choose file
              </label>
              <span className="text-[#052C4D] text-[14px] ml-3 truncate flex-1">
                {fileName}
              </span>
            </div>
            {errors.file && (
              <p className="text-red-500 text-sm mt-1">{errors.file}</p>
            )}
            <p className="text-[12px] text-gray-500 mt-1">
              Supported formats: JPG, PNG, PDF (Max 5MB)
            </p>
          </div>

          {/* Cancel & Save */}
          <div className="flex justify-between space-x-4 mb-[19px]">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="w-[143px] h-[45px] bg-[#008DD2] rounded-[10px] flex items-center justify-center disabled:opacity-50"
            >
              <span className="text-[16px] font-bold text-white">Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSaveIncome}
              disabled={loading}
              className="w-[143px] h-[45px] bg-[#26BB84] rounded-[10px] flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-[16px] font-bold text-white">
                {loading ? "Saving..." : "Save Income"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}