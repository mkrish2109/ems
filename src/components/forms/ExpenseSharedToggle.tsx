interface ExpenseSharedToggleProps {
  shared: boolean;
  onChange: (shared: boolean) => void;
  disabled?: boolean;
}

export default function ExpenseSharedToggle({ shared, onChange, disabled = false }: ExpenseSharedToggleProps) {
  return (
    <div className="flex items-center justify-between mb-[14px] p-4 bg-white rounded-2xl border border-gray-200">
      <span className="text-[16px] font-medium text-[#052C4D]">
        Shared with Family
      </span>
      <button
        type="button"
        onClick={() => onChange(!shared)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
          shared ? "bg-[#008DD2]" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            shared ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}