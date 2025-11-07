interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={onRetry}
            className="bg-[#008DD2] text-white px-6 py-2 rounded-[16px] hover:bg-[#007cba] transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;