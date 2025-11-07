import { HiChevronDown } from "react-icons/hi";
import { Role } from "@/types/member"; // Remove ValidationErrors import

interface RoleDropdownProps {
  roles: Role[];
  selectedRole: string;
  openRole: boolean;
  setOpenRole: (open: boolean) => void;
  setSelectedRole: (role: string) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
}

export const RoleDropdown: React.FC<RoleDropdownProps> = ({
  roles,
  selectedRole,
  openRole,
  setOpenRole,
  setSelectedRole,
  onBlur,
  error,
  touched,
  disabled = false,
}) => {
  return (
    <div className="w-full mb-[19px]">
      <label className="block text-[16px] font-medium text-[#052C4D] mb-1">
        Role
      </label>
      <div className="relative">
        <button
          type="button"
          className="w-full h-14 bg-white rounded-2xl px-4 flex items-center justify-between focus:outline-none cursor-pointer disabled:opacity-60"
          onClick={() => setOpenRole(!openRole)}
          onBlur={onBlur}
          disabled={disabled}
        >
          <span className="text-[16px] text-[#052C4D]">
            {selectedRole || "Select Role"}
          </span>
          <HiChevronDown
            className={`text-[#008DD2] transition-transform ${
              openRole ? "rotate-180" : ""
            }`}
            size={20}
          />
        </button>

        {openRole && (
          <div className="absolute right-[15px] w-[160px] -mt-[18px] bg-white rounded-2xl shadow-md z-10">
            {roles.map((role) => (
              <button
                key={role.role_id}
                type="button"
                className="w-full flex items-center justify-between px-4 py-[6px] text-left text-[14px] text-[#052C4D] cursor-pointer"
                onClick={() => {
                  setSelectedRole(role.role_name);
                  setOpenRole(false);
                }}
              >
                <span>{role.role_name}</span>
                <span
                  className={`h-[11px] w-[11px] rounded-full border-2 flex items-center justify-center ${
                    selectedRole === role.role_name
                      ? "border-[#008DD2]"
                      : "border-[#C8C8C8]"
                  }`}
                >
                  {selectedRole === role.role_name && (
                    <span className="w-full h-full bg-[#008DD2] rounded-full"></span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && touched && (
        <p className="text-red-500 text-[12px] mt-1 ml-2">{error}</p>
      )}
    </div>
  );
};