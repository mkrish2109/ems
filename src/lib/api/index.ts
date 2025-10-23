import Cookies from "js-cookie";

const accessToken = Cookies.get('access_token'); 

// ----------------- Income Types -----------------
export type IncomeCategory = {
  income_category_id: number;
  income_category_name: string;
  type: string;
  is_active: number;
  created_at: string;
  updated_at: string;
};

export type IncomePayload = {
  amount: string | number;
  description: string;
  income_date: string; // format: YYYY-MM-DD
  payment_method: string;
  income_category_id: number;
  attachment?: File;
};

export type IncomeResponse = {
  income_id: number;
  head_user_id: number;
  member_user_id: string;
  income_category_id: string;
  income_category_name: string;
  amount: string;
  description: string;
  income_date: string;
  payment_method: string;
  attachment: string;
  member_user: {
    user_id: number;
    user_name: string;
    email: string;
    mobile: string;
    role_id: number;
    created_at: string;
    updated_at: string;
    email_verified_at: string;
    converted_to_family_at: string | null;
    is_solo_user: boolean;
  };
  created_at: string;
  updated_at: string;
};

// ----------------- Add Income Function -----------------
export const addIncome = async (payload: IncomePayload): Promise<IncomeResponse> => {
  const accessToken = Cookies.get('access_token');
  const formData = new FormData();
  
  // Add all fields to FormData
  formData.append('amount', payload.amount.toString());
  formData.append('description', payload.description);
  formData.append('income_date', payload.income_date);
  formData.append('payment_method', payload.payment_method);
  formData.append('income_category_id', payload.income_category_id.toString());
  
  // Add file if provided
  if (payload.attachment) {
    formData.append('attachment', payload.attachment);
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income`, {
    method: "POST",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to add income");
  }

  return response.json();
};

// ----------------- Fetch Income Categories -----------------
export const fetchIncomeCategories = async (): Promise<IncomeCategory[]> => {
  const accessToken = Cookies.get('access_token'); 
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income-categories`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch income categories: ${response.statusText}`);
  }

  const data = await response.json();
  return data || [];
};

// ----------------- New types for Dashboard Data -----------------
export type RecentTransaction = {
  id: number;
  title: string;
  amount: number;
  time: string; // e.g., "10:30 AM"
  // Add other properties if your API returns them
};

export type FamilyExpense = {
  id?: number;
  name: string;
  amount: number;
  color: string;
};

export type CategoryExpense = {
  id?: number;
  category: string;
  amount: number;
  color: string;
};

// Unified type for the dashboard data
export type DashboardData = {
  totalExpenses: number;
  today: number;
  recentTransactions: RecentTransaction[];
  notifications: string[];
  familyExpenses?: FamilyExpense[]; // Optional for Family Member
  categoryExpenses?: CategoryExpense[]; // Optional for Family Head
};

// ----------------- New Dashboard Function -----------------
export const fetchDashboardData = async (role: "Family Head" | "Family Member"): Promise<DashboardData> => {
  const endpoint = role === "Family Head" ? "/dashboard/head" : "/dashboard/member";
  const token = Cookies.get("access_token");

  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch dashboard data for role: ${role}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    throw err;
  }
};

// ----------------- Unchanged functions -----------------

// Type for the successful invitation response structure
type InvitationResponse = {
  invitation: {
    id: number;
    token: string;
    user_name: string;
    email: string;
    relation: string;
    mobile: string;
    monthly_budget_limit: number;
    invited_role: { role_id: number; role_name: string };
    head_user: { user_id: number; user_name: string };
  };
  user_exists: boolean;
  requires_registration: boolean;
};

// Define Role type for API response
type Role = {
  role_id: number;
  role_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Fetch roles - FIXED: Remove any[] and use proper Role type
export const fetchRoles = async (): Promise<Role[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/roles`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch roles: ${response.statusText}`);
    }

    const data = await response.json();
    return data.roles || [];
  } catch (err) {
    console.error("Failed to load roles:", err);
    return []; // fallback empty array
  }
};

// New function to validate invitation token
export const validateInvitation = async (
  token: string
): Promise<InvitationResponse> => {
  // CORRECTED ENDPOINT based on user input
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/validate/${token}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Throw error message to be caught in the component
    throw new Error(
      errorData.message || "Invalid or expired invitation token."
    );
  }

  const data: InvitationResponse = await response.json();
  return data;
};

// Register user (no auto-login) - Payload updated to include optional token
export const registerUser = async (payload: {
  user_name: string;
  email: string;
  mobile: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  invitation_token?: string; // Optional token for invited users
}) => {
  // Register
  const registerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!registerResponse.ok) {
    const errorData = await registerResponse.json().catch(() => ({}));
    if (errorData.errors) {
      throw errorData.errors;
    }
    throw new Error(errorData.message || `Registration failed`);
  }

  const registerData = await registerResponse.json();

  // Instead of auto-login, return a message for email verification
  return {
    register: registerData,
    message:
      "Registration successful! Please verify your email before logging in.",
    user: registerData.user, // Ensure user data is returned for optional redirect
  };
};

// Fetch expense categories
export const fetchCategories = async () => {
  const accessToken = Cookies.get('access_token'); 
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expense-categories`, {
    method: "GET",
    headers: { "Content-Type": "application/json" ,"Authorization": `Bearer ${accessToken}`},
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
};

//  Logout user
export const logoutUser = async () => {
  const logoutResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!logoutResponse.ok) {
    const errorData = await logoutResponse.json().catch(() => ({}));
    throw new Error(errorData.message || "Logout failed");
  }

  const data = await logoutResponse.json();
  return data; // { message: "Logged out successfully" }
};

// Invite Member
export const inviteMember = async (payload: {
  user_name: string;
  relation: string;
  email: string;
  role: string;
  mobile: string;
  monthly_budget_limit?: number;
  profile_picture?: string | null;
}) => {
  const accessToken = Cookies.get('access_token'); 
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Invite failed");
  }

  return response.json();
};

// Fetch family members (handles both "head" and "member" response shapes)
// and gracefully returns an empty list if API says "You are not part of any family".
type FamilyRole = { role_id: number; role_name: string };
type FamilyUser = {
  user_id: number;
  user_name: string;
  email?: string;
  role: FamilyRole;
};
type FamilyMembersResponseHead = { data: FamilyUser[] };
type FamilyMembersResponseMember = {
  family_head: FamilyUser;
  family_members: FamilyUser[];
};
export type FamilyMembersResponse =
  | FamilyMembersResponseHead
  | FamilyMembersResponseMember;

export const fetchFamilyMembers = async (): Promise<FamilyMembersResponse> => {
  const token = Cookies.get("access_token");
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family/members`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg =
      typeof errorData?.message === "string"
        ? errorData.message.toLowerCase()
        : "";
    if (msg.includes("not part of any family")) {
      // Treat as empty members list (no console error, no crash)
      return { data: [] };
    }
    throw new Error(errorData.message || "Failed to fetch family members");
  }

  return response.json();
};

// Type for expense payload
export type ExpensePayload = {
  amount: number;
  description: string;
  expense_date: string; // format: DD-MM-YYYY
  payment_method: string;
  shared?: boolean;
  category_id: number; // Optional for predefined categories
  other_category_name?: string; // Optional for other categories
};

export type ExpenseResponse = {
  expense_id: number;
  head_user_id: number;
  member_user_id: number;
  category_id: number | null;
  other_category_name: string | null;
  category_type: 'predefined' | 'other';
  category_name: string;
  amount: number;
  description: string;
  expense_date: string;
  payment_method: string;
  member_user: {
    user_id: number;
    user_name: string;
    email: string;
    mobile: string;
    role_id: number;
    created_at: string;
    updated_at: string;
    email_verified_at: string;
    converted_to_family_at: string | null;
    is_solo_user: boolean;
  };
  created_at: string;
  updated_at: string;
};

export const addExpense = async (payload: ExpensePayload): Promise<ExpenseResponse> => {
  const accessToken = Cookies.get('access_token');
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to add expense");
  }

  return response.json();
};