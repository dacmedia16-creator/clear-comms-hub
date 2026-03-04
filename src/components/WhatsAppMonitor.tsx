import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X, CheckCircle, XCircle, Clock, MessageCircle, Pause, Play } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface WhatsAppLog {
  id: string;
  recipient_phone: string;
  recipient_name: string | null;
  status: string;
  error_message: string | null;
  sent_at: string | null;
}

interface WhatsAppMonitorProps {
  announcementId: string;
  condominiumId: string;
  totalExpected?: number;
  broadcastId?: string | null;
  onClose: () => void;
}

export function WhatsAppMonitor({
  announcementId,
  condominiumId,
  totalExpected,
  broadcastId,
  onClose,
}: WhatsAppMonitorProps) {
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
  const [togglingPause, setTogglingPause] = useState(false);
  const [lastLogTime, setLastLogTime] = useState<number>(Date.now());
  const [isStalled, setIsStalled] = useState(false);

  const isPaused = broadcastStatus === 'paused';
  const isCompleted = broadcastStatus === 'completed';

  // Fetch broadcast status
  useEffect(() => {
    if (!broadcastId) return;

    const fetchStatus = async () => {
      const { data } = await supabase
        .from('whatsapp_broadcasts')
        .select('status')
        .eq('id', broadcastId)
        .single();
      if (data) setBroadcastStatus(data.status);
    };

    fetchStatus();

    // Realtime subscription for broadcast status
    const channel = supabase
      .channel(`broadcast-status-${broadcastId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_broadcasts',
          filter: `id=eq.${broadcastId}`,
        },
        (payload) => {
          const newStatus = (payload.new as any).status;
          setBroadcastStatus(newStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [broadcastId]);

  // Stall detection: no new logs for 60s while processing
  useEffect(() => {
    if (!broadcastId || isPaused || isCompleted) {
      setIsStalled(false);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - lastLogTime) / 1000;
      setIsStalled(broadcastStatus === 'processing' && elapsed > 60 && logs.length > 0);
    }, 5000);

    return () => clearInterval(interval);
  }, [broadcastId, broadcastStatus, isPaused, isCompleted, lastLogTime, logs.length]);

  const handleResume = async () => {
    if (!broadcastId) return;
    setTogglingPause(true);
    try {
      await supabase
        .from('whatsapp_broadcasts')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', broadcastId);

      const { data: ann } = await supabase
        .from('announcements')
        .select('id, title, summary, category, target_blocks, target_units, target_member_ids')
        .eq('id', announcementId)
        .single();

      const { data: condo } = await supabase
        .from('condominiums')
        .select('id, name, slug')
        .eq('id', condominiumId)
        .single();

      if (ann && condo) {
        await supabase.functions.invoke('send-whatsapp', {
          body: {
            announcement: ann,
            condominium: condo,
            baseUrl: window.location.origin,
            existingBroadcastId: broadcastId,
          },
        });
        setIsStalled(false);
        setLastLogTime(Date.now());
        toast({ title: "Envio retomado", description: "O disparo de WhatsApp foi retomado." });
      }
    } catch (err) {
      console.error("Error resuming:", err);
    } finally {
      setTogglingPause(false);
    }
  };

  const handleTogglePause = async () => {
    if (!broadcastId) return;
    setTogglingPause(true);

    try {
      if (isPaused) {
        // Resume: update status then re-invoke the edge function
        await supabase
          .from('whatsapp_broadcasts')
          .update({ status: 'processing', updated_at: new Date().toISOString() })
          .eq('id', broadcastId);

        // Re-invoke the edge function - it will fetch members again and deduplicate
        const { data: ann } = await supabase
          .from('announcements')
          .select('id, title, summary, category, target_blocks, target_units, target_member_ids')
          .eq('id', announcementId)
          .single();

        const { data: condo } = await supabase
          .from('condominiums')
          .select('id, name, slug')
          .eq('id', condominiumId)
          .single();

        if (ann && condo) {
          await supabase.functions.invoke('send-whatsapp', {
            body: {
              announcement: ann,
              condominium: condo,
              baseUrl: window.location.origin,
              existingBroadcastId: broadcastId,
            },
          });
          toast({ title: "Envio retomado", description: "O disparo de WhatsApp foi retomado." });
        }
      } else {
        // Pause
        await supabase
          .from('whatsapp_broadcasts')
          .update({ status: 'paused', updated_at: new Date().toISOString() })
          .eq('id', broadcastId);
        toast({ title: "Envio pausado", description: "O disparo será pausado antes do próximo envio." });
      }
    } catch (err) {
      console.error("Error toggling pause:", err);
    } finally {
      setTogglingPause(false);
    }
  };

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("whatsapp_logs")
      .select("id, recipient_phone, recipient_name, status, error_message, sent_at")
      .eq("announcement_id", announcementId)
      .order("sent_at", { ascending: true });

    if (!error && data) {
      if (data.length > logs.length) {
        setLastLogTime(Date.now());
      }
      setLogs(data);
    }
    setLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, [announcementId]);

  // Polling fallback every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, [announcementId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`whatsapp-monitor-${announcementId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "whatsapp_logs",
          filter: `announcement_id=eq.${announcementId}`,
        },
        (payload) => {
          const newLog = payload.new as WhatsAppLog;
          setLastLogTime(Date.now());
          setLogs((prev) => {
            if (prev.some((l) => l.id === newLog.id)) return prev;
            return [...prev, newLog];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [announcementId]);

  const sent = logs.filter((l) => l.status === "sent").length;
  const failed = logs.filter((l) => l.status === "failed").length;
  const total = totalExpected || logs.length;
  const processed = sent + failed;
  const remaining = total - processed;
  const progressPercent = total > 0 ? Math.round((processed / total) * 100) : 0;
  const isAllDone = totalExpected ? processed >= totalExpected : isCompleted;

  const formatEstimate = (seconds: number): string => {
    if (seconds < 60) return `~${seconds}s restantes`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `~${minutes} min restante${minutes !== 1 ? "s" : ""}`;
    const hours = Math.floor(minutes / 60);
    const remainingMin = minutes % 60;
    return remainingMin > 0 ? `~${hours}h ${remainingMin}min` : `~${hours}h`;
  };

  const estimatedTimeText = remaining > 0 && !isAllDone && !isPaused
    ? formatEstimate(remaining * 21)
    : null;

  const statusText = isAllDone
    ? "Concluído"
    : isPaused
    ? "Pausado"
    : isStalled
    ? "Envio travado"
    : "Enviando...";

  return (
    <Card className="border-primary/30 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Monitor de Envios WhatsApp
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{statusText}</span>
              {broadcastId && !isAllDone && !isStalled && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleTogglePause}
                  disabled={togglingPause}
                  title={isPaused ? "Retomar envio" : "Pausar envio"}
                >
                  {isPaused ? (
                    <Play className="w-4 h-4 text-green-600" />
                  ) : (
                    <Pause className="w-4 h-4 text-yellow-600" />
                  )}
                </Button>
              )}
              {isStalled && broadcastId && !isAllDone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleResume}
                  disabled={togglingPause}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Retomar envio
                </Button>
              )}
            </div>
            <span className="font-medium">{processed} / {total}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Counters */}
        <div className="flex gap-3 flex-wrap">
          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {sent} enviado{sent !== 1 ? "s" : ""}
          </Badge>
          <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            {failed} falha{failed !== 1 ? "s" : ""}
          </Badge>
          {isPaused && (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
              <Pause className="w-3 h-3 mr-1" />
              Pausado
            </Badge>
          )}
          {isStalled && (
            <Badge className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">
              <XCircle className="w-3 h-3 mr-1" />
              Envio travado
            </Badge>
          )}
          {totalExpected && processed < totalExpected && !isPaused && (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
              <Clock className="w-3 h-3 mr-1" />
              {totalExpected - processed} pendente{totalExpected - processed !== 1 ? "s" : ""}
            </Badge>
          )}
          {estimatedTimeText && (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
              <Clock className="w-3 h-3 mr-1" />
              {estimatedTimeText}
            </Badge>
          )}
        </div>

        {/* Recipients table */}
        {logs.length > 0 && (
          <div className="max-h-64 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nome</TableHead>
                  <TableHead className="text-xs">Telefone</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Horário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs py-2">{log.recipient_name || "—"}</TableCell>
                    <TableCell className="text-xs py-2 font-mono">{log.recipient_phone}</TableCell>
                    <TableCell className="py-2">
                      {log.status === "sent" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : log.status === "failed" ? (
                        <span title={log.error_message || ""}>
                          <XCircle className="w-4 h-4 text-red-500" />
                        </span>
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-xs py-2 text-muted-foreground">
                      {log.sent_at
                        ? format(new Date(log.sent_at), "HH:mm:ss", { locale: ptBR })
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {loading && logs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Carregando logs...</p>
        )}

        {!loading && logs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum envio registrado ainda. Aguardando...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
