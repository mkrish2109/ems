import { HiChevronDown } from "react-icons/hi";

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  selected: string;
  onSelect: (value: string) => void;
  open: boolean;
  onToggle: (open: boolean) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function CustomSelect({
  options,
  selected,
  onSelect,
  open,
  onToggle,
  placeholder = "Select option",
  error,
  disabled = false,
  className = ""
}: CustomSelectProps) {
  const selectedLabel = options.find(opt => opt.value === selected)?.label || selected || placeholder;

  return (
    <div className="w-full">
      <div className="relative">
        <button
          type="button"
          className={`w-full h-14 bg-white rounded-2xl px-4 flex items-center justify-between focus:outline-none cursor-pointer ${
            error ? 'border-2 border-red-500' : ''
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
          onClick={() => !disabled && onToggle(!open)}
          disabled={disabled}
        >
          <span className="text-[16px] text-[#052C4D]">
            {selectedLabel}
          </span>
          <HiChevronDown
            className={`transition-transform ${disabled ? 'text-[#C8C8C8]' : 'text-[#008DD2]'}`}
            size={20}
          />
        </button>

        {open && !disabled && (
          <div className="absolute right-[15px] w-[160px] -mt-[18px] bg-white rounded-2xl shadow-md z-10 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className="w-full flex items-center justify-between px-4 py-[4px] text-left text-[14px] text-[#052C4D] cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  onSelect(option.value);
                  onToggle(false);
                }}
              >
                <span>{option.label}</span>
                <span
                  className={`h-[11px] w-[11px] rounded-full border-2 flex items-center justify-center ${
                    selected === option.value
                      ? "border-[#008DD2]"
                      : "border-[#C8C8C8]"
                  }`}
                >
                  {selected === option.value && (
                    <span className="w-full h-full bg-[#008DD2] rounded-full"></span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}