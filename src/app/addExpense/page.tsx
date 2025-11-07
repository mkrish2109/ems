"use client";

import PageHeader from "@/components/ui/PageHeader";
import ExpenseForm from "@/components/forms/ExpenseForm";
import MessageAlert from "@/components/ui/MessageAlert";
import { useExpenseForm } from "@/hooks/useExpenseForm";

export default function AddExpense() {
  const { 
    message, 
    messageType, 
    categories,
    formData,
    showOtherCategoryInput,
    isSubmitting,
    updateFormData,
    setShowOtherCategoryInput, // Fixed variable name
    handleCategorySelect,
    handleSubmit,
  } = useExpenseForm();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg">
        <PageHeader title="Add Expense" />

        {/* Message Alert */}
        {message && messageType && (
          <div className="mx-6 mt-4">
            <MessageAlert 
              type={messageType} 
              text={message} 
            />
          </div>
        )}

        <ExpenseForm
          categories={categories}
          formData={formData}
          showOtherCategoryInput={showOtherCategoryInput}
          isSubmitting={isSubmitting}
          onUpdateFormData={updateFormData}
          onShowOtherInputChange={setShowOtherCategoryInput} // Fixed prop name
          onCategorySelect={handleCategorySelect}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}