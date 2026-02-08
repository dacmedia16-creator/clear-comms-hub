import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OrganizationType, OrganizationTerms, getOrganizationTerms, getOrganizationIcon } from "@/lib/organization-types";
import { LucideIcon } from "lucide-react";

export interface OrganizationFromCode {
  id: string;
  name: string;
  type: OrganizationType;
  terms: OrganizationTerms;
  icon: LucideIcon;
}

interface UseOrganizationFromCodeReturn {
  validating: boolean;
  organization: OrganizationFromCode | null;
  error: string | null;
}

export function useOrganizationFromCode(code: string): UseOrganizationFromCodeReturn {
  const [validating, setValidating] = useState(false);
  const [organization, setOrganization] = useState<OrganizationFromCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedCode = code.trim().toLowerCase();

    if (!trimmedCode) {
      setOrganization(null);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setValidating(true);
      setError(null);

      // Check if it's a numeric code or a slug
      const isNumeric = /^\d+$/.test(trimmedCode);

      let query = supabase
        .from("condominiums")
        .select("id, name, organization_type");

      if (isNumeric) {
        query = query.eq("code", parseInt(trimmedCode, 10));
      } else {
        query = query.eq("slug", trimmedCode);
      }

      const { data, error: queryError } = await query.single();

      setValidating(false);

      if (queryError || !data) {
        setOrganization(null);
        setError("Código não encontrado");
      } else {
        const orgType = (data.organization_type as OrganizationType) || "condominium";
        setOrganization({
          id: data.id,
          name: data.name,
          type: orgType,
          terms: getOrganizationTerms(orgType),
          icon: getOrganizationIcon(orgType),
        });
        setError(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [code]);

  return { validating, organization, error };
}
