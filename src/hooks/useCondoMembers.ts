import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CondoMember {
  id: string;
  user_id: string;
  role: "admin" | "syndic" | "resident" | "collaborator";
  unit: string | null;
  is_approved: boolean;
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
          unit,
          is_approved,
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
        unit: item.unit,
        is_approved: item.is_approved,
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

  const addMember = async (
    userId: string,
    role: "admin" | "syndic" | "resident" | "collaborator",
    unit?: string
  ) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          condominium_id: condoId,
          user_id: userId,
          role,
          unit: unit || null,
        });

      if (error) throw error;
      await fetchMembers();
      return { success: true };
    } catch (err: any) {
      console.error("Error adding member:", err);
      return { success: false, error: err.message };
    }
  };

  const createMember = async (memberData: {
    fullName: string;
    phone: string;
    email: string;
    unit: string;
    role: "admin" | "syndic" | "resident" | "collaborator";
  }) => {
    try {
      // 1. Create profile without auth user (using a placeholder user_id)
      // We use gen_random_uuid() pattern for profiles without login
      const placeholderUserId = crypto.randomUUID();
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: placeholderUserId,
          full_name: memberData.fullName,
          email: memberData.email,
          phone: memberData.phone,
        })
        .select("id")
        .single();

      if (profileError) throw profileError;

      // 2. Create user_role linking profile to condominium
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          condominium_id: condoId,
          user_id: profileData.id,
          role: memberData.role,
          unit: memberData.unit,
        });

      if (roleError) throw roleError;

      await fetchMembers();
      return { success: true };
    } catch (err: any) {
      console.error("Error creating member:", err);
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

  const approveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ is_approved: true })
        .eq("id", memberId);

      if (error) throw error;
      await fetchMembers();
      return { success: true };
    } catch (err: any) {
      console.error("Error approving member:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
    addMember,
    createMember,
    removeMember,
    approveMember,
  };
}
