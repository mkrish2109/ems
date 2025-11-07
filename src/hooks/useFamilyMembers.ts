import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { FamilyMember } from '@/types/reports';

export const useFamilyMembers = (memberId?: string | null) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasFamily, setHasFamily] = useState(false);

  useEffect(() => {
    const loadFamilyMembers = async () => {
      try {
        setIsLoading(true);
        const token = Cookies.get('access_token');
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

        if (!token) {
          console.error('No access token found');
          setFamilyMembers([]);
          setHasFamily(false);
          return;
        }

        const response = await fetch(`${BASE_URL}/family/members`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          let members: FamilyMember[] = [];
          let hasFamilyData = false;

          if (Array.isArray(data)) {
            members = data;
            hasFamilyData = data.length > 0;
          } else if (data.data && Array.isArray(data.data)) {
            members = data.data;
            hasFamilyData = data.data.length > 0;
          } else if (data.family_head || data.family_members) {
            members = [
              ...(data.family_head ? [data.family_head] : []),
              ...(data.family_members || []),
            ];
            hasFamilyData = true;
          } else if (data.members && Array.isArray(data.members)) {
            members = data.members;
            hasFamilyData = data.members.length > 0;
          }

          setHasFamily(hasFamilyData);
          const filteredMembers = members.filter(
            (member) => member?.role && member.role.role_name !== 'Family Head'
          );
          setFamilyMembers(filteredMembers);
          
          // Set selected member if memberId is provided
          if (memberId && filteredMembers.length > 0) {
            const member = filteredMembers.find((m: FamilyMember) => m.user_id.toString() === memberId);
            if (member) {
              setSelectedMember(member.user_name);
            }
          }
        } else {
          setFamilyMembers([]);
          setHasFamily(false);
        }
      } catch (error) {
        console.error('Error loading family members:', error);
        setFamilyMembers([]);
        setHasFamily(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadFamilyMembers();
  }, [memberId]);

  return { 
    familyMembers, 
    selectedMember,
    isLoading, 
    hasFamily 
  };
};