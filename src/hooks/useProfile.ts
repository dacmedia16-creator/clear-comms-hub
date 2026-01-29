import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
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
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [condominiums, setCondominiums] = useState<CondominiumWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        setCondominiums([]);
        setLoading(false);
        return;
      }

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

          // Fetch condominiums where user has a role
          const { data: roleCondos, error: roleError } = await supabase
            .from("user_roles")
            .select(`
              role,
              condominiums (*)
            `)
            .eq("user_id", profileData.id);

          if (roleError) throw roleError;

          // Combine results without duplicates
          const ownedWithRole: CondominiumWithRole[] = (ownedCondos || []).map((c) => ({
            ...c,
            userRole: "owner" as const,
          }));

          const roleWithRole: CondominiumWithRole[] = (roleCondos || [])
            .filter((r: any) => r.condominiums)
            .map((r: any) => ({
              ...r.condominiums,
              userRole: r.role,
            }));

          // Merge, prioritizing owned condos
          const ownedIds = new Set(ownedWithRole.map((c) => c.id));
          const merged = [
            ...ownedWithRole,
            ...roleWithRole.filter((c) => !ownedIds.has(c.id)),
          ];

          setCondominiums(merged);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  return { profile, condominiums, loading, refetch: () => setLoading(true) };
}
