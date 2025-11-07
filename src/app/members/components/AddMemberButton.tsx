import Link from "next/link";

interface AddMemberButtonProps {
  isFamilyMember: boolean;
}

const AddMemberButton: React.FC<AddMemberButtonProps> = ({ isFamilyMember }) => {
  if (isFamilyMember) return null;

  return (
    <div className="mt-auto sticky bottom-0 px-6">
      <div className="my-6">
        <Link href="/addMember">
          <button className="w-full h-[56px] bg-[#008DD2] rounded-2xl flex items-center justify-center cursor-pointer">
            <span className="text-[18px] font-bold text-white">Add Member</span>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default AddMemberButton;