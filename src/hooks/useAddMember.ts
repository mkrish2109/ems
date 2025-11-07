import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchRoles, inviteMember } from "@/lib/api";
import { Role, InvitePayload, ValidationErrors, AddMemberFormData } from "@/types/member";

export const useAddMember = () => {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState<AddMemberFormData>({
    userName: "",
    relation: "",
    email: "",
    mobile: "",
    budget: "",
    image: null,
    selectedRole: "",
  });
  const [openRole, setOpenRole] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadRoles() {
      try {
        const res = await fetchRoles();
        const filteredRoles: Role[] = res.filter(
          (role: Role) => role.role_name.toLowerCase() === "family member"
        );
        setRoles(filteredRoles);

        if (filteredRoles.length > 0) {
          setFormData(prev => ({ ...prev, selectedRole: filteredRoles[0].role_name }));
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    }
    loadRoles();
  }, []);

  const handleInputChange = (field: keyof AddMemberFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleMobileChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    handleInputChange("mobile", digitsOnly);
  };

  const handleImageUpload = (imageData: string) => {
    setFormData(prev => ({ ...prev, image: imageData }));
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.userName.trim()) {
      errors.user_name = "The user name field is required.";
    }

    if (!formData.relation.trim()) {
      errors.relation = "The relation field is required.";
    }

    if (!formData.email.trim()) {
      errors.email = "The email field is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.mobile.trim()) {
      errors.mobile = "The mobile field is required.";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      errors.mobile = "Please enter a valid 10-digit mobile number.";
    }

    if (!formData.selectedRole) {
      errors.role = "The role field is required.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleCancel = () => {
    setFormData({
      userName: "",
      relation: "",
      email: "",
      mobile: "",
      budget: "",
      image: null,
      selectedRole: roles[0]?.role_name || "",
    });
    setValidationErrors({});
    setTouched({});
    router.push("/dashboard");
  };

  const closePopup = () => {
    setShowPopup(false);
    if (popupType === "success") {
      router.push("/dashboard");
    }
  };

  const handleInvite = async () => {
    setTouched({
      user_name: true,
      relation: true,
      email: true,
      mobile: true,
      role: true,
    });

    if (!validateForm()) {
      setPopupMessage("Please fill in all required fields correctly.");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    try {
      setLoading(true);

      const payload: InvitePayload = {
        user_name: formData.userName,
        relation: formData.relation,
        email: formData.email,
        role: formData.selectedRole,
        mobile: formData.mobile,
        monthly_budget_limit: formData.budget ? parseFloat(formData.budget) : undefined,
        profile_picture: "https://ems.digitsoftsol.co/uploads/website-images/ibrahim-khalil-2022-01-30-02-48-50-5743.jpg",
      };

      const res: { message: string } = await inviteMember(payload);

      setPopupMessage(res.message || "Member invited successfully!");
      setPopupType("success");
      setShowPopup(true);

      setFormData({
        userName: "",
        relation: "",
        email: "",
        mobile: "",
        budget: "",
        image: null,
        selectedRole: roles[0]?.role_name || "",
      });
      setValidationErrors({});
      setTouched({});
    } catch (err: unknown) {
      const validationErrors: ValidationErrors = {};
      let popupMessage = "Invite failed. Please try again.";
      
      if (typeof err === 'object' && err !== null && 'errors' in err) {
        const apiErrors = (err as { errors: Record<string, string[]> }).errors;
        
        if (apiErrors.email) validationErrors.email = apiErrors.email[0];
        if (apiErrors.mobile) validationErrors.mobile = apiErrors.mobile[0];
        if (apiErrors.user_name) validationErrors.user_name = apiErrors.user_name[0];
        if (apiErrors.relation) validationErrors.relation = apiErrors.relation[0];
        if (apiErrors.role) validationErrors.role = apiErrors.role[0];
        
        const firstErrorKey = Object.keys(apiErrors)[0];
        if (firstErrorKey && apiErrors[firstErrorKey]?.[0]) {
          popupMessage = apiErrors[firstErrorKey][0];
        }
      }
      
      setValidationErrors(validationErrors);
      setPopupMessage(popupMessage);
      setPopupType("error");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    roles,
    openRole,
    validationErrors,
    touched,
    showPopup,
    popupMessage,
    popupType,
    loading,
    setOpenRole,
    handleInputChange,
    handleMobileChange,
    handleImageUpload,
    handleBlur,
    handleCancel,
    closePopup,
    handleInvite,
  };
};