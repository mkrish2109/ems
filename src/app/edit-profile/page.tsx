"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import PageHeader from "@/components/ui/PageHeader";
import { ProfileService, UserProfile } from "@/lib/api/profile";
import { SiConvertio } from "react-icons/si";

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    user_name: "",
    mobile: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    userId: string | null;
    userName: string;
    inputText: string;
  }>({
    show: false,
    userId: null,
    userName: "",
    inputText: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await ProfileService.getProfile();
      setProfile(response.data);
      setFormData({
        user_name: response.data.user_name,
        mobile: response.data.mobile,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to load profile",
      });
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Validation
    if (!formData.user_name.trim()) {
      setMessage({ type: "error", text: "User name is required" });
      setLoading(false);
      return;
    }

    if (!formData.mobile.trim()) {
      setMessage({ type: "error", text: "Mobile number is required" });
      setLoading(false);
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setMessage({
        type: "error",
        text: "Please enter a valid 10-digit mobile number",
      });
      setLoading(false);
      return;
    }

    try {
      const userId = Cookies.get("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      await ProfileService.updateProfile(formData);

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to update profile",
      });
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Updated Convert to Family Head Function
  const handleConvertToFamilyHead = async () => {
    try {
      setConverting(true);
      setMessage({ type: "", text: "" });

      const accessToken = Cookies.get("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/family/convert`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to convert to family head");
      }

      // Update role in cookies
      const currentUserRole = Cookies.get("userRole");
      if (currentUserRole === "Solo User") {
        Cookies.set("userRole", "Family Head", {
          expires: 7,
          path: "/",
          sameSite: "strict",
        });
      }

      setMessage({
        type: "success",
        text: "Successfully converted to Family Head!",
      });

      // Refresh profile
      await fetchProfile();

      //  Force reload to apply new cookie
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to convert to family head",
      });
      console.error("Convert to family head error:", error);
    } finally {
      setConverting(false);
    }
  };

  const handleDeleteClick = () => {
    const userId = Cookies.get("userId");
    const userName = profile?.user_name || "";

    if (userId) {
      setDeleteConfirm({
        show: true,
        userId,
        userName,
        inputText: "",
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({
      show: false,
      userId: null,
      userName: "",
      inputText: "",
    });
  };

  
  const handleDeleteConfirm = async () => {
  if (deleteConfirm.inputText !== "DELETE" || !deleteConfirm.userId) {
    return;
  }

  try {
    const accessToken = Cookies.get("access_token");

    //  Step 1: Delete the user profile
    const deleteRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${deleteConfirm.userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!deleteRes.ok) {
      const errData = await deleteRes.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to delete profile");
    }

    //  Step 2: Call the same logout API to invalidate all tokens on server
    const logoutRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });

    if (!logoutRes.ok) {
      console.warn("Logout request failed on server side, continuing cleanup...");
    }

    //  Step 3: Clear all cookies (access_token, refresh_token, userId, etc.)
    const cookiesToRemove = [
      "access_token",
      "refresh_token",
      "userRole",
      "userId",
      "user_id",
      "token",
      "auth_token",
    ];

    cookiesToRemove.forEach((cookieName) => {
      Cookies.remove(cookieName, { path: "/" });
      Cookies.remove(cookieName);
    });

    const allCookies = Object.keys(Cookies.get());
    allCookies.forEach((cookieName) => {
      Cookies.remove(cookieName, { path: "/" });
      Cookies.remove(cookieName);
    });

    console.log(" All cookies cleared after delete profile + logout");

    //  Step 4: Close modal and redirect to Welcome page
    handleDeleteCancel();
    window.location.href = "/welcome";
  } catch (error) {
    console.error("Failed to delete profile:", error);
    setMessage({
      type: "error",
      text: error instanceof Error ? error.message : "Failed to delete profile",
    });
  }
};


  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg">
        <PageHeader title="Edit Profile" className="text-[20px]" />

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="w-full max-w-[390px] min-h-[844px] bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-[10px] p-6 w-[320px] mx-4">
                <h3 className="text-[18px] font-semibold text-[#052C4D] mb-4">
                  Delete Profile
                </h3>
                <p className="text-[16px] text-[#052C4D] mb-4">
                  Are you sure you want to delete your profile{" "}
                  <strong>{deleteConfirm.userName}</strong>? Type{" "}
                  <strong>DELETE</strong> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteConfirm.inputText}
                  onChange={(e) =>
                    setDeleteConfirm((prev) => ({
                      ...prev,
                      inputText: e.target.value,
                    }))
                  }
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

        <div className="px-6 mt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Name */}
            <div>
              <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
                User Name
              </label>
              <input
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleInputChange}
                className="w-full h-[56px] px-4 bg-white rounded-[16px] border border-gray-300 placeholder:text-[#C8C8C8] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#008DD2] focus:border-transparent"
                required
                placeholder="Enter your name"
                disabled={loading}
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="w-full h-[56px] px-4 bg-white rounded-[16px] border border-gray-300 placeholder:text-[#C8C8C8] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#008DD2] focus:border-transparent"
                required
                placeholder="Enter your mobile number"
                pattern="[0-9]{10}"
                maxLength={10}
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter 10-digit mobile number
              </p>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                className="w-full h-[56px] px-4 bg-gray-100 rounded-[16px] border border-gray-300 text-gray-600 cursor-not-allowed"
                readOnly
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* ✅ Role (Read-only) with Convert Icon */}
            <div>
              <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
                Role
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profile?.role?.role_name || ""}
                  className="w-full h-[56px] px-4 pr-[130px] bg-gray-100 rounded-[16px] border border-gray-300 text-gray-600 cursor-not-allowed"
                  readOnly
                  disabled
                />
                {profile?.role?.role_name === "Solo User" && (
                  <button
                    onClick={handleConvertToFamilyHead}
                    disabled={converting}
                    title="Convert to Family Head"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-2 rounded-[10px] border border-[#008DD2] text-[#008DD2] text-[14px] font-medium hover:bg-[#008DD2]/10 transition-all ${
                      converting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <SiConvertio className="text-[18px]" />
                    {converting ? "Converting..." : "Convert"}
                  </button>
                )}
              </div>
              {profile?.role?.role_name === "Solo User" && (
                <p className="text-sm text-gray-500 mt-1">
                  Convert to Family Head to create and manage family groups
                </p>
              )}
            </div>

            {/* Message Display */}
            {message.text && (
              <div
                className={`px-4 py-2 rounded-[16px] text-[12px] ${
                  message.type === "success"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[56px] bg-[#008DD2] rounded-[16px] flex items-center justify-center hover:bg-[#007cba] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="text-[18px] font-bold text-white">
                {loading ? "Updating Profile..." : "Update Profile"}
              </span>
            </button>

            {/* Delete Profile Button */}
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={loading}
              className="w-full h-[56px] bg-[red]/70 rounded-[16px] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="text-[18px] font-bold text-white">
                Delete Profile
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
