import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveBroadcast {
  id: string;
  announcement_id: string;
  condominium_id: string;
  total_members: number;
  status: string;
  updated_at: string | null;
  announcement_title?: string | null;
  sender_id?: string | null;
  sender_name_snapshot?: string | null;
  sender_phone_snapshot?: string | null;
  template_id?: string | null;
  template_label_snapshot?: string | null;
  template_identifier_snapshot?: string | null;
}

export function useActiveBroadcasts(condominiumId: string | null | undefined) {
  const [broadcasts, setBroadcasts] = useState<ActiveBroadcast[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBroadcasts = async () => {
    if (!condominiumId) {
      setBroadcasts([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("whatsapp_broadcasts")
      .select("id, announcement_id, condominium_id, total_members, status, updated_at, sender_id, sender_name_snapshot, sender_phone_snapshot, template_id, template_label_snapshot, template_identifier_snapshot, announcements(title)")
      .eq("condominium_id", condominiumId)
      .in("status", ["processing", "paused"])
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setBroadcasts(
        data.map((b: any) => ({
          id: b.id,
          announcement_id: b.announcement_id,
          condominium_id: b.condominium_id,
          total_members: b.total_members,
          status: b.status,
          updated_at: b.updated_at,
          announcement_title: b.announcements?.title ?? null,
          sender_id: b.sender_id ?? null,
          sender_name_snapshot: b.sender_name_snapshot ?? null,
          sender_phone_snapshot: b.sender_phone_snapshot ?? null,
          template_id: b.template_id ?? null,
          template_label_snapshot: b.template_label_snapshot ?? null,
          template_identifier_snapshot: b.template_identifier_snapshot ?? null,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBroadcasts();
    if (!condominiumId) return;

    const channel = supabase
      .channel(`active-broadcasts-${condominiumId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "whatsapp_broadcasts",
          filter: `condominium_id=eq.${condominiumId}`,
        },
        () => fetchBroadcasts()
      )
      .subscribe();

    // Polling fallback
    const interval = setInterval(fetchBroadcasts, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condominiumId]);

  const finalize = async (broadcastId: string) => {
    await supabase
      .from("whatsapp_broadcasts")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", broadcastId);
    await fetchBroadcasts();
  };

  return { broadcasts, loading, refetch: fetchBroadcasts, finalize };
}
