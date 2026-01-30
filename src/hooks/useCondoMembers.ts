import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CondoMember {
  id: string;
  user_id: string | null;
  member_id: string | null;
  role: "admin" | "syndic" | "resident" | "collaborator";
  unit: string | null;
  is_approved: boolean;
  created_at: string;
  // Profile data (for authenticated users)
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  // Condo member data (for manually added members)
  condo_member: {
    id: string;
    full_name: string;
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
          member_id,
          role,
          unit,
          is_approved,
          created_at,
          profiles:user_id (
            id,
            full_name,
            email,
            phone
          ),
          condo_members:member_id (
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
        member_id: item.member_id,
        role: item.role,
        unit: item.unit,
        is_approved: item.is_approved,
        created_at: item.created_at,
        profile: item.profiles,
        condo_member: item.condo_members,
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
      // Call edge function to create member (bypasses RLS safely)
      const { data, error } = await supabase.functions.invoke('create-member', {
        body: {
          condominiumId: condoId,
          fullName: memberData.fullName,
          phone: memberData.phone,
          email: memberData.email,
          unit: memberData.unit,
          role: memberData.role,
        }
      });

      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      await fetchMembers();
      return { success: true };
    } catch (err: any) {
      console.error("Error creating member:", err);
      return { success: false, error: err.message };
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      // First get the role to check if it has a member_id (condo_member)
      const roleToDelete = members.find(m => m.id === memberId);
      
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      
      // If this was a condo_member (not a profile), also delete the condo_member record
      if (roleToDelete?.member_id) {
        await supabase
          .from("condo_members")
          .delete()
          .eq("id", roleToDelete.member_id);
      }
      
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

  const importMembers = async (
    membersData: Array<{
      fullName: string;
      phone: string;
      email: string;
      unit: string;
      role: "admin" | "syndic" | "resident" | "collaborator";
    }>
  ): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;

    for (const memberData of membersData) {
      const result = await createMember(memberData);
      if (result.success) {
        success++;
      } else {
        failed++;
      }
    }

    await fetchMembers();
    return { success, failed };
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
    importMembers,
  };
}

// Helper function to get display name from a member (works for both profile and condo_member)
export function getMemberDisplayName(member: CondoMember): string {
  if (member.profile?.full_name) return member.profile.full_name;
  if (member.condo_member?.full_name) return member.condo_member.full_name;
  return "—";
}

// Helper function to get email from a member
export function getMemberEmail(member: CondoMember): string | null {
  if (member.profile?.email) return member.profile.email;
  if (member.condo_member?.email) return member.condo_member.email;
  return null;
}

// Helper function to get phone from a member
export function getMemberPhone(member: CondoMember): string | null {
  if (member.profile?.phone) return member.profile.phone;
  if (member.condo_member?.phone) return member.condo_member.phone;
  return null;
}
