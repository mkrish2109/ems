interface SubmitButtonProps {
  loading: boolean;
  text: string;
  loadingText?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading,
  text,
  loadingText = "Processing..."
}) => {
  return (
    <div className="mb-[10px]">
      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 bg-[#008DD2] rounded-2xl text-white font-bold text-[16px] disabled:opacity-60 cursor-pointer"
      >
        {loading ? loadingText : text}
      </button>
    </div>
  );
};

export default SubmitButton;