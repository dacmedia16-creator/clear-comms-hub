import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CondoMember {
  id: string;
  user_id: string;
  role: "admin" | "syndic" | "resident" | "collaborator";
  created_at: string;
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

export function useCondoMembers(condoId: string) {
  const [members, setMembers] = useState<CondoMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    if (!condoId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("user_roles")
        .select(`
          id,
          user_id,
          role,
          created_at,
          profiles:user_id (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq("condominium_id", condoId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const formattedMembers: CondoMember[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        role: item.role,
        created_at: item.created_at,
        profile: item.profiles,
      }));

      setMembers(formattedMembers);
    } catch (err: any) {
      console.error("Error fetching condo members:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [condoId]);

  const addMember = async (userId: string, role: "admin" | "syndic" | "resident" | "collaborator") => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          condominium_id: condoId,
          user_id: userId,
          role,
        });

      if (error) throw error;
      await fetchMembers();
      return { success: true };
    } catch (err: any) {
      console.error("Error adding member:", err);
      return { success: false, error: err.message };
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      await fetchMembers();
      return { success: true };
    } catch (err: any) {
      console.error("Error removing member:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
    addMember,
    removeMember,
  };
}
