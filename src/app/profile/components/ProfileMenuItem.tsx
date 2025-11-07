import Image from "next/image";
import { useRouter } from 'next/navigation';

interface ProfileMenuItemProps {
  icon: string;
  alt: string;
  label: string;
  path: string;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ 
  icon, 
  alt, 
  label, 
  path 
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(path);
  };

  return (
    <div 
      onClick={handleClick}
      className="w-full h-[56px] bg-white rounded-[16px] flex items-center px-4 mb-[15px] cursor-pointer hover:bg-gray-50"
    >
      <Image src={icon} alt={alt} />
      <span className="text-[16px] font-medium text-[#052C4D] ml-4">
        {label}
      </span>
    </div>
  );
};

export default ProfileMenuItem;