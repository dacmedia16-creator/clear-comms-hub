import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCondoBlocks(condominiumId: string) {
  const [blocks, setBlocks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlocks() {
      if (!condominiumId) {
        setBlocks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("block")
          .eq("condominium_id", condominiumId)
          .eq("is_approved", true)
          .not("block", "is", null);

        if (error) throw error;

        const uniqueBlocks = [...new Set(
          (data || [])
            .map((r) => r.block)
            .filter((b): b is string => Boolean(b))
        )].sort();

        setBlocks(uniqueBlocks);
      } catch (err) {
        console.error("Error fetching blocks:", err);
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBlocks();
  }, [condominiumId]);

  return { blocks, loading };
}
