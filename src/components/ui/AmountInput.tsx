interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export default function AmountInput({ value, onChange, error, placeholder = "Enter amount" }: AmountInputProps) {
  const handleAmountChange = (value: string) => {
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value) || value === "") {
      onChange(value);
    }
  };

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
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleAmountChange(e.target.value)}
          className={`w-full h-[56px] bg-white rounded-2xl pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-[18px] text-gray-800 ${
            error ? 'border-2 border-red-500' : ''
          }`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}