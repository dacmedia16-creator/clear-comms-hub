import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
}

interface Condominium {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  plan: "free" | "starter" | "pro";
  owner_id: string;
}

interface CondominiumWithRole extends Condominium {
  userRole?: "admin" | "syndic" | "resident" | "collaborator" | "owner";
  isApproved?: boolean;
}

interface PendingRole {
  condominiumId: string;
  condominiumName: string;
  role: "admin" | "syndic" | "resident" | "collaborator";
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [condominiums, setCondominiums] = useState<CondominiumWithRole[]>([]);
  const [pendingRoles, setPendingRoles] = useState<PendingRole[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    if (!user) {
      setProfile(null);
      setCondominiums([]);
      setPendingRoles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      if (profileData) {
        // Fetch condominiums owned by this user
        const { data: ownedCondos, error: ownedError } = await supabase
          .from("condominiums")
          .select("*")
          .eq("owner_id", profileData.id);

        if (ownedError) throw ownedError;

        // Fetch condominiums where user has a role (including is_approved)
        const { data: roleCondos, error: roleError } = await supabase
          .from("user_roles")
          .select(`
            role,
            is_approved,
            condominiums (*)
          `)
          .eq("user_id", profileData.id);

        if (roleError) throw roleError;

        // Separate approved from pending roles
        const approvedRoles: CondominiumWithRole[] = [];
        const pending: PendingRole[] = [];

        (roleCondos || []).forEach((r: any) => {
          if (!r.condominiums) return;
          
          if (r.is_approved === false) {
            pending.push({
              condominiumId: r.condominiums.id,
              condominiumName: r.condominiums.name,
              role: r.role,
            });
          } else {
            approvedRoles.push({
              ...r.condominiums,
              userRole: r.role,
              isApproved: true,
            });
          }
        });

        setPendingRoles(pending);

        // Combine results without duplicates (only approved roles)
        const ownedWithRole: CondominiumWithRole[] = (ownedCondos || []).map((c) => ({
          ...c,
          userRole: "owner" as const,
          isApproved: true,
        }));

        // Merge, prioritizing owned condos
        const ownedIds = new Set(ownedWithRole.map((c) => c.id));
        const merged = [
          ...ownedWithRole,
          ...approvedRoles.filter((c) => !ownedIds.has(c.id)),
        ];

        setCondominiums(merged);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [user]);

  return { profile, condominiums, pendingRoles, loading, refetch };
}
