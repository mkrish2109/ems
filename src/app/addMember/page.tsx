"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import PageHeader from "@/components/ui/PageHeader";
import { HiChevronDown } from "react-icons/hi";
import { fetchRoles, inviteMember } from "@/lib/api";
import { useRouter } from "next/navigation";

type Role = {
  role_id: number;
  role_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type InviteErrorResponse = {
  errors: Record<string, string[]>;
};

type InvitePayload = {
  user_name: string;
  relation: string;
  email: string;
  role: string;
  mobile: string;
  monthly_budget_limit?: number;
  profile_picture: string;
};

type ValidationErrors = {
  user_name?: string;
  relation?: string;
  email?: string;
  mobile?: string;
  role?: string;
};

export default function AddMember() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [openRole, setOpenRole] = useState(false);

  // Form states
  const [userName, setUserName] = useState("");
  const [relation, setRelation] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [budget, setBudget] = useState("");
  const [image, setImage] = useState<string | null>(null);

  // Validation states
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState<"success" | "error">("success");

  // Loading state
  const [loading, setLoading] = useState(false);

  // Track used mobile numbers (in a real app, this would come from API)
  const [usedMobileNumbers, setUsedMobileNumbers] = useState<Set<string>>(
    new Set()
  );

  // Load roles from API
  useEffect(() => {
    async function loadRoles() {
      try {
        const res = await fetchRoles();
        // Only include "Family Member"
        const filteredRoles: Role[] = res.filter(
          (role: Role) => role.role_name.toLowerCase() === "family member"
        );
        setRoles(filteredRoles);

        if (filteredRoles.length > 0) {
          setSelectedRole(filteredRoles[0].role_name);
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    }
    loadRoles();
  }, []);

  // Handle file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Strict phone number validation - only digits
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow only digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

    setMobile(digitsOnly);

    // Clear mobile error when user starts typing
    if (validationErrors.mobile) {
      setValidationErrors((prev) => ({ ...prev, mobile: undefined }));
    }
  };

  // Check if mobile number already exists
  const isMobileAlreadyUsed = (mobileNumber: string): boolean => {
    return usedMobileNumbers.has(mobileNumber);
  };

  // Validation function
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!userName.trim()) {
      errors.user_name = "The user name field is required.";
    }

    if (!relation.trim()) {
      errors.relation = "The relation field is required.";
    }

    if (!email.trim()) {
      errors.email = "The email field is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!mobile.trim()) {
      errors.mobile = "The mobile field is required.";
    } else if (!/^\d{10}$/.test(mobile)) {
      errors.mobile = "Please enter a valid 10-digit mobile number.";
    } else if (isMobileAlreadyUsed(mobile)) {
      errors.mobile = "This mobile number is already registered.";
    }

    if (!selectedRole) {
      errors.role = "The role field is required.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle field blur
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleCancel = () => {
    // Clear all form data
    setUserName("");
    setRelation("");
    setEmail("");
    setMobile("");
    setBudget("");
    setImage(null);
    setValidationErrors({});
    setTouched({});

    // Navigate to dashboard
    router.push("/dashboard");
  };

  const handleInvite = async () => {
    // Mark all fields as touched
    setTouched({
      user_name: true,
      relation: true,
      email: true,
      mobile: true,
      role: true,
    });

    // Validate form
    if (!validateForm()) {
      setPopupMessage("Please fill in all required fields correctly.");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    try {
      setLoading(true);

      const payload: InvitePayload = {
        user_name: userName,
        relation,
        email,
        role: selectedRole,
        mobile,
        monthly_budget_limit: budget ? parseFloat(budget) : undefined,
        profile_picture:
          "https://ems.digitsoftsol.co/uploads/website-images/ibrahim-khalil-2022-01-30-02-48-50-5743.jpg",
      };

      const res: { message: string } = await inviteMember(payload);

      setPopupMessage(res.message);
      setPopupType("success");
      setShowPopup(true);

      // Add mobile number to used numbers set
      setUsedMobileNumbers((prev) => new Set(prev).add(mobile));

      // Reset form
      setUserName("");
      setRelation("");
      setEmail("");
      setMobile("");
      setBudget("");
      setImage(null);
      setValidationErrors({});
      setTouched({});
    } catch (err) {
      const apiError = err as InviteErrorResponse;
      if (apiError?.errors && Object.keys(apiError.errors).length > 0) {
        const allMessages = Object.values(apiError.errors).flat().join(", ");
        setPopupMessage(allMessages);

        // Check if error contains mobile number duplicate info
        if (
          allMessages.toLowerCase().includes("mobile") &&
          (allMessages.toLowerCase().includes("already") ||
            allMessages.toLowerCase().includes("duplicate"))
        ) {
          setUsedMobileNumbers((prev) => new Set(prev).add(mobile));
        }
      } else if (err instanceof Error) {
        setPopupMessage(err.message);
      } else {
        setPopupMessage("Invite failed");
      }
      setPopupType("error");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg relative">
        <PageHeader title="Add Member" />
        <form
          className="px-6 space-y-6 mt-[19px]"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Name */}
          <div className="mb-[19px]">
            <input
              type="text"
              placeholder="Full Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onBlur={() => handleBlur("user_name")}
              className="w-full h-[56px] bg-white rounded-2xl px-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-[18px] text-gray-800"
              disabled={loading}
            />
            {validationErrors.user_name && touched.user_name && (
              <p className="text-red-500 text-[12px] mt-1 ml-2">
                {validationErrors.user_name}
              </p>
            )}
          </div>

          {/* Relation */}
          <div className="mb-[19px]">
            <label className="block text-[16px] font-medium text-[#052C4D] mb-[6px]">
              Members Relation
            </label>
            <input
              type="text"
              placeholder="Enter members relation"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              onBlur={() => handleBlur("relation")}
              className="w-full h-[56px] bg-white rounded-2xl px-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-[18px] text-gray-800"
              disabled={loading}
            />
            {validationErrors.relation && touched.relation && (
              <p className="text-red-500 text-[12px] mt-1 ml-2">
                {validationErrors.relation}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-[19px]">
            <label className="block text-[16px] font-medium text-[#052C4D] mb-[6px]">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              className="w-full h-[56px] bg-white rounded-2xl px-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-[18px] text-gray-800"
              disabled={loading}
            />
            {validationErrors.email && touched.email && (
              <p className="text-red-500 text-[12px] mt-1 ml-2">
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Mobile */}
          <div className="mb-[19px]">
            <label className="block text-[16px] font-medium text-[#052C4D] mb-[6px]">
              Mobile
            </label>
            <input
              type="tel"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={handleMobileChange}
              onBlur={() => handleBlur("mobile")}
              className="w-full h-[56px] bg-white rounded-2xl px-4 focus:outline-none focus:ring-2 focus:ring-[#008DD2] placeholder:text-[#C8C8C8] text-[18px] text-gray-800"
              disabled={loading}
              inputMode="numeric"
              pattern="[0-9]*"
            />
            {validationErrors.mobile && touched.mobile && (
              <p className="text-red-500 text-[12px] mt-1 ml-2">
                {validationErrors.mobile}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="w-full mb-[19px]">
            <label className="block text-[16px] font-medium text-[#052C4D] mb-1">
              Role
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full h-14 bg-white rounded-2xl px-4 flex items-center justify-between focus:outline-none cursor-pointer disabled:opacity-60"
                onClick={() => setOpenRole(!openRole)}
                onBlur={() => handleBlur("role")}
                disabled={loading}
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
                        setValidationErrors((prev) => ({
                          ...prev,
                          role: undefined,
                        }));
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
            {validationErrors.role && touched.role && (
              <p className="text-red-500 text-[12px] mt-1 ml-2">
                {validationErrors.role}
              </p>
            )}
          </div>

          {/* Upload */}
          <div className="ml-[38px] mb-[19px]">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={loading}
              />
              <div className="w-[88px] h-[88px] bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
                {image ? (
                  <Image
                    src={image}
                    alt="Uploaded"
                    width={88}
                    height={88}
                    className="object-cover rounded-full"
                  />
                ) : (
                  <span className="text-[#008DD2] text-2xl font-bold">+</span>
                )}
              </div>
            </label>
            <h2 className="mt-1 text-[22px] font-bold text-[#008DD2]">
              Upload
            </h2>
          </div>

          {/* Budget */}
          <div className="relative w-full mb-[19px]">
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full h-[68px] bg-white rounded-2xl px-4 pb-2 focus:outline-none focus:ring-2 focus:ring-[#008DD2] text-[16px] text-gray-800"
              disabled={loading}
            />
            {budget === "" && (
              <>
                <label className="absolute left-4 top-2 text-[16px] font-normal text-[#052C4D] pointer-events-none">
                  Monthly Budget Limit (Optional)
                </label>
                <span className="absolute left-4 bottom-2 text-[16px] font-semibold text-[#052C4D] pointer-events-none">
                  $ 5000.00
                </span>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between space-x-4 mb-[19px]">
            <button
              type="button"
              className="w-[143px] h-[45px] bg-[#008DD2] rounded-[10px] flex items-center justify-center cursor-pointer disabled:opacity-60"
              onClick={handleCancel}
              disabled={loading}
            >
              <span className="text-[16px] font-bold text-white">Cancel</span>
            </button>
            <button
              type="button"
              className="w-[143px] h-[45px] bg-[#008DD2] rounded-[10px] flex items-center justify-center cursor-pointer disabled:opacity-60"
              onClick={handleInvite}
              disabled={loading}
            >
              <span className="text-[16px] font-bold text-white">
                {loading ? "Sending..." : "Send Invite"}
              </span>
            </button>
          </div>
        </form>

        {/* Popup */}
        {showPopup && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
            <div className="w-[320px] bg-white rounded-2xl shadow-lg p-6 text-center">
              <p
                className={`text-[14px] mb-6 ${
                  popupType === "success" ? "text-[#052C4D]" : "text-red-500"
                }`}
              >
                {popupMessage}
              </p>
              <button
                type="button"
                className="w-full h-[45px] bg-[#008DD2] rounded-[10px] flex items-center justify-center cursor-pointer"
                onClick={() => setShowPopup(false)}
              >
                <span className="text-[16px] font-bold text-white">Close</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
