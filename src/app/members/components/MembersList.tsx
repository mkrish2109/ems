import { FamilyUser } from '@/types/member'; // Change from members to member
import MemberCard from './MemberCard';

interface MembersListProps {
  familyHead: FamilyUser | null;
  members: FamilyUser[];
  isLoading: boolean;
  isFamilyMember: boolean;
  onEditClick: (userId: number) => void;
  onDeleteClick: (userId: number, userName: string) => void;
}

const MembersList: React.FC<MembersListProps> = ({
  familyHead,
  members,
  isLoading,
  isFamilyMember,
  onEditClick,
  onDeleteClick,
}) => {
  if (isLoading) {
    return (
      <div className="flex-1 mt-[18px] space-y-4">
        <p className="text-center text-[#052C4D] text-[16px] font-medium">
          Loading members...
        </p>
      </div>
    );
  }

  const hasMembers = familyHead || members.filter(Boolean).length > 0;

  if (!hasMembers) {
    return (
      <div className="flex-1 mt-[18px] space-y-4">
        <p className="text-center text-[#052C4D] text-[16px] font-medium">
          No members found
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 mt-[18px] space-y-4">
      {familyHead && (
        <MemberCard
          member={familyHead}
          isFamilyMember={isFamilyMember}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          isFamilyHead={true}
        />
      )}
      
      {members.filter(Boolean).map((member) => (
        <MemberCard
          key={member.user_id}
          member={member}
          isFamilyMember={isFamilyMember}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </div>
  );
};

export default MembersList;