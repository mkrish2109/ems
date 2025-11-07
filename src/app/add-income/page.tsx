"use client";

import PageHeader from "@/components/ui/PageHeader";
import IncomeForm from "@/components/forms/IncomeForm";
import MessageAlert from "@/components/ui/MessageAlert";
import { useIncomeForm } from "@/hooks/useIncomeForm";

export default function AddIncome() {
  const {
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
  } = useIncomeForm();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg">
        <PageHeader title="Add Self Income" />

        {/* Message Alert */}
        {message && messageType && (
          <div className="mx-6 mt-4">
            <MessageAlert 
              type={messageType} 
              text={message} 
            />
          </div>
        )}

        <IncomeForm
          categories={categories}
          formData={formData}
          loading={loading}
          submitting={submitting}
          errors={errors}
          onUpdateFormData={updateFormData}
          onUpdateErrors={updateErrors}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onValidateAmount={validateAmount}
          onValidateDescription={validateDescription}
        />
      </div>
    </div>
  );
}