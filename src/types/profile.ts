export interface UserProfile {
  user_id: number;
  user_name: string;
  email: string;
  mobile?: string;  // Added mobile field
  role: {
    role_name: string;
  };
}

export interface ProfileMenuItemType {
  icon: string;
  alt: string;
  label: string;
  path: string;
}

export interface ProfileSectionType {
  title: string;
  items: ProfileMenuItemType[];
}

// NEW TYPES ADDED
export interface ProfileFormData {
  user_name: string;
  mobile: string;
}

export interface DeleteConfirmState {
  show: boolean;
  userId: string | null;
  userName: string;
  inputText: string;
}

export interface MessageState {
  type: 'success' | 'error' | '';
  text: string;
}