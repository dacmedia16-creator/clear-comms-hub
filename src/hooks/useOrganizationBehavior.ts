import { useMemo } from "react";
import { useOrganizationTerms } from "./useOrganizationTerms";
import { 
  getOrganizationBehavior, 
  getLocationPlaceholders,
  OrganizationBehavior,
  OrganizationTerms,
  OrganizationType 
} from "@/lib/organization-types";

export interface OrganizationBehaviorResult {
  terms: OrganizationTerms;
  behavior: OrganizationBehavior;
  placeholders: { block: string; unit: string };
  organizationType: OrganizationType;
  loading: boolean;
}

/**
 * Hook que retorna termos, comportamento e placeholders para uma organização.
 * Combina useOrganizationTerms com configurações de comportamento.
 */
export function useOrganizationBehavior(condoId: string | undefined): OrganizationBehaviorResult {
  const { terms, organizationType, loading } = useOrganizationTerms(condoId);

  const behavior = useMemo(() => {
    return getOrganizationBehavior(organizationType);
  }, [organizationType]);

  const placeholders = useMemo(() => {
    return getLocationPlaceholders(organizationType);
  }, [organizationType]);

  return { 
    terms, 
    behavior, 
    placeholders,
    organizationType, 
    loading 
  };
}
