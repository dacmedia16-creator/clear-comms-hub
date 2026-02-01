import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Plan {
  id: string;
  slug: string;
  name: string;
  price: number;
  announcements_per_month: number;
  max_attachment_size_mb: number;
  features: string[];
  badge_class: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanInput {
  slug: string;
  name: string;
  price: number;
  announcements_per_month: number;
  max_attachment_size_mb: number;
  features: string[];
  badge_class: string;
  is_active?: boolean;
  display_order?: number;
}

export interface UpdatePlanInput extends Partial<CreatePlanInput> {
  id: string;
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("plans")
        .select("*")
        .order("display_order", { ascending: true });

      if (fetchError) throw fetchError;

      // Parse features from JSONB to string[]
      const parsedPlans = (data || []).map((plan) => ({
        ...plan,
        features: Array.isArray(plan.features) 
          ? plan.features 
          : JSON.parse(plan.features as string),
      }));

      setPlans(parsedPlans);
    } catch (err: any) {
      console.error("Error fetching plans:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlan = async (input: CreatePlanInput): Promise<Plan | null> => {
    try {
      const { data, error } = await supabase
        .from("plans")
        .insert({
          slug: input.slug,
          name: input.name,
          price: input.price,
          announcements_per_month: input.announcements_per_month,
          max_attachment_size_mb: input.max_attachment_size_mb,
          features: input.features,
          badge_class: input.badge_class,
          is_active: input.is_active ?? true,
          display_order: input.display_order ?? plans.length + 1,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Plano criado",
        description: `O plano "${input.name}" foi criado com sucesso.`,
      });

      await fetchPlans();
      return {
        ...data,
        features: Array.isArray(data.features) 
          ? data.features 
          : JSON.parse(data.features as string),
      } as Plan;
    } catch (err: any) {
      console.error("Error creating plan:", err);
      toast({
        title: "Erro ao criar plano",
        description: err.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePlan = async (input: UpdatePlanInput): Promise<Plan | null> => {
    try {
      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from("plans")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Plano atualizado",
        description: `O plano foi atualizado com sucesso.`,
      });

      await fetchPlans();
      return {
        ...data,
        features: Array.isArray(data.features) 
          ? data.features 
          : JSON.parse(data.features as string),
      } as Plan;
    } catch (err: any) {
      console.error("Error updating plan:", err);
      toast({
        title: "Erro ao atualizar plano",
        description: err.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deletePlan = async (planSlug: string): Promise<boolean> => {
    try {
      // Check if any condominiums are using this plan
      const { count, error: countError } = await supabase
        .from("condominiums")
        .select("*", { count: "exact", head: true })
        .eq("plan", planSlug);

      if (countError) throw countError;

      if (count && count > 0) {
        toast({
          title: "Não é possível excluir",
          description: `${count} condomínio(s) estão usando este plano. Migre-os para outro plano antes de excluir.`,
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from("plans")
        .delete()
        .eq("slug", planSlug);

      if (error) throw error;

      toast({
        title: "Plano excluído",
        description: `O plano foi excluído com sucesso.`,
      });

      await fetchPlans();
      return true;
    } catch (err: any) {
      console.error("Error deleting plan:", err);
      toast({
        title: "Erro ao excluir plano",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const getCondominiumsCount = async (planSlug: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from("condominiums")
        .select("*", { count: "exact", head: true })
        .eq("plan", planSlug);

      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error("Error getting condominiums count:", err);
      return 0;
    }
  };

  const getPlanBySlug = (slug: string): Plan | undefined => {
    return plans.find((p) => p.slug === slug);
  };

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    getCondominiumsCount,
    getPlanBySlug,
  };
}
