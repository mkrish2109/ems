"use client";

import "react-datepicker/dist/react-datepicker.css";
import PageHeader from "@/components/ui/PageHeader";
import MemberIncomeForm from "@/components/forms/MemberIncomeForm";
import { useIncomeCategories } from "@/hooks/useIncomeCategories";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { useIncomeMutation } from "@/hooks/useIncomeMutation";
import { validateIncomeForm } from "@/lib/validation";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function MemberIncomeContent() {
  const searchParams = useSearchParams();
  const memberId = searchParams.get("member_id");
  
  const { categories } = useIncomeCategories();
  const { selectedMember, isLoading: membersLoading } = useFamilyMembers(memberId);
  const { saveIncome, loading, error, successMessage, clearMessages } = useIncomeMutation();
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Clear messages when component mounts or when memberId changes
  useEffect(() => {
    clearMessages();
    setErrors({});
  }, [memberId, clearMessages]); // Include clearMessages in dependencies

  const handleSaveIncome = async (data: {
    amount: string;
    income_category_id: number;
    income_date: string;
    payment_method: string;
    member_user_id: string;
    description: string;
    attachment?: File | null;
  }) => {
    // Clear previous errors and messages
    setErrors({});
    clearMessages();

    const formErrors = validateIncomeForm({
      amount: data.amount,
      selectedCategory: categories.find(cat => cat.income_category_id === data.income_category_id)?.income_category_name || "",
      memberId,
      file: data.attachment
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      await saveIncome(data);
      // Success message is handled in the hook
    } catch (error) {
      // Error is handled in the hook, just log it here
      console.error('Error saving income:', error);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  if (!memberId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg">
          <PageHeader title="Add Member Income" />
          <div className="flex items-center justify-center h-40">
            <span className="text-[#052C4D]">Member ID is required</span>
          </div>
        </div>
      </div>
    );
  }

  if (membersLoading) {
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
        
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <MemberIncomeForm
          categories={categories}
          selectedMember={selectedMember}
          memberId={memberId}
          onSave={handleSaveIncome}
          onCancel={handleCancel}
          loading={loading}
          errors={errors}
          setErrors={setErrors}
        />
      </div>
    </div>
  );
}