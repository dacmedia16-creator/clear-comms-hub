import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOrganizationTerms, OrganizationTerms, OrganizationType } from "@/lib/organization-types";

export function useOrganizationTerms(condoId: string | undefined) {
  const [terms, setTerms] = useState<OrganizationTerms>(getOrganizationTerms("condominium"));
  const [organizationType, setOrganizationType] = useState<OrganizationType>("condominium");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchType() {
      if (!condoId) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("condominiums")
          .select("organization_type")
          .eq("id", condoId)
          .maybeSingle();

        if (data?.organization_type) {
          setOrganizationType(data.organization_type as OrganizationType);
          setTerms(getOrganizationTerms(data.organization_type));
        }
      } catch (error) {
        console.error("Error fetching organization type:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchType();
  }, [condoId]);

  return { terms, organizationType, loading };
}
