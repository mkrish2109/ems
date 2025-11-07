import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fetchCategories, addExpense, ExpensePayload } from "@/lib/api";
import { Category, ExpenseFormData, MessageType } from "@/types/expense";

export const useExpenseForm = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: "",
    description: "",
    selectedCategory: null,
    otherCategoryName: "",
    selectedPayment: "Cash",
    shared: false,
    startDate: new Date(),
  });
  const [showOtherCategoryInput, setShowOtherCategoryInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<MessageType | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, selectedCategory: data[0].category_id }));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Auto update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setFormData(prev => {
        const newDate = new Date();
        const updatedDate = new Date(prev.startDate);
        updatedDate.setHours(
          newDate.getHours(),
          newDate.getMinutes(),
          newDate.getSeconds()
        );
        return { ...prev, startDate: updatedDate };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const resetForm = () => {
    setFormData({
      amount: "",
      description: "",
      selectedCategory: categories.length > 0 ? categories[0].category_id : null,
      otherCategoryName: "",
      selectedPayment: "Cash",
      shared: false,
      startDate: new Date(),
    });
    setShowOtherCategoryInput(false);
  };

  const handleCategorySelect = (categoryId: number) => {
    const selectedCat = categories.find(cat => cat.category_id === categoryId);
    
    if (selectedCat && selectedCat.category_name.toLowerCase() === "other") {
      setShowOtherCategoryInput(true);
      setFormData(prev => ({ ...prev, selectedCategory: categoryId }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        selectedCategory: categoryId,
        otherCategoryName: ""
      }));
      setShowOtherCategoryInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType(null);

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showMessage("Please enter a valid amount", "error");
      return;
    }

    if (!formData.selectedCategory) {
      showMessage("Please select a category", "error");
      return;
    }

    const selectedCat = categories.find(cat => cat.category_id === formData.selectedCategory);
    const isOtherCategory = selectedCat && selectedCat.category_name.toLowerCase() === "other";
    
    if (isOtherCategory && !formData.otherCategoryName.trim()) {
      showMessage("Please enter a description for the other category", "error");
      return;
    }

    if (!formData.description.trim()) {
      showMessage("Please enter a description", "error");
      return;
    }

    setIsSubmitting(true);

    const payload: ExpensePayload = {
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      expense_date: format(formData.startDate, "dd-MM-yyyy"),
      payment_method: formData.selectedPayment,
      shared: formData.shared,
      category_id: formData.selectedCategory,
    };

    if (isOtherCategory && formData.otherCategoryName.trim()) {
      payload.other_category_name = formData.otherCategoryName.trim();
    }

    try {
      await addExpense(payload);
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

  const updateFormData = (updates: Partial<ExpenseFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    categories,
    formData,
    showOtherCategoryInput,
    isSubmitting,
    message,
    messageType,
    updateFormData,
    setShowOtherCategoryInput,
    handleCategorySelect,
    handleSubmit,
  };
};