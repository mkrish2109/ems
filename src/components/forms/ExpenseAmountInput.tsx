interface ExpenseAmountInputProps {
  amount: string;
  onChange: (amount: string) => void;
}

export default function ExpenseAmountInput({ amount, onChange }: ExpenseAmountInputProps) {
  return (
    <div className="mb-[19px]">
      <label className="block text-[16px] font-medium text-[#052C4D] mt-[12px] mb-[6px]">
        Amount
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#052C4D] text-[18px]">
          $
        </span>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-[56px] bg-white rounded-2xl pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-[18px] text-gray-800"
          min="0"
          step="0.01"
        />
      </div>
    </div>
  );
}