interface IncomeFileUploadProps {
  fileName: string;
  error: string;
  onFileChange: (file: File | null, fileName: string) => void;
}

export default function IncomeFileUpload({ fileName, error, onFileChange }: IncomeFileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      onFileChange(selectedFile, selectedFile.name);
    } else {
      onFileChange(null, "No file chosen");
    }
  };

  return (
    <div>
      <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
        Attachment / Proof
      </label>
      <div className={`w-full h-[56px] bg-white rounded-2xl px-4 flex items-center justify-between focus-within:ring-2 ${
        error ? "focus-within:ring-red-500 border border-red-400" : "focus-within:ring-[#008DD2]"
      }`}>
        <input
          type="file"
          id="attachment"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
        <label
          htmlFor="attachment"
          className="bg-[#E5E7EB] text-gray-700 text-[14px] flex aling-center font-medium px-4 py-1 rounded-lg cursor-pointer hover:bg-[#d1d5db] transition"
        >
          Choose file
        </label>
        <span className="text-[#C8C8C8] text-[16px] ml-3 truncate">
          {fileName}
        </span>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1 ml-2">{error}</p>
      )}
    </div>
  );
}