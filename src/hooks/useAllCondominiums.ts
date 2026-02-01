import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Condominium {
  id: string;
  name: string;
  slug: string;
  code: number;
  description: string | null;
  logo_url: string | null;
  plan: string;
  owner_id: string;
  created_at: string;
  trial_ends_at: string | null;
  owner?: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
}

export function useAllCondominiums() {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCondominiums = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from("condominiums")
        .select(`
          *,
          owner:profiles!condominiums_owner_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setCondominiums(data || []);
    } catch (err: any) {
      console.error("Error fetching condominiums:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCondominiums();
  }, []);

  return { condominiums, loading, error, refetch: fetchCondominiums };
}
