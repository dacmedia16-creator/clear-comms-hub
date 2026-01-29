import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  is_super_admin?: boolean;
}

export function useAllUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch super admin list
      const { data: superAdmins, error: saError } = await supabase
        .from("super_admins")
        .select("user_id");

      if (saError) {
        // If we can't access super_admins (not a super admin), just show profiles
        console.warn("Could not fetch super admins list");
        setUsers(profiles || []);
      } else {
        const superAdminIds = new Set(superAdmins?.map(sa => sa.user_id) || []);
        const usersWithSA = (profiles || []).map(profile => ({
          ...profile,
          is_super_admin: superAdminIds.has(profile.id)
        }));
        setUsers(usersWithSA);
      }
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
}
