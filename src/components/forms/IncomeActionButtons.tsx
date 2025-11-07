interface IncomeActionButtonsProps {
  submitting: boolean;
  onCancel: () => void;
}

export default function IncomeActionButtons({
  submitting,
  onCancel,
}: IncomeActionButtonsProps) {
  return (
    <div className="flex justify-between space-x-4 mb-[19px]">
      <button
        type="button"
        onClick={onCancel}
        className="w-[143px] h-[45px] bg-[#008DD2] rounded-[10px] flex items-center justify-center cursor-pointer"
        disabled={submitting}
      >
        <span className="text-[16px] font-bold text-white">Cancel</span>
      </button>
      <button
        type="submit"
        className="w-[143px] h-[45px] bg-[#26BB84] rounded-[10px] flex items-center justify-center disabled:opacity-50 cursor-pointer"
        disabled={submitting}
      >
        <span className="text-[16px] font-bold text-white">
          {submitting ? "Saving..." : "Save Income"}
        </span>
      </button>
    </div>
  );
}