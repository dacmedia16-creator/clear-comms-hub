import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AnnouncementWithCondo {
  id: string;
  title: string;
  summary: string | null;
  category: string;
  is_urgent: boolean;
  is_pinned: boolean;
  published_at: string;
  created_at: string;
  condominium: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface CondoAnnouncementCount {
  condoId: string;
  condoName: string;
  condoSlug: string;
  count: number;
  latestAnnouncement: AnnouncementWithCondo | null;
}

export function useAllAnnouncements() {
  const [announcements, setAnnouncements] = useState<AnnouncementWithCondo[]>([]);
  const [condoStats, setCondoStats] = useState<CondoAnnouncementCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("announcements")
        .select(`
          id,
          title,
          summary,
          category,
          is_urgent,
          is_pinned,
          published_at,
          created_at,
          condominiums:condominium_id (
            id,
            name,
            slug
          )
        `)
        .order("published_at", { ascending: false });

      if (fetchError) throw fetchError;

      const formattedAnnouncements: AnnouncementWithCondo[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        category: item.category,
        is_urgent: item.is_urgent,
        is_pinned: item.is_pinned,
        published_at: item.published_at,
        created_at: item.created_at,
        condominium: item.condominiums,
      }));

      setAnnouncements(formattedAnnouncements);

      // Calculate stats per condominium
      const statsMap = new Map<string, CondoAnnouncementCount>();
      
      formattedAnnouncements.forEach((announcement) => {
        if (!announcement.condominium) return;
        
        const condoId = announcement.condominium.id;
        
        if (!statsMap.has(condoId)) {
          statsMap.set(condoId, {
            condoId,
            condoName: announcement.condominium.name,
            condoSlug: announcement.condominium.slug,
            count: 0,
            latestAnnouncement: null,
          });
        }
        
        const stat = statsMap.get(condoId)!;
        stat.count += 1;
        
        if (!stat.latestAnnouncement) {
          stat.latestAnnouncement = announcement;
        }
      });

      setCondoStats(Array.from(statsMap.values()).sort((a, b) => b.count - a.count));
    } catch (err: any) {
      console.error("Error fetching announcements:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return {
    announcements,
    condoStats,
    totalAnnouncements: announcements.length,
    loading,
    error,
    refetch: fetchAnnouncements,
  };
}
