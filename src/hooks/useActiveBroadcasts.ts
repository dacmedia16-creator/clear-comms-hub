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
      .select("id, announcement_id, condominium_id, total_members, status, updated_at, announcements(title)")
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
