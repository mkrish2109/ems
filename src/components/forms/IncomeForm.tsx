"use client";

import "react-datepicker/dist/react-datepicker.css";
import { IncomeCategory } from "@/types/income";
import IncomeAmountInput from "./IncomeAmountInput";
import IncomeCategorySelect from "./IncomeCategorySelect";
import IncomeDatePicker from "./IncomeDatePicker";
import IncomePaymentSelect from "./IncomePaymentSelect";
import IncomeDescriptionInput from "./IncomeDescriptionInput";
import IncomeFileUpload from "./IncomeFileUpload";
import IncomeActionButtons from "./IncomeActionButtons";

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

interface IncomeFormProps {
  categories: IncomeCategory[];
  formData: IncomeFormData;
  loading: boolean;
  submitting: boolean;
  errors: FormErrors;
  onUpdateFormData: (updates: Partial<IncomeFormData>) => void;
  onUpdateErrors: (updates: Partial<FormErrors>) => void;
  onFileChange: (file: File | null, fileName: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  onValidateAmount: (amount: string) => void;
  onValidateDescription: (description: string) => void;
}

export default function IncomeForm({
  categories,
  formData,
  loading,
  submitting,
  errors,
  onUpdateFormData,
  onUpdateErrors,
  onFileChange,
  onSubmit,
  onCancel,
  onValidateAmount,
  onValidateDescription,
}: IncomeFormProps) {
  return (
    <form className="px-6 mt-[11px] space-y-5.5" onSubmit={onSubmit}>
      <IncomeAmountInput
        amount={formData.amount}
        error={errors.amount}
        onChange={(amount) => onUpdateFormData({ amount })}
        onValidate={onValidateAmount}
      />

      <IncomeCategorySelect
        categories={categories}
        selectedCategory={formData.selectedCategory}
        loading={loading}
        error={errors.category}
        onCategorySelect={(categoryName, categoryId) => 
          onUpdateFormData({ selectedCategory: categoryName, selectedCategoryId: categoryId })
        }
        onErrorClear={() => onUpdateErrors({ category: "" })}
      />

      <IncomeDatePicker
        startDate={formData.startDate}
        error={errors.date}
        onChange={(startDate) => onUpdateFormData({ startDate })}
      />

      <IncomePaymentSelect
        selectedPayment={formData.selectedPayment}
        error={errors.paymentMethod}
        onPaymentChange={(selectedPayment) => onUpdateFormData({ selectedPayment })}
        onErrorClear={() => onUpdateErrors({ paymentMethod: "" })}
      />

      <IncomeDescriptionInput
        description={formData.description}
        error={errors.description}
        onChange={(description) => onUpdateFormData({ description })}
        onValidate={onValidateDescription}
      />

      <IncomeFileUpload
        fileName={formData.fileName}
        error={errors.file}
        onFileChange={onFileChange}
      />

      <IncomeActionButtons
        submitting={submitting}
        onCancel={onCancel}
      />
    </form>
  );
}