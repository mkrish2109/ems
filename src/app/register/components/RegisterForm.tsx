import Link from 'next/link';
import { 
  MdAlternateEmail, 
  MdPhone, 
  MdPerson, 
  MdLockOutline 
} from "react-icons/md";
import { RegisterFormData, Role } from '@/types/auth';
import FormField from '@/components/forms/FormField';
import SubmitButton from '@/components/forms/SubmitButton';
import RoleSelection from './RoleSelection';

interface RegisterFormProps {
  formData: RegisterFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  roles: Role[];
  loading: boolean;
  errors: { [key: string]: string };
  successMessage: string;
  isDataPrefilled: boolean;
  isInvitationFlow: boolean;
  rolesLoading: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  formData,
  onChange,
  onPhoneChange,
  onSubmit,
  roles,
  loading,
  errors,
  successMessage,
  isDataPrefilled,
  isInvitationFlow,
  rolesLoading,
}) => {
  return (
    <div className="px-[23px]">
      {errors.api && (
        <p className="text-red-500 text-[14px] mb-[12px] p-2 border border-red-500 rounded-lg">
          {errors.api}
        </p>
      )}
      {successMessage && (
        <p className="text-green-600 text-[14px] mb-[12px]">
          {successMessage}
        </p>
      )}

      <form onSubmit={onSubmit}>
        {/* Name */}
        <FormField
          label="Your Name"
          name="user_name"
          type="text"
          value={formData.user_name}
          onChange={onChange}
          placeholder="Ex. abc"
          disabled={loading || isDataPrefilled}
          error={errors.user_name}
          icon={<MdPerson size={22} />}
        />

        {/* Email */}
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder="Ex: abc@example.com"
          disabled={loading || isDataPrefilled}
          error={errors.email}
          icon={<MdAlternateEmail size={24} />}
        />

        {/* Phone - Use onPhoneChange specifically for phone input */}
        <div className="mb-[8px]">
          <label className="block text-[16px] text-black mb-[6px]">
            Mobile Number
          </label>
          <div className="relative">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onPhoneChange}
              placeholder="9876543210"
              disabled={loading || isDataPrefilled}
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full h-14 border border-[#C8C8C8] rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-gray-800 disabled:opacity-60 disabled:bg-gray-100"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8C8C8]">
              <MdPhone size={22} />
            </div>
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone}</p>
          )}
        </div>

        {/* Password */}
        <FormField
          label="Your Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={onChange}
          placeholder="•••••••"
          disabled={loading}
          error={errors.password}
          icon={<MdLockOutline size={20} />}
        />

        {/* Role Selection */}
        <RoleSelection
          roles={roles}
          selectedRole={formData.role}
          onChange={onChange}
          loading={rolesLoading}
          isInvitationFlow={isInvitationFlow}
          error={errors.role}
        />

        {/* Submit Button */}
        <SubmitButton
          loading={loading}
          text="Register"
          loadingText="Registering..."
        />
      </form>

      <div className="text-center mb-[42px]">
        <p className="text-[16px] text-black">
          Already have an account?
          <Link href="/login" className="text-[#008DD2] underline ml-1">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;