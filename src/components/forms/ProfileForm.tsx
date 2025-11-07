"use client";

import { ProfileFormData, UserProfile, MessageState } from '@/types/profile';
import { ConvertRoleButton } from '@/components/profile/ConvertRoleButton';

interface ProfileFormProps {
  formData: ProfileFormData;
  profile: UserProfile | null;
  loading: boolean;
  message: MessageState;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConvertToFamilyHead: () => void;
  converting: boolean;
  onDeleteClick: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  profile,
  loading,
  message,
  onSubmit,
  onInputChange,
  onConvertToFamilyHead,
  converting,
  onDeleteClick,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* User Name */}
      <div>
        <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
          User Name
        </label>
        <input
          type="text"
          name="user_name"
          value={formData.user_name}
          onChange={onInputChange}
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
          onChange={onInputChange}
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
          value={profile?.email || ''}
          className="w-full h-[56px] px-4 bg-gray-100 rounded-[16px] border border-gray-300 text-gray-600 cursor-not-allowed"
          readOnly
          disabled
        />
        <p className="text-sm text-gray-500 mt-1">
          Email cannot be changed
        </p>
      </div>

      {/* Role with Convert Button */}
      <div>
        <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
          Role
        </label>
        <div className="relative">
          <input
            type="text"
            value={profile?.role?.role_name || ''}
            className="w-full h-[56px] px-4 pr-[130px] bg-gray-100 rounded-[16px] border border-gray-300 text-gray-600 cursor-not-allowed"
            readOnly
            disabled
          />
          <ConvertRoleButton
            roleName={profile?.role?.role_name}
            converting={converting}
            onConvert={onConvertToFamilyHead}
          />
        </div>
        {profile?.role?.role_name === 'Solo User' && (
          <p className="text-sm text-gray-500 mt-1">
            Convert to Family Head to create and manage family groups
          </p>
        )}
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`px-4 py-2 rounded-[16px] text-[12px] ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
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
          {loading ? 'Updating Profile...' : 'Update Profile'}
        </span>
      </button>

      {/* Delete Profile Button */}
      <button
        type="button"
        onClick={onDeleteClick}
        disabled={loading}
        className="w-full h-[56px] bg-[red]/70 rounded-[16px] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <span className="text-[18px] font-bold text-white">
          Delete Profile
        </span>
      </button>
    </form>
  );
};