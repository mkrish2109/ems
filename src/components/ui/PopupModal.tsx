interface PopupModalProps {
  show: boolean;
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export const PopupModal: React.FC<PopupModalProps> = ({
  show,
  message,
  type,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-[320px] bg-white rounded-2xl shadow-lg p-6 mx-4">
        <div className="text-center">
          <div
            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              type === "success" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {type === "success" ? (
              <span className="text-2xl text-green-600">✓</span>
            ) : (
              <span className="text-2xl text-red-600">!</span>
            )}
          </div>
          <p
            className={`text-[16px] font-medium mb-6 ${
              type === "success" ? "text-[#052C4D]" : "text-red-600"
            }`}
          >
            {message}
          </p>
          <button
            type="button"
            className="w-full h-[45px] bg-[#008DD2] rounded-[10px] flex items-center justify-center cursor-pointer hover:bg-[#007abc] transition-colors"
            onClick={onClose}
          >
            <span className="text-[16px] font-bold text-white">
              {type === "success" ? "OK" : "Try Again"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};