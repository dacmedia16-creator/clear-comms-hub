import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CondoMember {
  id: string;
  user_id: string | null;
  member_id: string | null;
  role: "admin" | "syndic" | "resident" | "collaborator";
  block: string | null;
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

export function useCondoMembers(condoId: string, listId?: string | null) {
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
      let query = supabase
        .from("user_roles")
        .select(`
          id,
          user_id,
          member_id,
          role,
          block,
          unit,
          is_approved,
          created_at,
          list_id,
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
        .eq("condominium_id", condoId);

      if (listId) {
        query = query.eq("list_id", listId);
      }

      const { data, error: fetchError } = await query.order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const formattedMembers: CondoMember[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        member_id: item.member_id,
        role: item.role,
        block: item.block,
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
  }, [condoId, listId]);

  const addMember = async (
    userId: string,
    role: "admin" | "syndic" | "resident" | "collaborator",
    block: string,
    unit: string
  ) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          condominium_id: condoId,
          user_id: userId,
          role,
          block: block || null,
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
    block: string;
    unit: string;
    role: "admin" | "syndic" | "resident" | "collaborator";
    listId?: string | null;
  }) => {
    try {
      // Call edge function to create member (bypasses RLS safely)
      const { data, error } = await supabase.functions.invoke('create-member', {
        body: {
          condominiumId: condoId,
          fullName: memberData.fullName,
          phone: memberData.phone,
          email: memberData.email,
          block: memberData.block,
          unit: memberData.unit,
          role: memberData.role,
          listId: memberData.listId || null,
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

  const removeMembersBulk = async (memberIds: string[]): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const condoMemberIds = members
        .filter(m => memberIds.includes(m.id) && m.member_id)
        .map(m => m.member_id as string);

      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .in("id", memberIds);

      if (rolesError) throw rolesError;

      if (condoMemberIds.length > 0) {
        const { error: membersError } = await supabase
          .from("condo_members")
          .delete()
          .in("id", condoMemberIds);

        if (membersError) throw membersError;
      }

      await fetchMembers();
      return { success: true, count: memberIds.length };
    } catch (err: any) {
      console.error("Error bulk removing members:", err);
      return { success: false, count: 0, error: err.message };
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
      block: string;
      unit: string;
      role: "admin" | "syndic" | "resident" | "collaborator";
    }>,
    onChunkProgress?: (processed: number, total: number) => void
  ): Promise<{ success: number; failed: number; skipped: number }> => {
    const CHUNK_SIZE = 500;
    let totalSuccess = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    // Split into chunks of 500
    const chunks: typeof membersData[] = [];
    for (let i = 0; i < membersData.length; i += CHUNK_SIZE) {
      chunks.push(membersData.slice(i, i + CHUNK_SIZE));
    }

    for (let i = 0; i < chunks.length; i++) {
      try {
        const { data, error } = await supabase.functions.invoke('create-members-batch', {
          body: {
            condominiumId: condoId,
            members: chunks[i],
            listId: listId || null,
          }
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        totalSuccess += data?.success || 0;
        totalFailed += data?.failed || 0;
        totalSkipped += data?.skipped || 0;
      } catch (err: any) {
        console.error(`Error importing chunk ${i + 1}:`, err);
        totalFailed += chunks[i].length;
      }

      onChunkProgress?.(i + 1, chunks.length);
    }

    await fetchMembers();
    return { success: totalSuccess, failed: totalFailed, skipped: totalSkipped };
  };

  const updateMember = async (
    roleId: string,
    updates: {
      fullName?: string;
      phone?: string;
      email?: string;
      block: string;
      unit: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const member = members.find(m => m.id === roleId);
      if (!member) {
        return { success: false, error: "Membro não encontrado" };
      }

      // 1. Update user_roles (block, unit) - always allowed for managers
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ block: updates.block, unit: updates.unit })
        .eq("id", roleId);

      if (roleError) throw roleError;

      // 2. If it's a condo_member, also update personal data
      if (member.member_id && (updates.fullName || updates.phone !== undefined || updates.email !== undefined)) {
        const { error: memberError } = await supabase
          .from("condo_members")
          .update({
            full_name: updates.fullName || member.condo_member?.full_name || "",
            phone: updates.phone || null,
            email: updates.email || null,
          })
          .eq("id", member.member_id);

        if (memberError) throw memberError;
      }

      await fetchMembers();
      return { success: true };
    } catch (err: any) {
      console.error("Error updating member:", err);
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
    removeMembersBulk,
    approveMember,
    importMembers,
    updateMember,
  };
}

// Helper function to get display name from a member (works for both profile and condo_member)
export function getMemberDisplayName(member: CondoMember): string {
  if (member.profile?.full_name) return member.profile.full_name;
  if (member.condo_member?.full_name && member.condo_member.full_name !== "Sem nome") return member.condo_member.full_name;
  // Fallback to phone
  const phone = getMemberPhone(member);
  if (phone) return phone;
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

// Helper function to get formatted location (block + unit)
export function getMemberLocation(member: CondoMember): string {
  const parts: string[] = [];
  if (member.block) parts.push(member.block);
  if (member.unit) parts.push(member.unit);
  return parts.length > 0 ? parts.join(", ") : "—";
}
