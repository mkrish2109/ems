import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface UserProfile {
  user_id: number;
  user_name: string;
  email: string;
  mobile: string;
  role_id: number;
  created_at: string;
  updated_at: string;
  email_verified_at: string;
  role: {
    role_id: number;
    role_name: string;
    is_active: number;
    created_at: string;
    updated_at: string;
  };
}

export interface ProfileResponse {
  data: UserProfile;
}

export interface UpdateProfileData {
  user_name: string;
  mobile: string;
}

export interface FcmTokenResponse {
  message: string;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  notifications: {
    data: Notification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export class ProfileService {
  private static getAuthHeaders() {
    const accessToken = Cookies.get("access_token");
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
  }

  static async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${BASE_URL}/profile`, {
        method: "GET",
        headers: this.getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || "Failed to fetch profile");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred while fetching profile");
    }
  }

  static async updateProfile(
    profileData: UpdateProfileData
  ): Promise<ProfileResponse> {
    const userId = Cookies.get("userId");
    try {
      const response = await fetch(`${BASE_URL}/profile/${userId}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred while updating profile");
    }
  }

  // FCM Token Management Methods
  static async updateFcmToken(fcmToken: string): Promise<FcmTokenResponse> {
    try {
      const response = await fetch(`${BASE_URL}/fcm-token`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ fcm_token: fcmToken }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || "Failed to update FCM token");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred while updating FCM token");
    }
  }

  static async removeFcmToken(): Promise<FcmTokenResponse> {
    try {
      const response = await fetch(`${BASE_URL}/fcm-token`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || "Failed to remove FCM token");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred while removing FCM token");
    }
  }

  // Notification Management Methods
  static async getNotifications(
    page: number = 1,
    perPage: number = 15
  ): Promise<NotificationsResponse> {
    try {
      const response = await fetch(
        `${BASE_URL}/notifications?page=${page}&per_page=${perPage}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || "Failed to fetch notifications");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred while fetching notifications");
    }
  }

  static async markNotificationAsRead(
    notificationId: number
  ): Promise<{ message: string }> {
    try {
      const response = await fetch(
        `${BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(
          errorData.message || "Failed to mark notification as read"
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        "Network error occurred while marking notification as read"
      );
    }
  }

  static async markAllNotificationsAsRead(): Promise<{ message: string }> {
    try {
      const response = await fetch(`${BASE_URL}/notifications/read-all`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(
          errorData.message || "Failed to mark all notifications as read"
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        "Network error occurred while marking all notifications as read"
      );
    }
  }

  static async deleteNotification(
    notificationId: number
  ): Promise<{ message: string }> {
    try {
      const response = await fetch(
        `${BASE_URL}/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || "Failed to delete notification");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred while deleting notification");
    }
  }

  static async deleteAllNotifications(): Promise<{ message: string }> {
    try {
      const response = await fetch(`${BASE_URL}/notifications`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(
          errorData.message || "Failed to delete all notifications"
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        "Network error occurred while deleting all notifications"
      );
    }
  }
}
