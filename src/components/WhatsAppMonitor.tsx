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
import { X, CheckCircle, XCircle, Clock, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  onClose: () => void;
}

export function WhatsAppMonitor({
  announcementId,
  condominiumId,
  totalExpected,
  onClose,
}: WhatsAppMonitorProps) {
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("whatsapp_logs")
      .select("id, recipient_phone, recipient_name, status, error_message, sent_at")
      .eq("announcement_id", announcementId)
      .order("sent_at", { ascending: true });

    if (!error && data) {
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
  const progressPercent = total > 0 ? Math.round((processed / total) * 100) : 0;
  const isComplete = totalExpected ? processed >= totalExpected : false;

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
            <span className="text-muted-foreground">
              {isComplete ? "Concluído" : "Enviando..."}
            </span>
            <span className="font-medium">{processed} / {total}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Counters */}
        <div className="flex gap-3">
          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {sent} enviado{sent !== 1 ? "s" : ""}
          </Badge>
          <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            {failed} falha{failed !== 1 ? "s" : ""}
          </Badge>
          {totalExpected && processed < totalExpected && (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
              <Clock className="w-3 h-3 mr-1" />
              {totalExpected - processed} pendente{totalExpected - processed !== 1 ? "s" : ""}
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
