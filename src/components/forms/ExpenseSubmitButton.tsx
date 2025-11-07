interface ExpenseSubmitButtonProps {
  isSubmitting: boolean;
}

export default function ExpenseSubmitButton({ isSubmitting }: ExpenseSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full h-14 bg-[#008DD2] rounded-2xl flex items-center justify-center mt-[24px] mb-[29px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      <span className="text-[18px] font-bold text-white">
        {isSubmitting ? "Saving..." : "Save"}
      </span>
    </button>
  );
}