interface IncomeAmountInputProps {
  amount: string;
  error: string;
  onChange: (amount: string) => void;
  onValidate: (amount: string) => void;
}

export default function IncomeAmountInput({ 
  amount, 
  error, 
  onChange, 
  onValidate 
}: IncomeAmountInputProps) {
  return (
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
            error ? "focus:ring-red-500 border border-red-400" : "focus:ring-[#008DD2]"
          } placeholder:text-[#C8C8C8] text-[18px] text-gray-800`}
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => {
            onChange(e.target.value);
            onValidate(e.target.value);
          }}
          required
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1 ml-2">{error}</p>
      )}
    </div>
  );
}