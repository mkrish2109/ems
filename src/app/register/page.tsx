"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MdAlternateEmail,
  MdPhone,
  MdPerson,
  MdLockOutline,
} from "react-icons/md";
import BackButton from "@/components/ui/BackButton";
import { fetchRoles, registerUser, validateInvitation } from "@/lib/api";
import PageLoader from "@/components/ui/PageLoader";

// Types
type Role = { role_id: number; role_name: string };
type RegisterResponse = {
  message: string;
  user?: { id: number; hash: string };
};
type RegisterPayload = {
  user_name: string;
  email: string;
  mobile: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  invitation_token?: string;
};

function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isDataPrefilled, setIsDataPrefilled] = useState(false);
  const [isInvitationFlow, setIsInvitationFlow] = useState(false);

  // Redirect logged-in users & get token
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole) {
      if (userRole === "Family Head") router.push("/dashboard/family-head");
      else if (userRole === "Family Member")
        router.push("/dashboard/family-member");
      else if (userRole === "solo user")
        router.push("/dashboard/family-member");
      else router.push("/dashboard");
    }
    const tokenFromUrl = searchParams.get("token");
    setToken(tokenFromUrl);
    if (tokenFromUrl) {
      setIsInvitationFlow(true);
      
    }
    // setIsInvitationFlow(!!tokenFromUrl);
  }, [router, searchParams]);

  // Fetch roles & validate token
  useEffect(() => {
    const loadData = async () => {
      try {
        setRolesLoading(true);
        const fetchedRoles = await fetchRoles();

        if (Array.isArray(fetchedRoles)) {
          if (typeof fetchedRoles[0] === "string") {
            const mappedRoles: Role[] = fetchedRoles.map(
              (r: any, idx: number) => ({
                role_id: idx + 1,
                role_name: r,
                is_active: true, // default value
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
            );
            setRoles(mappedRoles);
          } else {
            //  If API returns object array but TS cannot infer, cast safely via unknown
            setRoles(fetchedRoles as unknown as Role[]);
          }
        }

        if (token) {
          setLoading(true);
          const response = await validateInvitation(token);
          const invitation = response.invitation;

          setFormData((prev) => ({
            ...prev,
            user_name: invitation.user_name || prev.user_name,
            email: invitation.email || prev.email,
            phone: invitation.mobile
              ? invitation.mobile.replace("+", "")
              : prev.phone,
            role: "Family Member", // Auto-select Family Member for invitations
          }));
          setIsDataPrefilled(true);
          setErrors({});
        }
      } catch (err: unknown) {
        console.error(err);
        if (token) {
          setErrors({
            api:
              typeof err === "object" && err !== null && "message" in err
                ? (err as { message?: string }).message ||
                  "Invalid or expired invitation. Please register manually or contact support."
                : "Invalid or expired invitation. Please register manually or contact support.",
          });
          setIsDataPrefilled(false);
        }
      } finally {
        setRolesLoading(false);
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  // Strict phone number validation - only digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow only digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    
    setFormData({ ...formData, phone: digitsOnly });
    
    // Clear phone error when user starts typing
    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }
  };

  // Validation
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.user_name.trim()) newErrors.user_name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email";
    if (!formData.phone) newErrors.phone = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Enter a valid 10-digit number";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.role) newErrors.role = "Please select a role";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const selectedRole = roles.find((r) => r.role_name === formData.role);
      if (!selectedRole) {
        setErrors({ role: "Invalid role selected" });
        return;
      }

      const payload: RegisterPayload = {
        user_name: formData.user_name,
        email: formData.email,
        mobile: formData.phone,
        password: formData.password,
        password_confirmation: formData.password,
        role_id: selectedRole.role_id,
      };

      if (token) payload.invitation_token = token;

      const response: RegisterResponse = await registerUser(payload);

      setSuccessMessage(
        response.message || "Registration successful! Please verify your email."
      );
      setFormData({
        user_name: "",
        email: "",
        phone: "",
        password: "",
        role: "",
      });

      // if (response.user) setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null) {
        const apiErrors: { [key: string]: string } = {};
        for (const key in err as Record<string, unknown>) {
          const value = (err as Record<string, unknown>)[key];
          if (Array.isArray(value)) apiErrors[key] = value[0] as string;
        }
        setErrors(apiErrors);
      } else {
        setErrors({ api: "Registration failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter roles based on registration flow
  const getFilteredRoles = () => {
    if (isInvitationFlow) {
      // For invitation flow, only show Family Member and auto-select it
      return roles.filter(role => role.role_name === "Family Member");
    } else {
      // For normal registration, exclude Family Member
      return roles.filter(role => role.role_name !== "Family Member");
    }
  };

  const filteredRoles = getFilteredRoles();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Show PageLoader when roles are loading */}
      {rolesLoading && <PageLoader />}
      
      <div className="w-full max-w-[390px] min-h-[844px] bg-white shadow-lg">
        <div className="px-[20px] pt-[40px]">
          <BackButton />
        </div>
        <div className="px-[23px] pt-[37px]">
          <h1 className="text-[30px] font-bold text-black mb-[16px]">
            Register
          </h1>
          <p className="text-[16px] text-black mb-[18px]">
            Create an account to access all the features of Linear!
          </p>

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

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-[8px]">
              <label className="block text-[16px] text-black mb-[6px]">
                Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  placeholder="Ex. abc"
                  disabled={loading || isDataPrefilled}
                  className="w-full h-14 border border-[#C8C8C8] rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-gray-800 disabled:opacity-60 disabled:bg-gray-100"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8C8C8]">
                  <MdPerson size={22} />
                </div>
              </div>
              {errors.user_name && (
                <p className="text-red-500 text-sm">{errors.user_name}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-[8px]">
              <label className="block text-[16px] text-black mb-[6px]">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ex: abc@example.com"
                  disabled={loading || isDataPrefilled}
                  className="w-full h-14 border border-[#C8C8C8] rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-gray-800 disabled:opacity-60 disabled:bg-gray-100"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8C8C8]">
                  <MdAlternateEmail size={24} />
                </div>
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="mb-[8px]">
              <label className="block text-[16px] text-black mb-[6px]">
                Mobile Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="9876543210"
                  disabled={loading || isDataPrefilled}
                  className="w-full h-14 border border-[#C8C8C8] rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-gray-800 disabled:opacity-60 disabled:bg-gray-100"
                  inputMode="numeric"
                  pattern="[0-9]*"
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
            <div className="mb-[8px]">
              <label className="block text-[16px] text-black mb-[6px]">
                Your Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="•••••••"
                  disabled={loading}
                  className="w-full h-14 border border-[#C8C8C8] rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-gray-800 disabled:opacity-60"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8C8C8]">
                  <MdLockOutline size={20} />
                </div>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Role - Updated to Radio Buttons */}
            <div className="mb-[17px]">
              <label className="block text-[16px] text-black mb-[6px]">
                Role
              </label>
              <div className="flex gap-6">
                {rolesLoading ? (
                  <p>Loading roles...</p>
                ) : isInvitationFlow ? (
                  // For invitation flow - show only Family Member as selected
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="Family Member"
                      checked={formData.role === "Family Member"}
                      onChange={handleChange}
                      disabled={true} // Disabled since it's auto-selected
                      className="w-5 h-5 text-[#008DD2] border-gray-300 focus:ring-[#008DD2] disabled:opacity-60"
                    />
                    <span className="text-gray-800">Family Member</span>
                  </label>
                ) : (
                  // For normal registration - show all except Family Member
                  filteredRoles.map((role) => (
                    <label
                      key={role.role_id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.role_name}
                        checked={formData.role === role.role_name}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-5 h-5 text-[#008DD2] border-gray-300 focus:ring-[#008DD2] disabled:opacity-60"
                      />
                      <span className="text-gray-800">{role.role_name}</span>
                    </label>
                  ))
                )}
              </div>
              {errors.role && (
                <p className="text-red-500 text-sm">{errors.role}</p>
              )}
            </div>

            {/* Submit */}
            <div className="mb-[10px]">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#008DD2] rounded-2xl text-white font-bold text-[16px] disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
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
      </div>
    </div>
  );
}

// Export with Suspense boundary
export default function RegisterPageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Register />
    </Suspense>
  );
}