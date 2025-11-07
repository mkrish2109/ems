import Image from "next/image";
import { UserProfile } from '@/types/profile';
import gallery from "../../../../public/assets/Icon/gallery.svg";

interface ProfileHeaderProps {
  profile: UserProfile | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  return (
    <div className="flex flex-col items-center mt-4">
      <div className="w-[88px] h-[88px] bg-white rounded-full flex items-center justify-center mb-2">
        <Image src={gallery} alt="gallery" />
      </div>
      <h2 className="text-[20px] font-bold text-[#008DD2]">
        {profile?.user_name || 'Dss Family'}
      </h2>
      <p className="text-[14px] text-[#052C4D] mt-1">
        {profile?.role?.role_name || 'User'}
      </p>
      <p className="text-[12px] text-gray-600 mt-1">
        {profile?.email}
      </p>
    </div>
  );
};

export default ProfileHeader;