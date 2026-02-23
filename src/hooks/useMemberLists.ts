import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MemberList {
  id: string;
  condominium_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function useMemberLists(condoId: string | undefined) {
  const [lists, setLists] = useState<MemberList[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = async () => {
    if (!condoId) {
      setLists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("member_lists")
        .select("*")
        .eq("condominium_id", condoId)
        .order("name");

      if (error) throw error;
      setLists((data as MemberList[]) || []);
    } catch (err) {
      console.error("Error fetching member lists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, [condoId]);

  const createList = async (name: string, description?: string): Promise<{ success: boolean; error?: string; list?: MemberList }> => {
    if (!condoId) return { success: false, error: "Sem organização" };

    try {
      const { data, error } = await supabase
        .from("member_lists")
        .insert({ condominium_id: condoId, name, description: description || null })
        .select()
        .single();

      if (error) throw error;
      await fetchLists();
      return { success: true, list: data as MemberList };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateList = async (listId: string, name: string, description?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from("member_lists")
        .update({ name, description: description || null })
        .eq("id", listId);

      if (error) throw error;
      await fetchLists();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteList = async (listId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // First unlink all members from this list
      await supabase
        .from("user_roles")
        .update({ list_id: null })
        .eq("list_id", listId);

      const { error } = await supabase
        .from("member_lists")
        .delete()
        .eq("id", listId);

      if (error) throw error;
      await fetchLists();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const moveMemberToList = async (roleId: string, listId: string | null): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ list_id: listId })
        .eq("id", roleId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { lists, loading, refetch: fetchLists, createList, updateList, deleteList, moveMemberToList };
}
