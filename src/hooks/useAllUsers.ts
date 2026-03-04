import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserRole {
  id: string;
  role: "admin" | "syndic" | "resident" | "collaborator";
  condominium_name: string;
  condominium_id: string;
  is_approved: boolean;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  is_super_admin?: boolean;
  roles?: UserRole[];
}

export function useAllUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all profiles (paginated)
      const allProfiles: any[] = [];
      let profileOffset = 0;
      const batchSize = 1000;
      let hasMoreProfiles = true;
      while (hasMoreProfiles) {
        const { data, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .range(profileOffset, profileOffset + batchSize - 1);
        if (profilesError) throw profilesError;
        allProfiles.push(...(data || []));
        hasMoreProfiles = (data?.length || 0) === batchSize;
        profileOffset += batchSize;
      }

      // Fetch super admin list
      const { data: superAdmins, error: saError } = await supabase
        .from("super_admins")
        .select("user_id");

      // Fetch user roles with condominium names (paginated)
      const allUserRoles: any[] = [];
      let rolesOffset = 0;
      let hasMoreRoles = true;
      while (hasMoreRoles) {
        const { data, error: rolesError } = await supabase
          .from("user_roles")
          .select(`
            id,
            user_id,
            role,
            condominium_id,
            is_approved,
            condominiums (name)
          `)
          .range(rolesOffset, rolesOffset + batchSize - 1);
        if (rolesError) throw rolesError;
        allUserRoles.push(...(data || []));
        hasMoreRoles = (data?.length || 0) === batchSize;
        rolesOffset += batchSize;
      }

      const superAdminIds = new Set(superAdmins?.map(sa => sa.user_id) || []);
      
      // Group roles by user_id
      const rolesByUser: Record<string, UserRole[]> = {};
      if (!rolesError && userRoles) {
        for (const ur of userRoles) {
          if (!rolesByUser[ur.user_id]) {
          rolesByUser[ur.user_id] = [];
          }
          rolesByUser[ur.user_id].push({
            id: ur.id,
            role: ur.role as UserRole["role"],
            condominium_id: ur.condominium_id,
            condominium_name: (ur.condominiums as any)?.name || "—",
            is_approved: ur.is_approved ?? true,
          });
        }
      }

      const usersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        is_super_admin: superAdminIds.has(profile.id),
        roles: rolesByUser[profile.id] || [],
      }));

      setUsers(usersWithRoles);
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
