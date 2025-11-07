export type Role = { 
  role_id: number; 
  role_name: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type RegisterFormData = {
  user_name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
};

export type RegisterPayload = {
  user_name: string;
  email: string;
  mobile: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  invitation_token?: string;
};

export type RegisterResponse = {
  message: string;
  user?: { id: number; hash: string };
};

export type FormErrors = {
  [key: string]: string;
};

// Add login types
export type LoginFormData = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    role: {
      role_name: string;
    };
  };
  message?: string;
};

export type LoginErrors = {
  email?: string;
  password?: string;
};

// Add password change types
export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MessageType {
  type: 'success' | 'error' | '';
  text: string;
}