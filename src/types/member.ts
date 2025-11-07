export type Role = {
  role_id: number;
  role_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type InvitePayload = {
  user_name: string;
  relation: string;
  email: string;
  role: string;
  mobile: string;
  monthly_budget_limit?: number;
  profile_picture: string;
};

export type ValidationErrors = {
  user_name?: string;
  relation?: string;
  email?: string;
  mobile?: string;
  role?: string;
};

export type AddMemberFormData = {
  userName: string;
  relation: string;
  email: string;
  mobile: string;
  budget: string;
  image: string | null;
  selectedRole: string;
};

export type DeleteConfirmState = {
  show: boolean;
  userId: number | null; // Add this
  userName: string;
  inputText: string;
};

export type FamilyUser = {
  user_id: number;
  user_name: string;
  email: string;
  mobile: string;
  relation: string;
  monthly_budget_limit?: number;
  profile_picture?: string;
  role?: {
    role_id: number;
    role_name: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type FamilyMembersResponse = {
  family_head?: FamilyUser | null;
  family_members?: FamilyUser[];
  data?: FamilyUser[]; // For alternative response format
};