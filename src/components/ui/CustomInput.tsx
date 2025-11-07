// Remove the unused import
interface CustomInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
  type?: "text" | "email" | "tel";
  disabled?: boolean;
  inputMode?: "numeric" | "text" | "email";
  pattern?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  type = "text",
  disabled = false,
  inputMode,
  pattern,
}) => {
  return (
    <div className="mb-[19px]">
      {label && (
        <label className="block text-[16px] font-medium text-[#052C4D] mb-[6px]">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="w-full h-[56px] bg-white rounded-2xl px-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-[18px] text-gray-800"
        disabled={disabled}
        inputMode={inputMode}
        pattern={pattern}
      />
      {error && touched && (
        <p className="text-red-500 text-[12px] mt-1 ml-2">{error}</p>
      )}
    </div>
  );
};