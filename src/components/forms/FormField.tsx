import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  icon: ReactNode;
  inputMode?: "numeric" | "text" | "email" | "tel";
  pattern?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  icon,
  inputMode,
  pattern,
}) => {
  return (
    <div className="mb-[8px]">
      <label className="block text-[16px] text-black mb-[6px]">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          inputMode={inputMode}
          pattern={pattern}
          className="w-full h-14 border border-[#C8C8C8] rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-gray-800 disabled:opacity-60 disabled:bg-gray-100"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8C8C8]">
          {icon}
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

export default FormField;