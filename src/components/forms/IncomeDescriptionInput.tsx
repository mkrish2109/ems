interface IncomeDescriptionInputProps {
  description: string;
  error: string;
  onChange: (description: string) => void;
  onValidate: (description: string) => void;
}

export default function IncomeDescriptionInput({
  description,
  error,
  onChange,
  onValidate,
}: IncomeDescriptionInputProps) {
  return (
    <div>
      <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
        Notes / Description *
      </label>
      <input
        placeholder="August Salary"
        className={`w-full h-[56px] bg-white rounded-2xl px-4 focus:outline-none focus:ring-2 ${
          error ? "focus:ring-red-500 border border-red-400" : "focus:ring-[#008DD2]"
        } placeholder:text-[#C8C8C8] text-[18px] text-gray-800`}
        value={description}
        onChange={(e) => {
          onChange(e.target.value);
          onValidate(e.target.value);
        }}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1 ml-2">{error}</p>
      )}
    </div>
  );
}