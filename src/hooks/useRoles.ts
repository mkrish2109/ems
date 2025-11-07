import { useState, useEffect } from 'react';
import { Role } from '@/types/auth';
import { fetchRoles } from '@/lib/api';

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoading(true);
        const fetchedRoles = await fetchRoles();

        if (Array.isArray(fetchedRoles)) {
          // Handle both string array and Role object array responses
          if (fetchedRoles.every(item => typeof item === 'string')) {
            const mappedRoles: Role[] = fetchedRoles.map((roleName, idx) => ({
              role_id: idx + 1,
              role_name: roleName as string,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));
            setRoles(mappedRoles);
          } else {
            setRoles(fetchedRoles as Role[]);
          }
        }
      } catch (err) {
        setError('Failed to load roles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  return { roles, loading, error };
};