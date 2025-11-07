import React from 'react';

interface PasswordInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  showTips?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = true,
  showTips = false
}) => {
  return (
    <div>
      <label className="block text-[16px] font-medium text-[#052C4D] mb-1">
        {label}
      </label>
      <input
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full h-[56px] px-4 bg-white rounded-[16px] border border-gray-300 placeholder:text-[#C8C8C8] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#008DD2] focus:border-transparent"
        required={required}
        placeholder={placeholder}
        minLength={6}
      />
      {showTips && (
        <p className="text-[12px] text-gray-500 mt-1">
          Must be at least 6 characters long and contain uppercase, lowercase, number, and special character
        </p>
      )}
    </div>
  );
};

export default PasswordInput;