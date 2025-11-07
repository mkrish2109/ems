import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { IncomeCategory } from "@/types/income";

type MessageType = 'success' | 'error';

interface IncomeFormData {
  amount: string;
  description: string;
  selectedCategory: string;
  selectedCategoryId: number | null;
  selectedPayment: string;
  startDate: Date;
  fileName: string;
  file: File | null;
}

interface FormErrors {
  amount: string;
  category: string;
  description: string;
  date: string;
  paymentMethod: string;
  file: string;
}

export const useIncomeForm = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [formData, setFormData] = useState<IncomeFormData>({
    amount: "",
    description: "",
    selectedCategory: "",
    selectedCategoryId: null,
    selectedPayment: "Cash",
    startDate: new Date(),
    fileName: "No file chosen",
    file: null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<MessageType | null>(null);
  const [errors, setErrors] = useState<FormErrors>({
    amount: "",
    category: "",
    description: "",
    date: "",
    paymentMethod: "",
    file: ""
  });

  // Fetch categories from API
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
        setFormData(prev => ({
          ...prev,
          selectedCategory: data[0].income_category_name,
          selectedCategoryId: data[0].income_category_id
        }));
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
    if (message && messageType) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message, messageType]);

  const showMessage = (text: string, type: MessageType) => {
    setMessage(text);
    setMessageType(type);
  };

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

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = {
      amount: "",
      category: "",
      description: "",
      date: "",
      paymentMethod: "",
      file: ""
    };

    // Amount validation
    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
      isValid = false;
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
      isValid = false;
    } else if (parseFloat(formData.amount) > 10000000) {
      newErrors.amount = "Amount is too large";
      isValid = false;
    }

    // Category validation
    if (!formData.selectedCategoryId) {
      newErrors.category = "Please select a category";
      isValid = false;
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (formData.description.trim().length < 2) {
      newErrors.description = "Description must be at least 2 characters";
      isValid = false;
    } else if (formData.description.trim().length > 500) {
      newErrors.description = "Description is too long (max 500 characters)";
      isValid = false;
    }

    // Date validation
    if (!formData.startDate) {
      newErrors.date = "Date is required";
      isValid = false;
    } else if (formData.startDate > new Date()) {
      newErrors.date = "Date cannot be in the future";
      isValid = false;
    }

    // Payment method validation
    if (!formData.selectedPayment) {
      newErrors.paymentMethod = "Please select a payment method";
      isValid = false;
    }

    // File validation (optional)
    if (formData.file) {
      const validFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxFileSize = 10 * 1024 * 1024; // 10MB

      if (!validFileTypes.includes(formData.file.type)) {
        newErrors.file = "Please upload a valid file (JPG, PNG, GIF, PDF, DOC, DOCX)";
        isValid = false;
      }

      if (formData.file.size > maxFileSize) {
        newErrors.file = "File size must be less than 10MB";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

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

  const handleFileChange = (file: File | null, fileName: string) => {
    setFormData(prev => ({ ...prev, file, fileName }));

    if (file) {
      const validFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxFileSize = 10 * 1024 * 1024;

      if (!validFileTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, file: "Please upload a valid file (JPG, PNG, GIF, PDF, DOC, DOCX)" }));
      } else if (file.size > maxFileSize) {
        setErrors(prev => ({ ...prev, file: "File size must be less than 10MB" }));
      } else {
        setErrors(prev => ({ ...prev, file: "" }));
      }
    } else {
      setErrors(prev => ({ ...prev, file: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      amount: "",
      description: "",
      selectedCategory: categories.length > 0 ? categories[0].income_category_name : "",
      selectedCategoryId: categories.length > 0 ? categories[0].income_category_id : null,
      selectedPayment: "Cash",
      startDate: new Date(),
      fileName: "No file chosen",
      file: null,
    });
    clearErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setMessage("");
    setMessageType(null);
    clearErrors();

    if (!validateForm()) {
      showMessage("Please fix the errors in the form", "error");
      return;
    }

    setSubmitting(true);

    try {
      const accessToken = Cookies.get('access_token');
      const submitData = new FormData();
      
      submitData.append('amount', formData.amount);
      submitData.append('description', formData.description.trim());
      submitData.append('income_date', format(formData.startDate, 'yyyy-MM-dd'));
      submitData.append('payment_method', formData.selectedPayment);
      submitData.append('income_category_id', formData.selectedCategoryId!.toString());
      
      if (formData.file) {
        submitData.append('attachment', formData.file);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income`, {
        method: "POST",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add income");
      }

      await response.json();
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

  const updateFormData = (updates: Partial<IncomeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateErrors = (updates: Partial<FormErrors>) => {
    setErrors(prev => ({ ...prev, ...updates }));
  };

  return {
    categories,
    formData,
    loading,
    submitting,
    message,
    messageType,
    errors,
    updateFormData,
    updateErrors,
    handleFileChange,
    handleSubmit,
    handleCancel,
    validateAmount,
    validateDescription,
    showMessage,
    setMessage,
    setMessageType,
  };
};

// Export the types for use in other components
export type { IncomeFormData, FormErrors };