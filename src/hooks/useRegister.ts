import { useState, useCallback } from 'react';
import { RegisterFormData, FormErrors, RegisterPayload, Role } from '@/types/auth';
import { registerUser, validateInvitation } from '@/lib/api';

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isDataPrefilled, setIsDataPrefilled] = useState(false);

  const validateForm = useCallback((formData: RegisterFormData): boolean => {
    const newErrors: FormErrors = {};
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
  }, []);

  const handleRegister = useCallback(async (
    formData: RegisterFormData, 
    roles: Role[], 
    token?: string | null
  ) => {
    if (!validateForm(formData)) return;

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

      const response = await registerUser(payload);

      setSuccessMessage(
        response.message || "Registration successful! Please verify your email."
      );

      return response;
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null) {
        const apiErrors: FormErrors = {};
        for (const key in err as Record<string, unknown>) {
          const value = (err as Record<string, unknown>)[key];
          if (Array.isArray(value)) apiErrors[key] = value[0] as string;
        }
        setErrors(apiErrors);
      } else {
        setErrors({ api: "Registration failed. Please try again." });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [validateForm]);

  const validateInvitationToken = useCallback(async (token: string) => {
    try {
      setLoading(true);
      const response = await validateInvitation(token);
      const invitation = response.invitation;

      const prefilledData: RegisterFormData = {
        user_name: invitation.user_name || "",
        email: invitation.email || "",
        phone: invitation.mobile ? invitation.mobile.replace("+", "") : "",
        password: "",
        role: "Family Member",
      };

      setIsDataPrefilled(true);
      setErrors({});
      return prefilledData;
    } catch (err: unknown) {
      const errorMessage = typeof err === "object" && err !== null && "message" in err
        ? (err as { message?: string }).message ||
          "Invalid or expired invitation. Please register manually or contact support."
        : "Invalid or expired invitation. Please register manually or contact support.";
      
      setErrors({ api: errorMessage });
      setIsDataPrefilled(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    errors,
    successMessage,
    isDataPrefilled,
    setErrors,
    setSuccessMessage,
    handleRegister,
    validateInvitationToken,
  };
};