import { useState } from "react";
import { format } from "date-fns";
import { IncomeCategory } from "@/types/income";
import AmountInput from "@/components/ui/AmountInput";
import CustomSelect from "@/components/ui/CustomSelect";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import FileUpload from "@/components/ui/FileUpload";

interface MemberIncomeFormProps {
  categories: IncomeCategory[];
  selectedMember: string;
  memberId: string;
  onSave: (data: {
    amount: string;
    income_category_id: number;
    income_date: string;
    payment_method: string;
    member_user_id: string;
    description: string;
    attachment?: File | null;
  }) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  errors: { [key: string]: string };
  setErrors: (errors: { [key: string]: string }) => void;
}

export default function MemberIncomeForm({
  categories,
  selectedMember,
  memberId,
  onSave,
  onCancel,
  loading,
  errors,
  setErrors
}: MemberIncomeFormProps) {
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openCategory, setOpenCategory] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [openPayment, setOpenPayment] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const paymentMethods = [
    { value: "UPI Pay", label: "UPI Pay" },
    { value: "Cash", label: "Cash" },
    { value: "Card", label: "Card" }
  ];

  const categoryOptions = categories.map(cat => ({
    value: cat.income_category_name,
    label: cat.income_category_name
  }));

  const handleSave = async () => {
    const selectedCategoryObj = categories.find(cat => cat.income_category_name === selectedCategory);
    
    if (!selectedCategoryObj) {
      setErrors({ ...errors, category: "Please select a valid category" });
      return;
    }
    
    try {
      await onSave({
        amount,
        income_category_id: selectedCategoryObj.income_category_id,
        income_date: format(startDate, "yyyy-MM-dd"),
        payment_method: selectedPayment,
        member_user_id: memberId,
        description: "Income entry",
        attachment: file
      });

      // Clear form fields after successful submission
      setAmount("");
      setSelectedCategory("");
      setStartDate(new Date());
      setSelectedPayment("Cash");
      setFile(null);
      setErrors({});
      
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error in form submission:', error);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (errors.amount) {
      setErrors({ ...errors, amount: "" });
    }
  };

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
    if (errors.category) {
      setErrors({ ...errors, category: "" });
    }
  };

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (errors.file) {
      setErrors({ ...errors, file: "" });
    }
  };

  return (
    <form className="px-6 mt-[11px] space-y-5.5" onSubmit={(e) => e.preventDefault()}>
      <AmountInput
        value={amount}
        onChange={handleAmountChange}
        error={errors.amount}
      />

      <div>
        <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
          Categories *
        </label>
        <CustomSelect
          options={categoryOptions}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
          open={openCategory}
          onToggle={setOpenCategory}
          placeholder="Select category"
          error={errors.category}
        />
      </div>

      <div>
        <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
          Date & Time *
        </label>
        <CustomDatePicker
          selected={startDate}
          onChange={setStartDate}
          error={errors.date}
        />
      </div>

      <div>
        <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
          Member *
        </label>
        <CustomSelect
          options={[{ value: selectedMember, label: selectedMember || "Loading..." }]}
          selected={selectedMember}
          onSelect={() => {}}
          open={false}
          onToggle={() => {}}
          disabled={true}
        />
      </div>

      <div>
        <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
          Payment Method *
        </label>
        <CustomSelect
          options={paymentMethods}
          selected={selectedPayment}
          onSelect={setSelectedPayment}
          open={openPayment}
          onToggle={setOpenPayment}
        />
      </div>

      <FileUpload
        onFileChange={handleFileChange}
        error={errors.file}
      />

      <div className="flex justify-between space-x-4 mb-[19px]">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="w-[143px] h-[45px] bg-[#008DD2] rounded-[10px] flex items-center justify-center disabled:opacity-50"
        >
          <span className="text-[16px] font-bold text-white">Cancel</span>
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="w-[143px] h-[45px] bg-[#26BB84] rounded-[10px] flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-[16px] font-bold text-white">
            {loading ? "Saving..." : "Save Income"}
          </span>
        </button>
      </div>
    </form>
  );
}