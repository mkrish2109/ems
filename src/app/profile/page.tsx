'use client';

import PageHeader from "@/components/ui/PageHeader";
import PageLoader from "@/components/ui/PageLoader";
import ErrorState from "@/components/ui/ErrorState";
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import ProfileHeader from './components/ProfileHeader';
import ProfileSection from './components/ProfileSection';
import LogoutButton from './components/LogoutButton';
import { ProfileSectionType } from '@/types/profile';

// Import icons
import profile_user from "../../../public/assets/Icon/profile_user.svg";
import notification from "../../../public/assets/Icon/notification.svg";
import lock from "../../../public/assets/Icon/lock.svg";
import terms from "../../../public/assets/Icon/terms.svg";
import help from "../../../public/assets/Icon/help.svg";

export default function Profile() {
  const { profile, loading, error, refetch } = useProfile();
  const { handleLogout } = useAuth();

  // Profile sections data
  const accountSection: ProfileSectionType = {
    title: "Account",
    items: [
      {
        icon: profile_user,
        alt: "profile_user",
        label: "Edit profile",
        path: "/edit-profile"
      },
      {
        icon: lock,
        alt: "lock",
        label: "Change Password",
        path: "/change-password"
      }
    ]
  };

  const applicationSection: ProfileSectionType = {
    title: "Application",
    items: [
      {
        icon: notification,
        alt: "notification",
        label: "Privacy Policy",
        path: "/privacy-policy"
      },
      {
        icon: terms,
        alt: "terms",
        label: "Terms of Service",
        path: "/terms-and-conditions"
      }
    ]
  };

  const supportSection: ProfileSectionType = {
    title: "Support",
    items: [
      {
        icon: help,
        alt: "help",
        label: "Help Center",
        path: "/help-center"
      }
    ]
  };

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg">
        <PageHeader title="Profile" />
        
        <ProfileHeader profile={profile} />
        
        <ProfileSection 
          title={accountSection.title} 
          items={accountSection.items} 
        />
        
        <ProfileSection 
          title={applicationSection.title} 
          items={applicationSection.items} 
        />
        
        <ProfileSection 
          title={supportSection.title} 
          items={supportSection.items} 
        />
        
        <LogoutButton onLogout={handleLogout} />
      </div>
    </div>
  );
}