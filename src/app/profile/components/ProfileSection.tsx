import { ProfileMenuItemType } from '@/types/profile';
import ProfileMenuItem from './ProfileMenuItem';

interface ProfileSectionProps {
  title: string;
  items: ProfileMenuItemType[];
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, items }) => {
  return (
    <div className="mt-8 px-6">
      <h3 className="text-[16px] font-semibold text-[#052C4D] mb-1">
        {title}
      </h3>
      {items.map((item, index) => (
        <ProfileMenuItem
          key={index}
          icon={item.icon}
          alt={item.alt}
          label={item.label}
          path={item.path}
        />
      ))}
    </div>
  );
};

export default ProfileSection;