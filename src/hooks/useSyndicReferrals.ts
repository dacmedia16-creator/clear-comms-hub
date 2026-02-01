import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SyndicReferral {
  id: string;
  syndic_name: string;
  syndic_phone: string;
  syndic_email: string;
  condominium_name: string;
  referrer_name: string | null;
  status: string | null;
  notes: string | null;
  whatsapp_sent: boolean | null;
  email_sent: boolean | null;
  created_at: string | null;
}

export function useSyndicReferrals() {
  const [referrals, setReferrals] = useState<SyndicReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("syndic_referrals")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setReferrals(data || []);
    } catch (err) {
      console.error("Error fetching referrals:", err);
      setError("Erro ao carregar indicações");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const updateStatus = async (id: string, status: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("syndic_referrals")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setReferrals((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      return true;
    } catch (err) {
      console.error("Error updating status:", err);
      return false;
    }
  };

  const updateNotes = async (id: string, notes: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("syndic_referrals")
        .update({ notes })
        .eq("id", id);

      if (error) throw error;

      setReferrals((prev) =>
        prev.map((r) => (r.id === id ? { ...r, notes } : r))
      );
      return true;
    } catch (err) {
      console.error("Error updating notes:", err);
      return false;
    }
  };

  const deleteReferral = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("syndic_referrals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setReferrals((prev) => prev.filter((r) => r.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting referral:", err);
      return false;
    }
  };

  const resendNotification = async (
    id: string,
    channel: "whatsapp" | "email" | "both"
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke("resend-referral", {
        body: { referralId: id, channel },
      });

      if (error) throw error;

      // Background processing - refresh after 5 seconds to get updated status
      if (data?.success && data?.processing) {
        setTimeout(() => {
          fetchReferrals();
        }, 5000);
      }

      return { success: true, message: data?.message || "Reenvio iniciado!" };
    } catch (err) {
      console.error("Error resending notification:", err);
      return { success: false, message: "Erro ao reenviar notificação" };
    }
  };

  // Computed stats
  const stats = {
    total: referrals.length,
    pending: referrals.filter((r) => r.status === "pending" || !r.status).length,
    contacted: referrals.filter((r) => r.status === "contacted").length,
    converted: referrals.filter((r) => r.status === "converted").length,
    rejected: referrals.filter((r) => r.status === "rejected").length,
    failedWhatsApp: referrals.filter((r) => r.whatsapp_sent === false).length,
    failedEmail: referrals.filter((r) => r.email_sent === false).length,
  };

  return {
    referrals,
    loading,
    error,
    stats,
    refetch: fetchReferrals,
    updateStatus,
    updateNotes,
    deleteReferral,
    resendNotification,
  };
}
