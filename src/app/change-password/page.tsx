"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import PageHeader from "@/components/ui/PageHeader";

export default function ChangePassword() {
  const router = useRouter();
  const accessToken = Cookies.get('access_token');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      setLoading(false);
      return;
    }

    try {
      const userId = Cookies.get('userId');
      console.log('useid', userId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          password: passwordData.newPassword,
          password_confirmation: passwordData.confirmPassword
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Redirect back to profile after success
        // setTimeout(() => {
        //   router.push('/profile');
        // }, 2000);
      } else {
        const errorData = await response.json();
        
        // Handle the specific error response format
        if (errorData.errors && errorData.errors.password) {
          // Join all password error messages into a single string
          const errorMessage = errorData.errors.password.join(' ');
          setMessage({ 
            type: 'error', 
            text: errorMessage 
          });
        } else {
          setMessage({ 
            type: 'error', 
            text: errorData.message || 'Failed to change password. Please check your current password.' 
          });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg">

        <PageHeader title="Change Password" className='text-[20px]'/>

        <div className="px-6 mt-4">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-[16px] font-medium text-[#052C4D] mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                className="w-full h-[56px] px-4 bg-white rounded-[16px] border border-gray-300 placeholder:text-[#C8C8C8] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#008DD2] focus:border-transparent"
                required
                placeholder="Enter your current password"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[16px] font-medium text-[#052C4D] mb-1">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                className="w-full h-[56px] px-4 bg-white rounded-[16px] border border-gray-300 placeholder:text-[#C8C8C8] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#008DD2] focus:border-transparent"
                required
                placeholder="Enter new password"
                minLength={6}
              />
              <p className="text-[12px] text-gray-500 mt-1">Must be at least 6 characters long and contain uppercase, lowercase, number, and special character</p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[16px] font-medium text-[#052C4D] mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                className="w-full h-[56px] px-4 bg-white rounded-[16px] border border-gray-300 placeholder:text-[#C8C8C8] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#008DD2] focus:border-transparent"
                required
                placeholder="Confirm your new password"
                minLength={6}
              />
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`px-4 py-2 rounded-[16px] text-[14px] ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
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
                {loading ? 'Changing Password...' : 'Change Password'}
              </span>
            </button>
          </form>

          {/* Security Tips */}
          <div className="mt-8 p-4 bg-blue-50 rounded-[16px] border border-blue-200">
            <h4 className="text-[16px] font-semibold text-[#052C4D] mb-2">Password Tips</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use at least 6 characters</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include numbers and special characters</li>
              <li>• Avoid using personal information</li>
              <li>• Don&#39;t reuse old passwords</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}