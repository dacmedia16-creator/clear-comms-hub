import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ApiToken {
  id: string;
  condominium_id: string;
  name: string;
  token_prefix: string;
  permissions: string[];
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export const AVAILABLE_PERMISSIONS = [
  { value: "read:announcements", label: "Ler avisos" },
  { value: "write:announcements", label: "Criar/editar avisos" },
  { value: "read:members", label: "Ler membros" },
  { value: "write:members", label: "Adicionar/editar membros" },
] as const;

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "avp_";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function useApiTokens(condominiumId: string | undefined) {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTokens = useCallback(async () => {
    if (!condominiumId) return;

    try {
      const { data, error } = await supabase
        .from("api_tokens")
        .select("*")
        .eq("condominium_id", condominiumId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTokens((data as ApiToken[]) || []);
    } catch (error: unknown) {
      console.error("Error fetching API tokens:", error);
      toast({
        title: "Erro ao carregar tokens",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [condominiumId, toast]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const createToken = async (data: {
    name: string;
    permissions: string[];
    expiresAt?: Date | null;
  }): Promise<{ token: ApiToken; plainToken: string } | null> => {
    if (!condominiumId) return null;

    try {
      const plainToken = generateToken();
      const tokenHash = await hashToken(plainToken);
      const tokenPrefix = plainToken.substring(0, 8) + "...";

      const { data: newToken, error } = await supabase
        .from("api_tokens")
        .insert({
          condominium_id: condominiumId,
          name: data.name,
          token_hash: tokenHash,
          token_prefix: tokenPrefix,
          permissions: data.permissions,
          expires_at: data.expiresAt?.toISOString() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setTokens((prev) => [newToken as ApiToken, ...prev]);
      
      toast({
        title: "Token criado",
        description: "Copie o token agora - ele não será mostrado novamente!",
      });

      return { token: newToken as ApiToken, plainToken };
    } catch (error: unknown) {
      console.error("Error creating API token:", error);
      toast({
        title: "Erro ao criar token",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateToken = async (
    tokenId: string,
    data: Partial<Pick<ApiToken, "name" | "permissions" | "is_active">>
  ) => {
    try {
      const { error } = await supabase
        .from("api_tokens")
        .update(data)
        .eq("id", tokenId);

      if (error) throw error;

      setTokens((prev) =>
        prev.map((t) => (t.id === tokenId ? { ...t, ...data } : t))
      );

      toast({
        title: "Token atualizado",
        description: "As alterações foram salvas.",
      });

      return true;
    } catch (error: unknown) {
      console.error("Error updating API token:", error);
      toast({
        title: "Erro ao atualizar token",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteToken = async (tokenId: string) => {
    try {
      const { error } = await supabase
        .from("api_tokens")
        .delete()
        .eq("id", tokenId);

      if (error) throw error;

      setTokens((prev) => prev.filter((t) => t.id !== tokenId));
      toast({
        title: "Token revogado",
        description: "O token foi desativado permanentemente.",
      });

      return true;
    } catch (error: unknown) {
      console.error("Error deleting API token:", error);
      toast({
        title: "Erro ao revogar token",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleToken = async (tokenId: string, isActive: boolean) => {
    return updateToken(tokenId, { is_active: isActive });
  };

  return {
    tokens,
    loading,
    createToken,
    updateToken,
    deleteToken,
    toggleToken,
    refetch: fetchTokens,
  };
}
