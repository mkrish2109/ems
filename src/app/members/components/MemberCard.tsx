import Image from "next/image";
import Link from "next/link";
import { TbUserDollar } from "react-icons/tb";
import { FamilyUser } from '@/types/member'; // Change from members to member
import user from "../../../../public/assets/Icon/user.png";
import edit from "../../../../public/assets/Icon/edit.svg";
import deleteIcon from "../../../../public/assets/Icon/delete.svg";

interface MemberCardProps {
  member: FamilyUser;
  isFamilyMember: boolean;
  onEditClick: (userId: number) => void;
  onDeleteClick: (userId: number, userName: string) => void;
  isFamilyHead?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isFamilyMember,
  onEditClick,
  onDeleteClick,
  isFamilyHead = false,
}) => {
  return (
    <div className="w-full h-[100px] bg-white flex rounded-[10px] py-[20px] px-4 relative">
      <div className="w-[60px] h-[60px] bg-[#008DD2] rounded-full flex mr-4">
        <span className="text-white text-lg font-semibold">
          <Image src={user} alt="user" />
        </span>
      </div>
      <div className="flex-1">
        <h4 className="text-[18px] font-semibold text-[#052C4D] mb-[12px]">
          {isFamilyHead ? `${member.user_name} - ${member.role?.role_name || "Family Head"}` : member.user_name}
        </h4>
        <p className="text-[16px] text-[#052C4D]">
          {member.role?.role_name}
        </p>
      </div>
      {!isFamilyMember && (
        <div className="grid grid-cols-2 space-x-3">
          {member.role?.role_name === "Family Member" ? (
            <button 
              onClick={() => onEditClick(member.user_id)}
              className="relative group cursor-pointer"
            >
              <TbUserDollar className="text-[#008DD2]" size={21} />
              <span className="absolute top-full right-0 whitespace-nowrap px-2 py-1 text-[12px] text-white bg-black rounded-md opacity-0 group-hover:opacity-100 transition duration-200 z-2"
              onClick={(e) => e.stopPropagation()}>
                Add Member Income
              </span>
            </button>
          ) : (
            <button className="cursor-pointer">
              <Link href="/edit-profile">
                <Image src={edit} alt="edit" />
              </Link>
            </button>
          )}
          {member.role?.role_name !== "Family Head" && (
            <button 
              onClick={() => onDeleteClick(member.user_id, member.user_name)}
              className="cursor-pointer"
            >
              <Image src={deleteIcon} alt="delete" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberCard;