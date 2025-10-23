"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import gallery from "../../../public/assets/Icon/gallery.svg";
import profile_user from "../../../public/assets/Icon/profile_user.svg";
import notification from "../../../public/assets/Icon/notification.svg";
import lock from "../../../public/assets/Icon/lock.svg";
import terms from "../../../public/assets/Icon/terms.svg";
import help from "../../../public/assets/Icon/help.svg";
import PageHeader from "@/components/ui/PageHeader";
import { ProfileService, UserProfile } from '@/lib/api/profile';
import PageLoader from "@/components/ui/PageLoader";

export default function Profile() {
  const router = useRouter();
  const accessToken = Cookies.get('access_token');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProfileService.getProfile();
      setProfile(response.data);
      
      // Store user ID in cookies for later use
      Cookies.set('userId', response.data.user_id.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  function handleLogout() {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
      method: 'POST',
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      credentials: 'include',
    })
      .then(response => {
        if (response.ok) {
          // Clear all cookies
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          Cookies.remove('userRole');
          Cookies.remove('userId');
          window.location.href = '/welcome';
        } else {
          console.error('Logout failed:', response.status);
        }
      })
      .catch(error => {
        console.error('Network error:', error);
      });
  }

  const navigateTo = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
     <PageLoader />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg flex items-center justify-center">
          <div className="text-center px-6">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button 
              onClick={fetchProfile}
              className="bg-[#008DD2] text-white px-6 py-2 rounded-[16px] hover:bg-[#007cba] transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg">
        <PageHeader title="Profile" />

        <div className="flex flex-col items-center mt-4">
          <div className="w-[88px] h-[88px] bg-white rounded-full flex items-center justify-center mb-2">
            <Image src={gallery} alt="gallery" />
          </div>
          <h2 className="text-[20px] font-bold text-[#008DD2]">
            {profile?.user_name || 'Dss Family'}
          </h2>
          <p className="text-[14px] text-[#052C4D] mt-1">
            {profile?.role?.role_name || 'User'}
          </p>
          <p className="text-[12px] text-gray-600 mt-1">
            {profile?.email}
          </p>
        </div>

        {/* Account Section */}
        <div className="mt-8 px-6">
          <h3 className="text-[16px] font-semibold text-[#052C4D] mb-1">
            Account
          </h3>

          <div 
            onClick={() => navigateTo('/edit-profile')}
            className="w-full h-[56px] bg-white rounded-[16px] flex items-center px-4 mb-[15px] cursor-pointer hover:bg-gray-50"
          >
            <Image src={profile_user} alt="profile_user" />
            <span className="text-[16px] font-medium text-[#052C4D] ml-4">
              Edit profile
            </span>
          </div>

          <div 
            onClick={() => navigateTo('/change-password')}
            className="w-full h-[56px] bg-white rounded-[16px] flex items-center px-4 cursor-pointer hover:bg-gray-50"
          >
            <Image src={lock} alt="lock" />
            <span className="text-[16px] font-medium text-[#052C4D] ml-4">
              Change Password
            </span>
          </div>
        </div>

        {/* Application Section */}
        <div className="mt-8 px-6">
          <h3 className="text-[16px] font-semibold text-[#052C4D] mb-1">
            Application
          </h3>

          <div 
            onClick={() => navigateTo('/privacy-policy')}
            className="w-full h-[56px] bg-white rounded-[16px] flex items-center px-4 mb-[15px] cursor-pointer hover:bg-gray-50"
          >
            <Image src={notification} alt="notification" />
            <span className="text-[16px] font-medium text-[#052C4D] ml-4">
              Privacy Policy
            </span>
          </div>

          <div 
            onClick={() => navigateTo('/terms-and-conditions')}
            className="w-full h-[56px] bg-white rounded-[16px] flex items-center px-4 cursor-pointer hover:bg-gray-50"
          >
            <Image src={terms} alt="terms" />
            <span className="text-[16px] font-medium text-[#052C4D] ml-4">
              Terms of Service
            </span>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 px-6">
          <h3 className="text-[16px] font-semibold text-[#052C4D] mb-1">
            Support
          </h3>

          <div 
            onClick={() => navigateTo('/help-center')}
            className="w-full h-[56px] bg-white rounded-[16px] flex items-center px-4 cursor-pointer hover:bg-gray-50"
          >
            <Image src={help} alt="help" />
            <span className="text-[16px] font-medium text-[#052C4D] ml-4">
              Help Center
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <div className="my-[27px] px-6">
          <button
            onClick={handleLogout}
            className="w-full h-[56px] bg-[#008DD2] rounded-[16px] flex items-center justify-center hover:bg-[#007cba] transition-colors cursor-pointer"
          >
            <span className="text-[18px] font-bold text-white">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}