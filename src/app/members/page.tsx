'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { useMembers } from '@/hooks/useMembers';
import { DeleteConfirmState } from '@/types/member'; // Change from members to member
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import MembersList from './components/MembersList';
import AddMemberButton from './components/AddMemberButton';

export default function Members() {
  const router = useRouter();
  const {
    familyHead,
    members,
    isLoading,
    isFamilyMember,
    deleteMember,
    updateMembersAfterDelete,
  } = useMembers();

  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    show: false,
    userId: null,
    userName: "",
    inputText: ""
  });

  const handleEditClick = (userId: number) => {
    router.push(`/member-income?member_id=${userId}`);
  };

  const handleDeleteClick = (userId: number, userName: string) => {
    setDeleteConfirm({
      show: true,
      userId,
      userName,
      inputText: ""
    });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({
      show: false,
      userId: null,
      userName: "",
      inputText: ""
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.inputText !== "DELETE" || !deleteConfirm.userId) {
      return;
    }

    try {
      await deleteMember(deleteConfirm.userId);
      updateMembersAfterDelete(deleteConfirm.userId);
      handleDeleteCancel();
    } catch (error) {
      console.error("Failed to delete member:", error);
      alert("Failed to delete member. Please try again.");
    }
  };

  const handleInputChange = (value: string) => {
    setDeleteConfirm((prev: DeleteConfirmState) => ({ ...prev, inputText: value }));
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="relative w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg flex flex-col">
        <PageHeader title="Members" />

        <DeleteConfirmationModal
          deleteConfirm={deleteConfirm}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          onInputChange={handleInputChange}
        />

        <MembersList
          familyHead={familyHead}
          members={members}
          isLoading={isLoading}
          isFamilyMember={isFamilyMember}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />

        <AddMemberButton isFamilyMember={isFamilyMember} />
      </div>
    </div>
  );
}