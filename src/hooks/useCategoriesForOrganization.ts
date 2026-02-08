import { useMemo } from "react";
import { getCategoriesForOrganization, CategoryConfig } from "@/lib/category-config";
import { OrganizationType } from "@/lib/organization-types";

/**
 * Hook que retorna as categorias disponíveis para um tipo de organização.
 * Memoizado para evitar recálculos desnecessários.
 */
export function useCategoriesForOrganization(
  organizationType?: OrganizationType | string | null
): CategoryConfig[] {
  return useMemo(() => {
    return getCategoriesForOrganization(organizationType);
  }, [organizationType]);
}
