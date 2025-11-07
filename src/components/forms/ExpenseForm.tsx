"use client";

import "react-datepicker/dist/react-datepicker.css";
import ExpenseAmountInput from "./ExpenseAmountInput";
import ExpenseCategorySelect from "./ExpenseCategorySelect";
import ExpenseDescriptionInput from "./ExpenseDescriptionInput";
import ExpenseDateTimePicker from "./ExpenseDateTimePicker";
import ExpenseSharedToggle from "./ExpenseSharedToggle";
import ExpensePaymentSelect from "./ExpensePaymentSelect";
import ExpenseSubmitButton from "./ExpenseSubmitButton";
import { Category, ExpenseFormData } from "@/types/expense";

interface ExpenseFormProps {
  categories: Category[];
  formData: ExpenseFormData;
  showOtherCategoryInput: boolean;
  isSubmitting: boolean;
  onUpdateFormData: (updates: Partial<ExpenseFormData>) => void;
  onShowOtherInputChange: (show: boolean) => void;
  onCategorySelect: (categoryId: number) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function ExpenseForm({
  categories,
  formData,
  showOtherCategoryInput,
  isSubmitting,
  onUpdateFormData,
  onShowOtherInputChange,
  onCategorySelect,
  onSubmit,
}: ExpenseFormProps) {
  return (
    <form className="px-6 space-y-6" onSubmit={onSubmit}>
      <ExpenseAmountInput
        amount={formData.amount}
        onChange={(amount) => onUpdateFormData({ amount })}
      />

      <ExpenseCategorySelect
        categories={categories}
        selectedCategory={formData.selectedCategory}
        otherCategoryName={formData.otherCategoryName}
        showOtherCategoryInput={showOtherCategoryInput}
        onCategorySelect={onCategorySelect}
        onOtherCategoryChange={(otherCategoryName) => onUpdateFormData({ otherCategoryName })}
        onShowOtherInputChange={onShowOtherInputChange}
      />

      <ExpenseDescriptionInput
        description={formData.description}
        onChange={(description) => onUpdateFormData({ description })}
      />

      <ExpenseDateTimePicker
        startDate={formData.startDate}
        onChange={(startDate) => onUpdateFormData({ startDate })}
      />

      <ExpenseSharedToggle
        shared={formData.shared}
        onChange={(shared) => onUpdateFormData({ shared })}
        disabled={isSubmitting}
      />

      <ExpensePaymentSelect
        selectedPayment={formData.selectedPayment}
        onPaymentChange={(selectedPayment) => onUpdateFormData({ selectedPayment })}
      />

      <ExpenseSubmitButton isSubmitting={isSubmitting} />
    </form>
  );
}