import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { UserProfile } from '@/types/profile';
import { ProfileService } from '@/lib/api/profile';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProfileService.getProfile();
      setProfile(response.data);
      
      Cookies.set('userId', response.data.user_id.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
};