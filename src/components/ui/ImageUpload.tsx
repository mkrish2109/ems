import Image from "next/image";
// Remove the unused useState import

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
  currentImage: string | null;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImage,
  disabled = false,
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="ml-[38px] mb-[19px]">
      <label className="cursor-pointer">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          disabled={disabled}
        />
        <div className="w-[88px] h-[88px] bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
          {currentImage ? (
            <Image
              src={currentImage}
              alt="Uploaded"
              width={88}
              height={88}
              className="object-cover rounded-full"
            />
          ) : (
            <span className="text-[#008DD2] text-2xl font-bold">+</span>
          )}
        </div>
      </label>
      <h2 className="mt-1 text-[22px] font-bold text-[#008DD2]">Upload</h2>
    </div>
  );
};