import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { SuperAdminGuard } from "@/components/SuperAdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Bell, 
  ArrowLeft, 
  Loader2, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Send,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RefreshButton } from "@/components/RefreshButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Condominium {
  id: string;
  name: string;
  slug: string;
  plan: string;
  notification_whatsapp: boolean;
}

interface WhatsAppLog {
  id: string;
  sent_at: string | null;
  recipient_phone: string;
  recipient_name: string | null;
  status: string;
  error_message: string | null;
  condominium_id: string | null;
  condominiums: { name: string } | null;
}

function formatPhoneBR(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 2) return numbers.length ? `(${numbers}` : "";
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

export default function SuperAdminWhatsApp() {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);
  const [checkingApi, setCheckingApi] = useState(true);
  
  // Test modal state
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testCondoId, setTestCondoId] = useState<string | null>(null);
  const [testCondoName, setTestCondoName] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [condosResult, logsResult] = await Promise.all([
        supabase
          .from("condominiums")
          .select("id, name, slug, plan, notification_whatsapp")
          .order("name"),
        supabase
          .from("whatsapp_logs")
          .select("*, condominiums:condominium_id (name)")
          .order("sent_at", { ascending: false })
          .limit(50)
      ]);

      if (condosResult.error) throw condosResult.error;
      if (logsResult.error) throw logsResult.error;

      setCondominiums(condosResult.data || []);
      setLogs(logsResult.data as unknown as WhatsAppLog[] || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const checkApiStatus = useCallback(async () => {
    setCheckingApi(true);
    try {
      const { data, error } = await supabase.functions.invoke("test-whatsapp", {
        method: "GET"
      });
      
      if (error) {
        console.error("Error checking API status:", error);
        setApiConfigured(false);
      } else {
        setApiConfigured(data?.apiConfigured === true);
      }
    } catch (error) {
      console.error("Error checking API:", error);
      setApiConfigured(false);
    } finally {
      setCheckingApi(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    checkApiStatus();
  }, [fetchData, checkApiStatus]);

  const toggleWhatsApp = async (condoId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from("condominiums")
        .update({ notification_whatsapp: enabled })
        .eq("id", condoId);

      if (error) throw error;

      setCondominiums(prev => 
        prev.map(c => c.id === condoId ? { ...c, notification_whatsapp: enabled } : c)
      );

      toast({
        title: enabled ? "WhatsApp ativado" : "WhatsApp desativado",
        description: `Notificações WhatsApp ${enabled ? "ativadas" : "desativadas"} para este condomínio.`,
      });
    } catch (error) {
      console.error("Error toggling WhatsApp:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a configuração. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const openTestModal = (condoId: string | null, condoName: string | null) => {
    setTestCondoId(condoId);
    setTestCondoName(condoName);
    setTestPhone("");
    setTestModalOpen(true);
  };

  const sendTestMessage = async () => {
    if (!testPhone || testPhone.replace(/\D/g, "").length < 10) {
      toast({
        title: "Telefone inválido",
        description: "Digite um número de telefone válido com DDD.",
        variant: "destructive",
      });
      return;
    }

    setSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke("test-whatsapp", {
        body: {
          phone: testPhone,
          condominiumId: testCondoId,
          condominiumName: testCondoName
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Mensagem enviada!",
          description: `Teste enviado para ${data.phone}`,
        });
        setTestModalOpen(false);
        // Refresh logs to show new entry
        fetchData();
      } else {
        toast({
          title: "Falha no envio",
          description: data?.error || "Erro desconhecido ao enviar mensagem.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending test:", error);
      toast({
        title: "Erro ao enviar teste",
        description: "Não foi possível enviar a mensagem de teste.",
        variant: "destructive",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      pro: "default",
      starter: "secondary",
      free: "outline",
    };
    return <Badge variant={variants[plan] || "outline"}>{plan.toUpperCase()}</Badge>;
  };

  return (
    <SuperAdminGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link to="/super-admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-destructive flex items-center justify-center">
                    <Bell className="w-5 h-5 text-destructive-foreground" />
                  </div>
                  <span className="font-display text-xl font-bold text-foreground">Super Admin</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <RefreshButton />
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container px-4 mx-auto py-8">
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary" />
              API WhatsApp (Zion Talk)
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie a integração de notificações via WhatsApp
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* API Status Card */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {checkingApi ? (
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      ) : apiConfigured ? (
                        <Wifi className="w-6 h-6 text-primary" />
                      ) : (
                        <WifiOff className="w-6 h-6 text-destructive" />
                      )}
                      <div>
                        <CardTitle className="text-lg">Status da API</CardTitle>
                        <CardDescription>
                          {checkingApi 
                            ? "Verificando..." 
                            : apiConfigured 
                              ? "API Zion Talk configurada e funcionando"
                              : "API não configurada. Verifique a ZIONTALK_API_KEY."
                          }
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={checkApiStatus}
                        disabled={checkingApi}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${checkingApi ? "animate-spin" : ""}`} />
                        Verificar
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => openTestModal(null, null)}
                        disabled={!apiConfigured}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Teste Global
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Condominiums Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Condomínios</CardTitle>
                  <CardDescription>
                    Ative ou desative notificações WhatsApp para cada condomínio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>WhatsApp</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {condominiums.map((condo) => (
                        <TableRow key={condo.id}>
                          <TableCell className="font-medium">{condo.name}</TableCell>
                          <TableCell>{getPlanBadge(condo.plan)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={condo.notification_whatsapp}
                                onCheckedChange={(checked) => toggleWhatsApp(condo.id, checked)}
                              />
                              <span className={`text-sm ${condo.notification_whatsapp ? "text-primary" : "text-muted-foreground"}`}>
                                {condo.notification_whatsapp ? "Ativo" : "Inativo"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openTestModal(condo.id, condo.name)}
                              disabled={!apiConfigured}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Testar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {condominiums.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            Nenhum condomínio cadastrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Logs Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Logs de Envio Recentes</CardTitle>
                  <CardDescription>
                    Últimos 50 registros de envio de mensagens WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Condomínio</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Destinatário</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.sent_at 
                              ? format(new Date(log.sent_at), "dd/MM HH:mm", { locale: ptBR })
                              : "-"
                            }
                          </TableCell>
                          <TableCell className="font-medium">
                            {log.condominiums?.name || "Teste Global"}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.recipient_phone}
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.recipient_name || "-"}
                          </TableCell>
                          <TableCell>
                          {log.status === "sent" ? (
                              <div className="flex items-center gap-1 text-primary">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm">Enviado</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-destructive" title={log.error_message || ""}>
                                <XCircle className="w-4 h-4" />
                                <span className="text-sm">Falhou</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {logs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            Nenhum log de envio encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </main>

        {/* Test Modal */}
        <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Mensagem de Teste</DialogTitle>
              <DialogDescription>
                {testCondoName 
                  ? `Enviando teste para o condomínio "${testCondoName}"`
                  : "Envie uma mensagem de teste para verificar a integração"
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Número de Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={testPhone}
                  onChange={(e) => setTestPhone(formatPhoneBR(e.target.value))}
                  maxLength={16}
                />
                <p className="text-xs text-muted-foreground">
                  Digite o número com DDD. Formato brasileiro.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTestModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={sendTestMessage} disabled={sendingTest}>
                {sendingTest ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Teste
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminGuard>
  );
}
