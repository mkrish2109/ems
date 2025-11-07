interface ExpenseDescriptionInputProps {
  description: string;
  onChange: (description: string) => void;
}

export default function ExpenseDescriptionInput({ description, onChange }: ExpenseDescriptionInputProps) {
  return (
    <div className="mb-[19px]">
      <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
        Description
      </label>
      <input
        value={description}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter expense description"
        className="w-full bg-white rounded-2xl p-4 focus:outline-none focus:ring-[#008DD2] resize-none placeholder:text-[#C8C8C8] text-[18px] text-gray-800"
      />
    </div>
  );
}