import { Role } from '@/types/auth';

interface RoleSelectionProps {
  roles: Role[];
  selectedRole: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  isInvitationFlow: boolean;
  error?: string;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({
  roles,
  selectedRole,
  onChange,
  loading,
  isInvitationFlow,
  error,
}) => {
  const getFilteredRoles = () => {
    if (isInvitationFlow) {
      return roles.filter(role => role.role_name === "Family Member");
    } else {
      return roles.filter(role => role.role_name !== "Family Member");
    }
  };

  const filteredRoles = getFilteredRoles();

  return (
    <div className="mb-[17px]">
      <label className="block text-[16px] text-black mb-[6px]">
        Role
      </label>
      <div className="flex gap-6">
        {loading ? (
          <p>Loading roles...</p>
        ) : isInvitationFlow ? (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="Family Member"
              checked={selectedRole === "Family Member"}
              onChange={onChange}
              disabled={true}
              className="w-5 h-5 text-[#008DD2] border-gray-300 focus:ring-[#008DD2] disabled:opacity-60"
            />
            <span className="text-gray-800">Family Member</span>
          </label>
        ) : (
          filteredRoles.map((role) => (
            <label
              key={role.role_id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="role"
                value={role.role_name}
                checked={selectedRole === role.role_name}
                onChange={onChange}
                disabled={loading}
                className="w-5 h-5 text-[#008DD2] border-gray-300 focus:ring-[#008DD2] disabled:opacity-60"
              />
              <span className="text-gray-800">{role.role_name}</span>
            </label>
          ))
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

export default RoleSelection;