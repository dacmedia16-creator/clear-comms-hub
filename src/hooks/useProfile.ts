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

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
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

        // Fetch condominiums owned by this user
        if (profileData) {
          const { data: condoData, error: condoError } = await supabase
            .from("condominiums")
            .select("*")
            .eq("owner_id", profileData.id);

          if (condoError) throw condoError;
          setCondominiums(condoData || []);
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
