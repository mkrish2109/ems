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