'use client';

import { Suspense, useState, useEffect} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RegisterFormData } from '@/types/auth';
import { useRoles } from '@/hooks/useRoles';
import { useRegister } from '@/hooks/useRegister';
import PageLoader from "@/components/ui/PageLoader";
import RegisterHeader from './components/RegisterHeader';
import RegisterForm from './components/RegisterForm';

function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    user_name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });
  
  const [token, setToken] = useState<string | null>(null);
  const [isInvitationFlow, setIsInvitationFlow] = useState(false);
  const [hasValidatedToken, setHasValidatedToken] = useState(false);

  const { roles, loading: rolesLoading } = useRoles();
  const { 
    loading, 
    errors, 
    successMessage, 
    isDataPrefilled,
    handleRegister, 
    validateInvitationToken 
  } = useRegister();

  // Redirect logged-in users & get token
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole) {
      if (userRole === "Family Head") router.push("/dashboard/family-head");
      else if (userRole === "Family Member") router.push("/dashboard/family-member");
      else if (userRole === "solo user") router.push("/dashboard/family-member");
      else router.push("/dashboard");
    }
    
    const tokenFromUrl = searchParams.get("token");
    setToken(tokenFromUrl);
    if (tokenFromUrl) {
      setIsInvitationFlow(true);
    }
  }, [router, searchParams]);

  // Validate invitation token
  useEffect(() => {
    const validateToken = async () => {
      if (token && !hasValidatedToken) {
        try {
          const prefilledData = await validateInvitationToken(token);
          setFormData(prefilledData);
          setHasValidatedToken(true);
        } catch (err) {
          console.error('Token validation failed:', err);
          setHasValidatedToken(true);
        }
      }
    };

    validateToken();
  }, [token, hasValidatedToken, validateInvitationToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: digitsOnly });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegister(formData, roles, token);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {rolesLoading && <PageLoader />}
      
      <div className="w-full max-w-[390px] min-h-[844px] bg-white shadow-lg">
        <RegisterHeader />
        
        <RegisterForm
          formData={formData}
          onChange={handleChange}
          onPhoneChange={handlePhoneChange}
          onSubmit={handleSubmit}
          roles={roles}
          loading={loading}
          errors={errors}
          successMessage={successMessage}
          isDataPrefilled={isDataPrefilled}
          isInvitationFlow={isInvitationFlow}
          rolesLoading={rolesLoading}
        />
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