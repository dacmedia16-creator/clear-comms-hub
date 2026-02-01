import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { SuperAdminGuard } from "@/components/SuperAdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  WifiOff,
  Building2,
  Users,
  FileText,
  LayoutDashboard,
  Smartphone,
  Mail
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RefreshButton } from "@/components/RefreshButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { WhatsAppSendersCard } from "@/components/super-admin/WhatsAppSendersCard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MobileBottomNav, MobileNavItem } from "@/components/mobile/MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

const superAdminNavItems: MobileNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin" },
  { icon: Building2, label: "Condos", path: "/super-admin/condominiums" },
  { icon: Users, label: "Usuários", path: "/super-admin/users" },
  { icon: FileText, label: "Timelines", path: "/super-admin/timelines" },
  { icon: Bell, label: "Notificações", path: "/super-admin/notifications" },
];

interface Condominium {
  id: string;
  name: string;
  slug: string;
  plan: string;
  notification_whatsapp: boolean;
  notification_sms: boolean | null;
  notification_email: boolean;
}

interface LogEntry {
  id: string;
  sent_at: string | null;
  recipient_phone?: string;
  recipient_email?: string;
  recipient_name: string | null;
  status: string;
  error_message: string | null;
  condominium_id: string | null;
  condominiums: { name: string } | null;
}

type NotificationType = 'whatsapp' | 'sms' | 'email';

interface ApiStatus {
  id: NotificationType;
  name: string;
  provider: string;
  icon: React.ComponentType<{ className?: string }>;
  configured: boolean | null;
  checking: boolean;
  testFunction: string;
}

function formatPhoneBR(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 2) return numbers.length ? `(${numbers}` : "";
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

export default function SuperAdminNotifications() {
  const { signOut } = useAuth();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [activeLogTab, setActiveLogTab] = useState<NotificationType>('whatsapp');
  const [logs, setLogs] = useState<Record<NotificationType, LogEntry[]>>({
    whatsapp: [],
    sms: [],
    email: [],
  });
  
  // API Status
  const [apis, setApis] = useState<ApiStatus[]>([
    { id: 'whatsapp', name: 'WhatsApp', provider: 'Zion Talk', icon: MessageSquare, configured: null, checking: true, testFunction: 'test-whatsapp' },
    { id: 'sms', name: 'SMS', provider: 'SMSFire', icon: Smartphone, configured: null, checking: true, testFunction: 'test-sms' },
    { id: 'email', name: 'Email', provider: 'Zoho Mail', icon: Mail, configured: null, checking: true, testFunction: 'test-email' },
  ]);
  
  // Test modal state
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testType, setTestType] = useState<NotificationType>('whatsapp');
  const [testInput, setTestInput] = useState("");
  const [testCondoId, setTestCondoId] = useState<string | null>(null);
  const [testCondoName, setTestCondoName] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [condosResult, whatsappLogsResult, smsLogsResult, emailLogsResult] = await Promise.all([
        supabase
          .from("condominiums")
          .select("id, name, slug, plan, notification_whatsapp, notification_sms, notification_email")
          .order("name"),
        supabase
          .from("whatsapp_logs")
          .select("*, condominiums:condominium_id (name)")
          .order("sent_at", { ascending: false })
          .limit(50),
        supabase
          .from("sms_logs")
          .select("*, condominiums:condominium_id (name)")
          .order("sent_at", { ascending: false })
          .limit(50),
        supabase
          .from("email_logs")
          .select("*, condominiums:condominium_id (name)")
          .order("sent_at", { ascending: false })
          .limit(50),
      ]);

      if (condosResult.error) throw condosResult.error;

      setCondominiums(condosResult.data || []);
      setLogs({
        whatsapp: (whatsappLogsResult.data as unknown as LogEntry[]) || [],
        sms: (smsLogsResult.data as unknown as LogEntry[]) || [],
        email: (emailLogsResult.data as unknown as LogEntry[]) || [],
      });
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

  const checkApiStatus = useCallback(async (apiId: NotificationType, testFunction: string) => {
    setApis(prev => prev.map(api => 
      api.id === apiId ? { ...api, checking: true } : api
    ));
    
    try {
      const { data, error } = await supabase.functions.invoke(testFunction, {
        method: "GET"
      });
      
      const configured = error ? false : data?.apiConfigured === true;
      setApis(prev => prev.map(api => 
        api.id === apiId ? { ...api, configured, checking: false } : api
      ));
    } catch (error) {
      console.error(`Error checking ${apiId} API:`, error);
      setApis(prev => prev.map(api => 
        api.id === apiId ? { ...api, configured: false, checking: false } : api
      ));
    }
  }, []);

  const checkAllApis = useCallback(async () => {
    await Promise.all(apis.map(api => checkApiStatus(api.id, api.testFunction)));
  }, [apis, checkApiStatus]);

  useEffect(() => {
    fetchData();
    checkAllApis();
  }, []);

  const toggleNotification = async (condoId: string, type: NotificationType, enabled: boolean) => {
    const fieldMap = {
      whatsapp: 'notification_whatsapp',
      sms: 'notification_sms',
      email: 'notification_email',
    };
    
    try {
      const { error } = await supabase
        .from("condominiums")
        .update({ [fieldMap[type]]: enabled })
        .eq("id", condoId);

      if (error) throw error;

      setCondominiums(prev => 
        prev.map(c => c.id === condoId ? { ...c, [fieldMap[type]]: enabled } : c)
      );

      const typeNames = { whatsapp: 'WhatsApp', sms: 'SMS', email: 'Email' };
      toast({
        title: enabled ? `${typeNames[type]} ativado` : `${typeNames[type]} desativado`,
        description: `Notificações ${typeNames[type]} ${enabled ? "ativadas" : "desativadas"} para este condomínio.`,
      });
    } catch (error) {
      console.error("Error toggling notification:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a configuração. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const openTestModal = (type: NotificationType, condoId: string | null, condoName: string | null) => {
    setTestType(type);
    setTestCondoId(condoId);
    setTestCondoName(condoName);
    setTestInput("");
    setTestModalOpen(true);
  };

  const sendTestMessage = async () => {
    const isEmail = testType === 'email';
    
    if (!testInput) {
      toast({
        title: isEmail ? "Email inválido" : "Telefone inválido",
        description: isEmail ? "Digite um email válido." : "Digite um número de telefone válido com DDD.",
        variant: "destructive",
      });
      return;
    }

    if (!isEmail && testInput.replace(/\D/g, "").length < 10) {
      toast({
        title: "Telefone inválido",
        description: "Digite um número de telefone válido com DDD.",
        variant: "destructive",
      });
      return;
    }

    const api = apis.find(a => a.id === testType);
    if (!api) return;

    setSendingTest(true);
    try {
      const body = isEmail 
        ? { email: testInput, condominiumId: testCondoId, condominiumName: testCondoName }
        : { phone: testInput, condominiumId: testCondoId, condominiumName: testCondoName };

      const { data, error } = await supabase.functions.invoke(api.testFunction, { body });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Mensagem enviada!",
          description: `Teste enviado para ${isEmail ? data.email : data.phone}`,
        });
        setTestModalOpen(false);
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

  const getLogDestination = (log: LogEntry, type: NotificationType) => {
    if (type === 'email') {
      return log.recipient_email || '-';
    }
    return log.recipient_phone || '-';
  };

  return (
    <SuperAdminGuard>
      <div className="min-h-screen bg-background has-bottom-nav">
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
              <Bell className="w-8 h-8 text-primary" />
              Central de Notificações
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todas as integrações de notificação (WhatsApp, SMS e Email)
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* API Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {apis.map((api) => {
                  const IconComponent = api.icon;
                  return (
                    <Card key={api.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {api.checking ? (
                              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            ) : api.configured ? (
                              <Wifi className="w-5 h-5 text-primary" />
                            ) : (
                              <WifiOff className="w-5 h-5 text-destructive" />
                            )}
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                <IconComponent className="w-4 h-4" />
                                {api.name}
                              </CardTitle>
                              <CardDescription className="text-xs">{api.provider}</CardDescription>
                            </div>
                          </div>
                          <Badge variant={api.configured ? "default" : "destructive"} className="text-xs">
                            {api.checking ? "..." : api.configured ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => checkApiStatus(api.id, api.testFunction)}
                            disabled={api.checking}
                          >
                            <RefreshCw className={`w-3 h-3 mr-1 ${api.checking ? "animate-spin" : ""}`} />
                            Verificar
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => openTestModal(api.id, null, null)}
                            disabled={!api.configured}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Testar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* WhatsApp Senders Management */}
              <WhatsAppSendersCard />

              {/* Condominiums Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Condomínios</CardTitle>
                  <CardDescription>
                    Ative ou desative cada tipo de notificação por condomínio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead className="text-center">WhatsApp</TableHead>
                          <TableHead className="text-center">SMS</TableHead>
                          <TableHead className="text-center">Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {condominiums.map((condo) => (
                          <TableRow key={condo.id}>
                            <TableCell className="font-medium">{condo.name}</TableCell>
                            <TableCell>{getPlanBadge(condo.plan)}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Switch
                                  checked={condo.notification_whatsapp}
                                  onCheckedChange={(checked) => toggleNotification(condo.id, 'whatsapp', checked)}
                                  disabled={!apis.find(a => a.id === 'whatsapp')?.configured}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Switch
                                  checked={condo.notification_sms ?? false}
                                  onCheckedChange={(checked) => toggleNotification(condo.id, 'sms', checked)}
                                  disabled={!apis.find(a => a.id === 'sms')?.configured}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Switch
                                  checked={condo.notification_email}
                                  onCheckedChange={(checked) => toggleNotification(condo.id, 'email', checked)}
                                  disabled={!apis.find(a => a.id === 'email')?.configured}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {condominiums.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                              Nenhum condomínio cadastrado
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Logs with Tabs */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Logs de Envio Recentes</CardTitle>
                  <CardDescription>
                    Últimos 50 registros de envio por tipo de notificação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeLogTab} onValueChange={(v) => setActiveLogTab(v as NotificationType)}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        WhatsApp
                      </TabsTrigger>
                      <TabsTrigger value="sms" className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        SMS
                      </TabsTrigger>
                      <TabsTrigger value="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </TabsTrigger>
                    </TabsList>

                    {(['whatsapp', 'sms', 'email'] as NotificationType[]).map((type) => (
                      <TabsContent key={type} value={type}>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data/Hora</TableHead>
                              <TableHead>Condomínio</TableHead>
                              <TableHead>{type === 'email' ? 'Email' : 'Telefone'}</TableHead>
                              <TableHead>Destinatário</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {logs[type].map((log) => (
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
                                  {getLogDestination(log, type)}
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
                            {logs[type].length === 0 && (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                  Nenhum log de envio encontrado
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </main>

        {/* Test Modal */}
        <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Enviar Teste de {testType === 'whatsapp' ? 'WhatsApp' : testType === 'sms' ? 'SMS' : 'Email'}
              </DialogTitle>
              <DialogDescription>
                {testCondoName 
                  ? `Enviando teste para o condomínio ${testCondoName}`
                  : "Enviando teste global (sem vínculo a condomínio)"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="testInput">
                  {testType === 'email' ? 'Email' : 'Telefone (com DDD)'}
                </Label>
                {testType === 'email' ? (
                  <Input
                    id="testInput"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                  />
                ) : (
                  <Input
                    id="testInput"
                    placeholder="(11) 99999-9999"
                    value={testInput}
                    onChange={(e) => setTestInput(formatPhoneBR(e.target.value))}
                  />
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setTestModalOpen(false)} disabled={sendingTest}>
                Cancelar
              </Button>
              <Button onClick={sendTestMessage} disabled={sendingTest || !testInput}>
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

        {/* Mobile Navigation */}
        {isMobile && <MobileBottomNav items={superAdminNavItems} />}
      </div>
    </SuperAdminGuard>
  );
}
