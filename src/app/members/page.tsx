'use client';

import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import user from "../../../public/assets/Icon/user.png";
import edit from "../../../public/assets/Icon/edit.svg";
import deleteIcon from "../../../public/assets/Icon/delete.svg";
import PageHeader from "@/components/ui/PageHeader";
import { useRouter } from "next/navigation";
import { TbUserDollar } from "react-icons/tb";

type Role = { role_id: number; role_name: string };
type FamilyUser = { user_id: number; user_name: string; role: Role; email?: string };
type FamilyMembersResponseHead = { data: FamilyUser[] };
type FamilyMembersResponseMember = { family_head: FamilyUser; family_members: FamilyUser[] };
type FamilyMembersResponse = FamilyMembersResponseHead | FamilyMembersResponseMember;

export default function Members() {
  const router = useRouter();
  const [familyHead, setFamilyHead] = useState<FamilyUser | null>(null);
  const [members, setMembers] = useState<FamilyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFamilyMember, setIsFamilyMember] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; userId: number | null; userName: string; inputText: string }>({
    show: false,
    userId: null,
    userName: "",
    inputText: ""
  });

  useEffect(() => {
    const role = Cookies.get("userRole");
    if (role && decodeURIComponent(role) === "Family Member") {
      setIsFamilyMember(true);
    }

    let isMounted = true;

    const loadMembers = async () => {
      try {
        const accessToken = Cookies.get("access_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family/members`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const msg = typeof errData?.message === "string" ? errData.message.toLowerCase() : "";
          if (msg.includes("not part of any family")) {
            if (!isMounted) return;
            setFamilyHead(null);
            setMembers([]);
            return;
          }
          throw new Error(errData.message || "Failed to fetch family members");
        }

        const data: FamilyMembersResponse = await res.json();
        if (!isMounted) return;

        if ("data" in data) {
          setFamilyHead(null);
          setMembers(data.data || []);
        } else {
          setFamilyHead(data.family_head || null);
          setMembers(data.family_members || []);
        }
      } catch (e) {
        console.error("Failed to load family members:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMembers();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleEditClick = (userId: number) => {
    // Navigate to member income page with member_id parameter
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
      const accessToken = Cookies.get("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${deleteConfirm.userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to delete member");
      }

      // Remove the deleted member from state
      if (familyHead?.user_id === deleteConfirm.userId) {
        setFamilyHead(null);
      } else {
        setMembers(prev => prev.filter(member => member.user_id !== deleteConfirm.userId));
      }

      // Close confirmation dialog
      handleDeleteCancel();
      
    } catch (error) {
      console.error("Failed to delete member:", error);
      alert("Failed to delete member. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="relative w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg flex flex-col">
        <PageHeader title="Members" />

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
            <div className=" w-full max-w-[390px] min-h-[844px] bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-[10px] p-6 w-[320px] mx-4">
                <h3 className="text-[18px] font-semibold text-[#052C4D] mb-4">
                  Delete Member
                </h3>
                <p className="text-[16px] text-[#052C4D] mb-4">
                  Are you sure you want to delete <strong>{deleteConfirm.userName}</strong>? 
                  Type <strong>DELETE</strong> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteConfirm.inputText}
                  onChange={(e) => setDeleteConfirm(prev => ({ ...prev, inputText: e.target.value }))}
                  placeholder="Type DELETE here"
                  className="w-full h-[44px] border border-[#ccc] rounded-[8px] px-3 mb-4 text-[16px] focus:outline-none focus:border-[#008DD2]"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteCancel}
                    className="flex-1 h-[44px] bg-gray-300 text-[#052C4D] rounded-[8px] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleteConfirm.inputText !== "DELETE"}
                    className={`flex-1 h-[44px] rounded-[8px] font-medium ${
                      deleteConfirm.inputText === "DELETE" 
                        ? "bg-[red]/70 text-white" 
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 mt-[18px] space-y-4">
          {/* Render family head if present in response */}
          {familyHead && (
            <div className="w-full h-[100px] bg-white flex rounded-[10px] py-[20px] px-4 relative">
              <div className="w-[60px] h-[60px] bg-[#008DD2] rounded-full flex mr-4">
                <span className="text-white text-lg font-semibold">
                  <Image src={user} alt="user" />
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-[18px] font-semibold text-[#052C4D] mb-[12px]">
                  {familyHead?.user_name} - {familyHead?.role?.role_name || "Family Head"}
                </h4>
                <p className="text-[16px] text-[#052C4D]">
                  {familyHead?.role?.role_name || "Family Head"}
                </p>
              </div>
              {!isFamilyMember && (
                <div className="grid  space-x-3">
                  <button 
                    onClick={() => handleEditClick(familyHead.user_id)}
                    className="cursor-pointer"
                  >
                    <Image src={edit} alt="edit" />
                  </button>
                  {/* <button 
                    onClick={() => handleDeleteClick(familyHead.user_id, familyHead.user_name)}
                    className="cursor-pointer"
                  >
                    <Image src={deleteIcon} alt="delete" />
                  </button> */}
                </div>
              )}
            </div>
          )}

          {/* Render family members */}
          {!isLoading && (
            members.filter(Boolean).length > 0 ? (
              members.filter(Boolean).map((member) => (
                <div
                  key={member?.user_id}
                  className="w-full h-[100px] bg-white flex rounded-[10px] py-[20px] px-4 relative"
                >
                  <div className="w-[60px] h-[60px] bg-[#008DD2] rounded-full flex mr-4">
                    <span className="text-white text-lg font-semibold">
                      <Image src={user} alt="user" />
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[18px] font-semibold text-[#052C4D] mb-[12px]">
                      {member?.user_name}
                    </h4>
                    <p className="text-[16px] text-[#052C4D]">{member?.role?.role_name}</p>
                  </div>
                  {!isFamilyMember && (
                    <div className="grid grid-cols-2 space-x-3">
                      {/* Show TbUserDollar icon for family members, edit icon for others */}
                      {member?.role?.role_name === "Family Member" ? (
                      <button 
                        onClick={() => handleEditClick(member.user_id)}
                        className="relative group cursor-pointer"
                      >
                        <TbUserDollar className="text-[#008DD2]" size={21} />
                        <span className="absolute top-full right-0 whitespace-nowrap px-2 py-1 text-[12px] text-white bg-black rounded-md opacity-0 group-hover:opacity-100 transition duration-200 z-50">
                            Add Member Income
                        </span>
                      </button>
                      ) : (
                        <button
                          className="cursor-pointer"
                        >
                          <Link href="/edit-profile">
                            <Image src={edit} alt="edit" />
                          </Link>
                        </button>
                      )}
                      {member?.role?.role_name !== "Family Head" && (
                        <button 
                          onClick={() => handleDeleteClick(member.user_id, member.user_name)}
                          className="cursor-pointer"
                        >
                          <Image src={deleteIcon} alt="delete" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-[#052C4D] text-[16px] font-medium">
                No members found
              </p>
            )
          )}
        </div>

        {/* Add Member button (hidden for Family Member) */}
        {!isFamilyMember && (
          <div className="mt-auto sticky bottom-0 px-6">
            <div className="my-6">
              <Link href="/addMember">
                <button className="w-full h-[56px] bg-[#008DD2] rounded-2xl flex items-center justify-center cursor-pointer">
                  <span className="text-[18px] font-bold text-white">Add Member</span>
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}