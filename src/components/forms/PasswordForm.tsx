import React from 'react';
import { PasswordData, MessageType } from '@/types/auth';
import PasswordInput from './PasswordInput';
import MessageAlert from '@/components/ui/MessageAlert';

interface PasswordFormProps {
  passwordData: PasswordData;
  loading: boolean;
  message: MessageType;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const PasswordForm: React.FC<PasswordFormProps> = ({
  passwordData,
  loading,
  message,
  onInputChange,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Current Password */}
      <PasswordInput
        label="Current Password"
        name="currentPassword"
        value={passwordData.currentPassword}
        onChange={onInputChange}
        placeholder="Enter your current password"
      />

      {/* New Password */}
      <PasswordInput
        label="New Password"
        name="newPassword"
        value={passwordData.newPassword}
        onChange={onInputChange}
        placeholder="Enter new password"
        showTips={true}
      />

      {/* Confirm New Password */}
      <PasswordInput
        label="Confirm New Password"
        name="confirmPassword"
        value={passwordData.confirmPassword}
        onChange={onInputChange}
        placeholder="Confirm your new password"
      />

      {/* Message Display */}
      {message.text && (
        <MessageAlert type={message.type} text={message.text} />
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
  );
};

export default PasswordForm;