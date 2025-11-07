import { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  error?: string;
}

export default function FormInput({ label, icon, error, ...props }: FormInputProps) {
  return (
    <div className="mb-[28px]">
      <label className="block text-[16px] text-black mb-[6px]">{label}</label>
      <div className="relative">
        <input
          {...props}
          className={`w-full h-14 border ${
            error ? "border-red-500" : "border-[#C8C8C8]"
          } rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 ${
            error ? "focus:ring-red-500" : "focus:ring-[#008DD2]"
          } placeholder:text-[#C8C8C8] text-gray-800`}
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          {icon}
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}