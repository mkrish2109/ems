import { useState } from "react";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  error?: string;
  acceptedTypes?: string;
}

export default function FileUpload({ 
  onFileChange, 
  error, 
  acceptedTypes = ".jpg,.jpeg,.png,.pdf"
}: FileUploadProps) {
  const [fileName, setFileName] = useState("No file chosen");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileChange(selectedFile);
    setFileName(selectedFile?.name || "No file chosen");
  };

  return (
    <div>
      <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
        Attachment / Proof
      </label>
      <div className={`w-full h-[56px] bg-white rounded-2xl px-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-[#008DD2] ${
        error ? 'border-2 border-red-500' : ''
      }`}>
        <input
          type="file"
          id="attachment"
          onChange={handleFileChange}
          className="hidden"
          accept={acceptedTypes}
        />
        <label
          htmlFor="attachment"
          className="bg-[#E5E7EB] text-gray-700 text-[14px] flex items-center font-medium px-4 py-1 rounded-lg cursor-pointer hover:bg-[#d1d5db] transition"
        >
          Choose file
        </label>
        <span className="text-[#052C4D] text-[14px] ml-3 truncate flex-1">
          {fileName}
        </span>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      <p className="text-[12px] text-gray-500 mt-1">
        Supported formats: JPG, PNG, PDF (Max 5MB)
      </p>
    </div>
  );
}