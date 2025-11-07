import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { FamilyUser, FamilyMembersResponse } from '@/types/member'; // Change from members to member

export const useMembers = () => {
  const [familyHead, setFamilyHead] = useState<FamilyUser | null>(null);
  const [members, setMembers] = useState<FamilyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFamilyMember, setIsFamilyMember] = useState(false);

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

  const deleteMember = async (userId: number) => {
    try {
      const accessToken = Cookies.get("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
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

      return true;
    } catch (error) {
      console.error("Failed to delete member:", error);
      throw error;
    }
  };

  const updateMembersAfterDelete = (userId: number) => {
    if (familyHead?.user_id === userId) {
      setFamilyHead(null);
    } else {
      setMembers(prev => prev.filter(member => member.user_id !== userId));
    }
  };

  return {
    familyHead,
    members,
    isLoading,
    isFamilyMember,
    deleteMember,
    updateMembersAfterDelete,
  };
};