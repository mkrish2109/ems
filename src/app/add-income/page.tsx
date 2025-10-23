"use client";

import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import PageHeader from "@/components/ui/PageHeader";
import { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import { AiOutlineCalendar } from "react-icons/ai";
import { HiChevronDown, HiCheckCircle, HiXCircle } from "react-icons/hi";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// Define the category type based on your API response
type IncomeCategory = {
  income_category_id: number;
  income_category_name: string;
  type: string;
  is_active: number;
  created_at: string;
  updated_at: string;
};

type MessageType = "success" | "error" | null;

export default function AddIncome() {
  const router = useRouter();
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const paymentMethods = ["UPI Pay", "Cash", "Card"];
  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [openPayment, setOpenPayment] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [fileName, setFileName] = useState("No file chosen");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // Message states
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<MessageType>(null);

  // Validation states
  const [errors, setErrors] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
    paymentMethod: "",
    file: ""
  });

  // Fetch categories from API - wrapped in useCallback to prevent infinite re-renders
  const fetchCategories = useCallback(async () => {
    try {
      const accessToken = Cookies.get('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income-categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      setCategories(data);
      
      // Set default selected category to the first one if available
      if (data.length > 0) {
        setSelectedCategory(data[0].income_category_name);
        setSelectedCategoryId(data[0].income_category_id);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      showMessage("Failed to load categories. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

  // Clear all errors
  const clearErrors = () => {
    setErrors({
      amount: "",
      category: "",
      description: "",
      date: "",
      paymentMethod: "",
      file: ""
    });
  };

  // Validate form function
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      amount: "",
      category: "",
      description: "",
      date: "",
      paymentMethod: "",
      file: ""
    };

    // Amount validation
    if (!amount.trim()) {
      newErrors.amount = "Amount is required";
      isValid = false;
    } else if (parseFloat(amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
      isValid = false;
    } else if (parseFloat(amount) > 10000000) { // 10 million limit
      newErrors.amount = "Amount is too large";
      isValid = false;
    }

    // Category validation
    if (!selectedCategoryId) {
      newErrors.category = "Please select a category";
      isValid = false;
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (description.trim().length < 2) {
      newErrors.description = "Description must be at least 2 characters";
      isValid = false;
    } else if (description.trim().length > 500) {
      newErrors.description = "Description is too long (max 500 characters)";
      isValid = false;
    }

    // Date validation
    if (!startDate) {
      newErrors.date = "Date is required";
      isValid = false;
    } else if (startDate > new Date()) {
      newErrors.date = "Date cannot be in the future";
      isValid = false;
    }

    // Payment method validation
    if (!selectedPayment) {
      newErrors.paymentMethod = "Please select a payment method";
      isValid = false;
    }

    // File validation (optional)
    if (file) {
      const validFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxFileSize = 10 * 1024 * 1024; // 10MB

      if (!validFileTypes.includes(file.type)) {
        newErrors.file = "Please upload a valid file (JPG, PNG, GIF, PDF, DOC, DOCX)";
        isValid = false;
      }

      if (file.size > maxFileSize) {
        newErrors.file = "File size must be less than 10MB";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Real-time validation for amount
  const validateAmount = (value: string) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, amount: "Amount is required" }));
    } else if (parseFloat(value) <= 0) {
      setErrors(prev => ({ ...prev, amount: "Amount must be greater than 0" }));
    } else if (parseFloat(value) > 10000000) {
      setErrors(prev => ({ ...prev, amount: "Amount is too large" }));
    } else {
      setErrors(prev => ({ ...prev, amount: "" }));
    }
  };

  // Real-time validation for description
  const validateDescription = (value: string) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, description: "Description is required" }));
    } else if (value.trim().length < 2) {
      setErrors(prev => ({ ...prev, description: "Description must be at least 2 characters" }));
    } else if (value.trim().length > 500) {
      setErrors(prev => ({ ...prev, description: "Description is too long (max 500 characters)" }));
    } else {
      setErrors(prev => ({ ...prev, description: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);

      // Validate file
      const validFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxFileSize = 10 * 1024 * 1024; // 10MB

      if (!validFileTypes.includes(selectedFile.type)) {
        setErrors(prev => ({ ...prev, file: "Please upload a valid file (JPG, PNG, GIF, PDF, DOC, DOCX)" }));
      } else if (selectedFile.size > maxFileSize) {
        setErrors(prev => ({ ...prev, file: "File size must be less than 10MB" }));
      } else {
        setErrors(prev => ({ ...prev, file: "" }));
      }
    }
  };

  // Reset form function
  const resetForm = () => {
    setAmount("");
    setDescription("");
    setSelectedCategory(categories.length > 0 ? categories[0].income_category_name : "");
    setSelectedCategoryId(categories.length > 0 ? categories[0].income_category_id : null);
    setSelectedPayment("Cash");
    setStartDate(new Date());
    setFileName("No file chosen");
    setFile(null);
    clearErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages and errors
    setMessage("");
    setMessageType(null);
    clearErrors();

    // Validate form
    if (!validateForm()) {
      showMessage("Please fix the errors in the form", "error");
      return;
    }

    setSubmitting(true);

    try {
      const accessToken = Cookies.get('access_token');
      const formData = new FormData();
      
      // Add form data
      formData.append('amount', amount);
      formData.append('description', description.trim());
      formData.append('income_date', format(startDate, 'yyyy-MM-dd'));
      formData.append('payment_method', selectedPayment);
      formData.append('income_category_id', selectedCategoryId!.toString());
      
      // Add file if selected
      if (file) {
        formData.append('attachment', file);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income`, {
        method: "POST",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add income");
      }

      const result = await response.json();
      console.log("Income added successfully:", result);
      
      // Clear form on successful submission
      resetForm();
      showMessage("Income saved successfully!", "success");
      
    } catch (error) {
      console.error("Error adding income:", error);
      if (error instanceof Error) {
        showMessage(error.message, "error");
      } else {
        showMessage("Failed to save income. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg">
        <PageHeader title="Add Self Income" />

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

        <form className="px-6 mt-[11px] space-y-5.5" onSubmit={handleSubmit}>
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
                type="number"
                placeholder="Enter amount"
                className={`w-full h-[56px] bg-white rounded-2xl pl-10 pr-4 focus:outline-none focus:ring-2 ${
                  errors.amount ? "focus:ring-red-500 border border-red-400" : "focus:ring-[#008DD2]"
                } placeholder:text-[#C8C8C8] text-[18px] text-gray-800`}
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  validateAmount(e.target.value);
                }}
                required
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1 ml-2">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div className="w-full mb-[24px]">
            <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
              Category / Source of Income *
            </label>

            <div className="relative">
              <button
                type="button"
                className={`w-full h-14 bg-white rounded-2xl px-4 flex items-center justify-between focus:outline-none focus:ring-2 cursor-pointer ${
                  errors.category ? "focus:ring-red-500 border border-red-400" : "focus:ring-[#008DD2]"
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
                        setSelectedCategory(cat.income_category_name);
                        setSelectedCategoryId(cat.income_category_id);
                        setOpen(false);
                        setErrors(prev => ({ ...prev, category: "" }));
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
            {errors.category && (
              <p className="text-red-500 text-sm mt-1 ml-2">{errors.category}</p>
            )}
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
              Date & Time *
            </label>
            <div className={`flex h-[56px] justify-between bg-white rounded-2xl p-4 shadow-sm ${
              errors.date ? "border border-red-400" : ""
            }`}>
              {/* Calendar + Date Picker */}
              <DatePicker
                selected={startDate}
                onChange={(date) => date && setStartDate(date)}
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
                  <div className="flex items-center gap-2 text-[#052C4D] cursor-pointer">
                    <AiOutlineCalendar className="h-6 w-6 text-[#008DD2]" />
                    <span className="text-lg font-normal">
                      {format(startDate, "MMM d, yyyy")}
                    </span>
                  </div>
                }
              />
            </div>
            {errors.date && (
              <p className="text-red-500 text-sm mt-1 ml-2">{errors.date}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="w-full">
            <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
              Payment Method *
            </label>

            <div className="relative">
              <button
                type="button"
                className={`w-full h-14 bg-white rounded-2xl px-4 flex items-center justify-between focus:outline-none focus:ring-2 cursor-pointer ${
                  errors.paymentMethod ? "focus:ring-red-500 border border-red-400" : "focus:ring-[#008DD2]"
                }`}
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
                        setErrors(prev => ({ ...prev, paymentMethod: "" }));
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
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm mt-1 ml-2">{errors.paymentMethod}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
              Notes / Description *
            </label>
            <input
              placeholder="August Salary"
              className={`w-full h-[56px] bg-white rounded-2xl px-4 focus:outline-none focus:ring-2 ${
                errors.description ? "focus:ring-red-500 border border-red-400" : "focus:ring-[#008DD2]"
              } placeholder:text-[#C8C8C8] text-[18px] text-gray-800`}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                validateDescription(e.target.value);
              }}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1 ml-2">{errors.description}</p>
            )}
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
              Attachment / Proof
            </label>
            <div className={`w-full h-[56px] bg-white rounded-2xl px-4 flex items-center justify-between focus-within:ring-2 ${
              errors.file ? "focus-within:ring-red-500 border border-red-400" : "focus-within:ring-[#008DD2]"
            }`}>
              <input
                type="file"
                id="attachment"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <label
                htmlFor="attachment"
                className="bg-[#E5E7EB] text-gray-700 text-[14px] flex aling-center font-medium px-4 py-1 rounded-lg cursor-pointer hover:bg-[#d1d5db] transition"
              >
                Choose file
              </label>
              <span className="text-[#C8C8C8] text-[16px] ml-3 truncate">
                {fileName}
              </span>
            </div>
            {errors.file && (
              <p className="text-red-500 text-sm mt-1 ml-2">{errors.file}</p>
            )}
          </div>

          {/* Cancel & Save */}
          <div className="flex justify-between space-x-4 mb-[19px]">
            <button
              type="button"
              onClick={handleCancel}
              className="w-[143px] h-[45px] bg-[#008DD2] rounded-[10px] flex items-center justify-center cursor-pointer"
              disabled={submitting}
            >
              <span className="text-[16px] font-bold text-white">Cancel</span>
            </button>
            <button
              type="submit"
              className="w-[143px] h-[45px] bg-[#26BB84] rounded-[10px] flex items-center justify-center disabled:opacity-50 cursor-pointer"
              disabled={submitting}
            >
              <span className="text-[16px] font-bold text-white">
                {submitting ? "Saving..." : "Save Income"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}