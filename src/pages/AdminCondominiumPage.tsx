import { useEffect, useState, Fragment } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Bell, 
  Plus, 
  Loader2, 
  Pin, 
  Trash2, 
  Edit, 
  ExternalLink,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  MessageCircle,
  Mail,
  Smartphone,
  Users,
  Settings,
  FileText,
  Building2
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useSendWhatsApp } from "@/hooks/useSendWhatsApp";
import { useSendSMS } from "@/hooks/useSendSMS";
import { useSendEmail } from "@/hooks/useSendEmail";
import { useToast } from "@/hooks/use-toast";
import { getCategoryConfig, CategorySlug } from "@/lib/category-config";
import { useCategoriesForOrganization } from "@/hooks/useCategoriesForOrganization";
import { getAnnouncementTemplates, AnnouncementTemplate } from "@/lib/announcement-templates";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshButton } from "@/components/RefreshButton";
import { SendWhatsAppButton } from "@/components/SendWhatsAppButton";
import { MobileBottomNav, MobileNavItem } from "@/components/mobile/MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { FileUpload } from "@/components/FileUpload";
import { MobileAnnouncementActions } from "@/components/mobile/MobileAnnouncementActions";
import { useCondoBlocks } from "@/hooks/useCondoBlocks";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useOrganizationBehavior } from "@/hooks/useOrganizationBehavior";
import { getOrganizationBehavior } from "@/lib/organization-types";
import { MemberSearchSelect } from "@/components/MemberSearchSelect";
import { MemberListSearchSelect } from "@/components/MemberListSearchSelect";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { linkifyText, linkifyTextWithButtons } from "@/lib/utils";
import { WhatsAppMonitor } from "@/components/WhatsAppMonitor";
import { ActiveBroadcastsBanner } from "@/components/ActiveBroadcastsBanner";
import { useMemberLists } from "@/hooks/useMemberLists";

interface Announcement {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  category: string;
  is_pinned: boolean;
  is_urgent: boolean;
  published_at: string;
  created_at: string;
}

interface Condominium {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  notification_whatsapp: boolean;
  notification_email: boolean;
  notification_sms: boolean;
}

export default function AdminCondominiumPage() {
  const { condoId } = useParams<{ condoId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { terms, behavior, organizationType } = useOrganizationBehavior(condoId);
  const availableCategories = useCategoriesForOrganization(organizationType);
  const availableTemplates = getAnnouncementTemplates(organizationType);

  const [condominium, setCondominium] = useState<Condominium | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [lastCreatedAnnouncement, setLastCreatedAnnouncement] = useState<Announcement | null>(null);

  // Generate nav items dynamically based on condoId
  const syndicNavItems: MobileNavItem[] = condoId ? [
    { icon: Bell, label: "Avisos", path: `/admin/${condoId}` },
    { icon: Users, label: terms.memberPlural, path: `/admin/${condoId}/members` },
    { icon: Settings, label: "Config", path: `/admin/${condoId}/settings` },
    { icon: FileText, label: "Timeline", path: condominium?.slug ? `/c/${condominium.slug}` : `/admin/${condoId}` },
  ] : [];

  // Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("informativo");
  const [isPinned, setIsPinned] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Recipient targeting
  const [recipientType, setRecipientType] = useState<"all" | "blocks" | "units" | "specific" | "list">("all");
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [targetUnits, setTargetUnits] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [selectedListMemberIds, setSelectedListMemberIds] = useState<string[]>([]);

  // Member lists for generic orgs
  const { lists: memberLists } = useMemberLists(condoId);

  // Fetch available blocks for targeting
  const { blocks } = useCondoBlocks(condoId || "");

  // Notification options
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  
  // Expanded announcement content
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);

  // Mobile drawer for announcement actions
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // WhatsApp monitor state
  const [monitorAnnouncementId, setMonitorAnnouncementId] = useState<string | null>(null);
  const [monitorTotal, setMonitorTotal] = useState<number | undefined>(undefined);
  const [monitorBroadcastId, setMonitorBroadcastId] = useState<string | null>(null);
  
  const { sendToMembers: sendWhatsAppToMembers, lastBroadcastId } = useSendWhatsApp();
  const { sendToMembers: sendSMSToMembers } = useSendSMS();
  const { sendToMembers: sendEmailToMembers } = useSendEmail();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function loadData() {
      if (!condoId || !user) return;

      try {
        // Load condominium
        const { data: condoData, error: condoError } = await supabase
          .from("condominiums")
          .select("*")
          .eq("id", condoId)
          .single();

        if (condoError) throw condoError;
        setCondominium(condoData);

        // Load announcements
        const { data: announcementsData, error: announcementsError } = await supabase
          .from("announcements")
          .select("*")
          .eq("condominium_id", condoId)
          .order("is_pinned", { ascending: false })
          .order("published_at", { ascending: false });

        if (announcementsError) throw announcementsError;
        setAnnouncements(announcementsData || []);
      } catch (error: any) {
        console.error("Error loading data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: error.message,
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [condoId, user, navigate, toast]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominium || !title.trim() || !content.trim()) return;

    setCreating(true);
    try {
      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user!.id)
        .single();

      if (!profile) throw new Error("Perfil não encontrado");

      // Prepare targeting arrays
      const targetBlocksArray = recipientType === "blocks" && selectedBlocks.length > 0 
        ? selectedBlocks 
        : null;
      const targetUnitsArray = recipientType === "units" && targetUnits.trim()
        ? targetUnits.split(",").map(u => u.trim()).filter(Boolean)
        : null;
      let targetMemberIdsArray: string[] | null = null;
      if (recipientType === "specific" && selectedMemberIds.length > 0) {
        targetMemberIdsArray = selectedMemberIds;
      } else if (recipientType === "list" && (selectedListIds.length > 0 || selectedListMemberIds.length > 0)) {
        const allIds = new Set<string>(selectedListMemberIds);

        // Fetch members from fully selected lists
        if (selectedListIds.length > 0) {
          const { data: listMembers, error: listError } = await supabase
            .from("user_roles")
            .select("member_id")
            .eq("condominium_id", condominium.id)
            .in("list_id", selectedListIds)
            .not("member_id", "is", null);

          if (listError) throw listError;
          listMembers?.forEach(m => { if (m.member_id) allIds.add(m.member_id); });
        }

        const uniqueIds = [...allIds];
        targetMemberIdsArray = uniqueIds.length > 0 ? uniqueIds : null;
        if (!targetMemberIdsArray) {
          toast({ title: "Sem membros", description: "Nenhum membro selecionado nas listas.", variant: "destructive" });
          setCreating(false);
          return;
        }
      }

      // Create announcement
      const { data, error } = await supabase
        .from("announcements")
        .insert({
          condominium_id: condominium.id,
          title: title.trim(),
          summary: summary.trim() || null,
          content: content.trim(),
          category: category as any,
          is_pinned: isPinned,
          is_urgent: isUrgent || category === "urgente",
          created_by: profile.id,
          target_blocks: targetBlocksArray,
          target_units: targetUnitsArray,
          target_member_ids: targetMemberIdsArray,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload attachments
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const filePath = `${data.id}/${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from("attachments")
            .upload(filePath, file);

          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from("attachments")
            .getPublicUrl(filePath);

          await supabase.from("attachments").insert({
            announcement_id: data.id,
            file_name: file.name,
            file_url: urlData.publicUrl,
            file_type: file.type,
            file_size: file.size,
          });
        }
      }

      setAnnouncements((prev) => [data, ...prev]);
      setLastCreatedAnnouncement(data);

      // Send notifications if selected
      const baseUrl = window.location.origin;
      
      if (sendWhatsApp && condominium.notification_whatsapp) {
        try {
          const result = await sendWhatsAppToMembers(
              { ...data, id: data.id, target_blocks: targetBlocksArray, target_units: targetUnitsArray, target_member_ids: targetMemberIdsArray },
              { ...condominium, id: condominium.id },
              baseUrl
            );
            if (result.total > 0) {
              toast({
                title: "WhatsApp em envio",
                description: `Enviando para ${result.total} moradores em segundo plano.`,
              });
              setMonitorAnnouncementId(data.id);
              setMonitorTotal(result.total);
              setMonitorBroadcastId((result as any).broadcast_id || null);
            }
        } catch (whatsappError) {
          console.error("Error sending WhatsApp:", whatsappError);
        }
      }

      if (sendSMS && condominium.notification_sms) {
        try {
          const result = await sendSMSToMembers(
            { ...data, id: data.id, target_blocks: targetBlocksArray, target_units: targetUnitsArray, target_member_ids: targetMemberIdsArray },
            { ...condominium, id: condominium.id },
            baseUrl
          );
          if (result.sent > 0) {
            toast({
              title: "SMS enviado",
              description: `${result.sent} mensagens enviadas com sucesso.`,
            });
          }
        } catch (smsError) {
          console.error("Error sending SMS:", smsError);
        }
      }

      if (sendEmail && condominium.notification_email) {
        try {
          const result = await sendEmailToMembers(
            { ...data, id: data.id, target_blocks: targetBlocksArray, target_units: targetUnitsArray, target_member_ids: targetMemberIdsArray, emailSubject: emailSubject.trim() || undefined },
            { ...condominium, id: condominium.id },
            baseUrl
          );
          if (result.total > 0) {
            toast({
              title: "Emails em envio",
              description: `Enviando para ${result.total} moradores em segundo plano.`,
            });
          }
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      }

      // Reset form
      setCreateDialogOpen(false);
      setTitle("");
      setSummary("");
      setContent("");
      setCategory("informativo");
      setIsPinned(false);
      setIsUrgent(false);
      setSelectedFiles([]);
      setRecipientType("all");
      setSelectedBlocks([]);
      setTargetUnits("");
      setSelectedMemberIds([]);
      setSelectedListIds([]);
      setSelectedListMemberIds([]);
      setSendWhatsApp(false);
      setSendSMS(false);
      setSendEmail(false);
      setEmailSubject("");

      // Show success dialog with share option
      setSuccessDialogOpen(true);
    } catch (error: any) {
      console.error("Error creating announcement:", error);
      toast({
        title: "Erro ao publicar aviso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ is_pinned: !announcement.is_pinned })
        .eq("id", announcement.id);

      if (error) throw error;

      setAnnouncements((prev) =>
        prev.map((a) => (a.id === announcement.id ? { ...a, is_pinned: !a.is_pinned } : a))
      );
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar aviso",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (announcementId: string) => {
    if (!confirm("Tem certeza que deseja excluir este aviso?")) return;

    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcementId);

      if (error) throw error;

      setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
      toast({
        title: "Aviso excluído",
        description: "O aviso foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir aviso",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!condominium) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background has-bottom-nav">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container px-4 mx-auto">
          <div className="flex items-center gap-4 h-16">
            <Button asChild variant="ghost" size="icon">
              <Link to="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-lg truncate">{condominium.name}</h1>
              <p className="text-sm text-muted-foreground">Gerenciar avisos</p>
            </div>
            <div className="flex items-center gap-2">
              <RefreshButton />
              <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                <Link to={`/admin/${condoId}/members`}>
                  <Users className="w-4 h-4 mr-1" />
                  {terms.memberPlural}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                <Link to={`/c/${condominium.slug}`} target="_blank">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Ver timeline
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 mx-auto py-8 space-y-8">
        {/* Quick Actions for segment */}
        <div>
          <h2 className="font-display text-lg font-semibold mb-4">Ações rápidas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {availableTemplates.slice(0, 4).map((template) => {
              const catConfig = getCategoryConfig(template.category);
              return (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                  onClick={() => {
                    setTitle(template.title);
                    setSummary(template.summary);
                    setContent(template.content);
                    setCategory(template.category);
                    setIsUrgent(template.isUrgent);
                    setCreateDialogOpen(true);
                  }}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-2">
                      <catConfig.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-sm text-foreground">{template.name}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{template.summary}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Announcements Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Avisos</h2>
            <p className="text-sm text-muted-foreground">{announcements.length} avisos publicados</p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="touch-target">
                <Plus className="w-5 h-5 mr-2" />
                Novo Aviso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90dvh] sm:max-h-[90vh] overflow-y-auto bg-card w-[calc(100vw-2rem)] sm:w-auto">
              <DialogHeader>
                <DialogTitle className="font-display">Criar novo aviso</DialogTitle>
                <DialogDescription>
                  Preencha as informações do aviso para publicar
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4 mt-4">
                {/* Template Selector */}
                <div className="space-y-2">
                  <Label htmlFor="template">Usar template (opcional)</Label>
                  <Select
                    value=""
                    onValueChange={(templateId) => {
                      const template = availableTemplates.find((t) => t.id === templateId);
                      if (template) {
                        setTitle(template.title);
                        setSummary(template.summary);
                        setContent(template.content);
                        setCategory(template.category);
                        setIsUrgent(template.isUrgent);
                        toast({
                          title: "Template aplicado",
                          description: `"${template.name}" carregado. Edite conforme necessário.`,
                        });
                      }
                    }}
                  >
                    <SelectTrigger id="template" className="bg-card">
                      <SelectValue placeholder="Selecione um template..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card max-h-60">
                      {availableTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Templates pré-configurados para {terms.organizationPlural.toLowerCase()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título do aviso *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Manutenção dos elevadores"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v)}>
                    <SelectTrigger id="category" className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="w-4 h-4" />
                            <span>{cat.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Resumo curto (opcional)</Label>
                  <Input
                    id="summary"
                    placeholder="Uma frase resumindo o aviso..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo completo *</Label>
                  <Textarea
                    id="content"
                    placeholder="Escreva o conteúdo completo do aviso..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 py-2">
                  <div className="flex items-center gap-2">
                    <Switch id="pinned" checked={isPinned} onCheckedChange={setIsPinned} />
                    <Label htmlFor="pinned" className="cursor-pointer">
                      Fixar no topo
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="urgent" checked={isUrgent} onCheckedChange={setIsUrgent} />
                    <Label htmlFor="urgent" className="cursor-pointer">
                      Marcar como urgente
                    </Label>
                  </div>
                </div>

                {/* File Attachments */}
                <div className="space-y-2">
                  <Label>Anexos (opcional)</Label>
                  <FileUpload
                    files={selectedFiles}
                    onFilesChange={setSelectedFiles}
                    maxSizeMB={20}
                  />
                </div>

                {/* Recipient Targeting - only show for orgs that use location targeting */}
                {behavior.showLocationTargeting && blocks.length > 0 && (
                  <div className="border-t pt-4 mt-2">
                    <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Destinatários
                    </Label>
                    
                    <RadioGroup 
                      value={recipientType} 
                      onValueChange={(v) => setRecipientType(v as "all" | "blocks" | "units")}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="recipient-all" />
                        <Label htmlFor="recipient-all" className="cursor-pointer font-normal">
                          Todos os {terms.memberPlural.toLowerCase()}
                        </Label>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="blocks" id="recipient-blocks" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="recipient-blocks" className="cursor-pointer font-normal">
                            {terms.blockPlural} específicos
                          </Label>
                          {recipientType === "blocks" && blocks.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {blocks.map((block) => (
                                <Badge
                                  key={block}
                                  variant={selectedBlocks.includes(block) ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setSelectedBlocks(prev =>
                                      prev.includes(block)
                                        ? prev.filter(b => b !== block)
                                        : [...prev, block]
                                    );
                                  }}
                                >
                                  {block}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {recipientType === "blocks" && blocks.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Nenhum {terms.block.toLowerCase()} cadastrado ainda.
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="units" id="recipient-units" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="recipient-units" className="cursor-pointer font-normal">
                            {terms.unitPlural} específicas
                          </Label>
                          {recipientType === "units" && (
                            <Input
                              placeholder={`101, 102, 203...`}
                              value={targetUnits}
                              onChange={(e) => setTargetUnits(e.target.value)}
                              className="mt-2"
                            />
                          )}
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Message for orgs without location targeting */}
                {!behavior.showLocationTargeting && (
                  <div className="border-t pt-4 mt-2">
                    <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Destinatários
                    </Label>
                    <RadioGroup
                      value={recipientType === "all" || recipientType === "specific" || recipientType === "list" ? recipientType : "all"}
                      onValueChange={(v) => {
                        setRecipientType(v as "all" | "specific" | "list");
                        if (v === "all") { setSelectedMemberIds([]); setSelectedListIds([]); setSelectedListMemberIds([]); }
                        if (v === "specific") { setSelectedListIds([]); setSelectedListMemberIds([]); }
                        if (v === "list") setSelectedMemberIds([]);
                      }}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="recipient-all-generic" />
                        <Label htmlFor="recipient-all-generic" className="cursor-pointer font-normal">
                          Todos os {terms.memberPlural.toLowerCase()}
                        </Label>
                      </div>

                      {memberLists.length > 0 && (
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="list" id="recipient-list" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="recipient-list" className="cursor-pointer font-normal">
                              Lista de membros
                            </Label>
                            {recipientType === "list" && (
                              <MemberListSearchSelect
                                lists={memberLists}
                                selectedIds={selectedListIds}
                                onSelectionChange={setSelectedListIds}
                                condominiumId={condoId!}
                                selectedListMemberIds={selectedListMemberIds}
                                onListMemberSelectionChange={setSelectedListMemberIds}
                              />
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="specific" id="recipient-specific" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="recipient-specific" className="cursor-pointer font-normal">
                            Membros específicos
                          </Label>
                          {recipientType === "specific" && condoId && (
                            <MemberSearchSelect
                              condominiumId={condoId}
                              selectedIds={selectedMemberIds}
                              onSelectionChange={setSelectedMemberIds}
                            />
                          )}
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Notification Options */}
                <div className="border-t pt-4 mt-2">
                  <Label className="text-sm font-medium mb-3 block">
                    Notificar {terms.memberPlural.toLowerCase()}
                  </Label>
                  
                  <div className="space-y-3">
                    {/* WhatsApp */}
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id="send-whatsapp" 
                        checked={sendWhatsApp}
                        onCheckedChange={(checked) => setSendWhatsApp(!!checked)}
                        disabled={!condominium?.notification_whatsapp}
                      />
                      <div className="flex-1">
                        <Label htmlFor="send-whatsapp" className="cursor-pointer flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-green-600" />
                          Enviar via WhatsApp
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {condominium?.notification_whatsapp 
                            ? `Notificar ${terms.memberPlural.toLowerCase()} com telefone cadastrado`
                            : `Habilite nas configurações da ${terms.organization.toLowerCase()}`}
                        </p>
                      </div>
                    </div>
                    
                    {/* SMS */}
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id="send-sms" 
                        checked={sendSMS}
                        onCheckedChange={(checked) => setSendSMS(!!checked)}
                        disabled={!condominium?.notification_sms}
                      />
                      <div className="flex-1">
                        <Label htmlFor="send-sms" className="cursor-pointer flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-purple-600" />
                          Enviar via SMS
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {condominium?.notification_sms 
                            ? `Notificar ${terms.memberPlural.toLowerCase()} com telefone cadastrado`
                            : `Habilite nas configurações da ${terms.organization.toLowerCase()}`}
                        </p>
                      </div>
                    </div>
                    
                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id="send-email" 
                        checked={sendEmail}
                        onCheckedChange={(checked) => setSendEmail(!!checked)}
                        disabled={!condominium?.notification_email}
                      />
                      <div className="flex-1">
                        <Label htmlFor="send-email" className="cursor-pointer flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-600" />
                          Enviar via Email
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {condominium?.notification_email 
                            ? `Notificar ${terms.memberPlural.toLowerCase()} com email cadastrado`
                            : `Habilite nas configurações da ${terms.organization.toLowerCase()}`}
                        </p>
                      </div>
                    </div>

                    {/* Email Subject - only for generic orgs */}
                    {sendEmail && condominium?.notification_email && organizationType === 'generic' && (
                      <div className="ml-7">
                        <Label htmlFor="email-subject" className="text-sm">Assunto do email</Label>
                        <Input
                          id="email-subject"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder={`[${condominium?.name}] ${title || 'Título do aviso'}`}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creating || !title.trim() || !content.trim()}>
                    {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Publicar aviso
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active broadcasts banner — persists across reloads */}
        {condoId && (
          <ActiveBroadcastsBanner
            condominiumId={condoId}
            onOpenMonitor={({ announcementId, broadcastId, total }) => {
              setMonitorAnnouncementId(announcementId);
              setMonitorBroadcastId(broadcastId);
              setMonitorTotal(total);
            }}
          />
        )}

        {/* WhatsApp Monitor */}
        {monitorAnnouncementId && condoId && (
          <WhatsAppMonitor
            announcementId={monitorAnnouncementId}
            condominiumId={condoId}
            totalExpected={monitorTotal}
            broadcastId={monitorBroadcastId}
            onClose={() => {
              setMonitorAnnouncementId(null);
              setMonitorTotal(undefined);
              setMonitorBroadcastId(null);
            }}
          />
        )}

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-2xl bg-accent mx-auto flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Nenhum aviso publicado</h3>
              <p className="text-muted-foreground mb-6">
                Crie seu primeiro aviso para informar os moradores
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Criar primeiro aviso
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => {
              const categoryInfo = getCategoryConfig(announcement.category);
              const Icon = categoryInfo.icon;

              return (
                <Card 
                  key={announcement.id} 
                  className={`${announcement.is_urgent ? "border-destructive bg-destructive/5" : ""} ${isMobile ? "cursor-pointer active:bg-muted/50" : ""}`}
                  onClick={isMobile ? () => {
                    setSelectedAnnouncement(announcement);
                    setDrawerOpen(true);
                  } : undefined}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryInfo.bgClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${categoryInfo.badgeClass}`}>
                              {categoryInfo.label}
                            </span>
                            {announcement.is_pinned && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-accent text-accent-foreground flex items-center gap-1">
                                <Pin className="w-3 h-3" />
                                Fixado
                              </span>
                            )}
                            {announcement.is_urgent && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-destructive text-destructive-foreground flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Urgente
                              </span>
                            )}
                          </div>
                          <CardTitle className="font-display text-lg">{announcement.title}</CardTitle>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {format(new Date(announcement.published_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop actions */}
                      {!isMobile && (
                        <div className="flex items-center gap-1">
                          <SendWhatsAppButton
                            announcement={{ ...announcement, id: announcement.id }}
                            condominium={{ ...condominium, id: condominium.id }}
                            onSendStarted={(annId, total, broadcastId) => {
                              setMonitorAnnouncementId(annId);
                              setMonitorTotal(total);
                              setMonitorBroadcastId(broadcastId || null);
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              setMonitorAnnouncementId(announcement.id);
                              setMonitorTotal(undefined);
                              const { data: bc } = await supabase
                                .from('whatsapp_broadcasts')
                                .select('id')
                                .eq('announcement_id', announcement.id)
                                .order('created_at', { ascending: false })
                                .limit(1)
                                .single();
                              setMonitorBroadcastId(bc?.id || null);
                            }}
                            title="Ver envios WhatsApp"
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTogglePin(announcement)}
                            title={announcement.is_pinned ? "Desafixar" : "Fixar no topo"}
                          >
                            <Pin className={`w-4 h-4 ${announcement.is_pinned ? "text-primary" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(announcement.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {announcement.summary && (
                      <p className="text-muted-foreground">{linkifyText(announcement.summary)}</p>
                    )}
                    <Collapsible
                      open={expandedAnnouncementId === announcement.id}
                      onOpenChange={(open) => setExpandedAnnouncementId(open ? announcement.id : null)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                          {expandedAnnouncementId === announcement.id ? (
                            <><ChevronUp className="w-3.5 h-3.5 mr-1" /> Recolher</>
                          ) : (
                            <><ChevronDown className="w-3.5 h-3.5 mr-1" /> Ver conteúdo completo</>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2 p-3 rounded-md bg-muted/50 text-sm whitespace-pre-wrap">
                          {linkifyTextWithButtons(announcement.content)}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Success Dialog with Share Option */}
        <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <DialogContent className="sm:max-w-md bg-card">
            <DialogHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-center font-display">Aviso publicado!</DialogTitle>
              <DialogDescription className="text-center">
                O aviso foi publicado com sucesso na timeline do condomínio.
              </DialogDescription>
            </DialogHeader>
            
            {lastCreatedAnnouncement && (
              <div className="bg-muted/50 rounded-lg p-4 my-2">
                <p className="font-medium text-sm">{lastCreatedAnnouncement.title}</p>
                {lastCreatedAnnouncement.summary && (
                  <p className="text-sm text-muted-foreground mt-1">{lastCreatedAnnouncement.summary}</p>
                )}
              </div>
            )}

            <DialogFooter className="sm:justify-center">
              <Button variant="outline" onClick={() => setSuccessDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mobile Announcement Actions Drawer */}
        {selectedAnnouncement && (
          <MobileAnnouncementActions
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            announcementTitle={selectedAnnouncement.title}
            isPinned={selectedAnnouncement.is_pinned}
            onTogglePin={() => handleTogglePin(selectedAnnouncement)}
            onDelete={() => handleDelete(selectedAnnouncement.id)}
            onSendWhatsApp={() => {
              // Trigger WhatsApp send via the existing button logic
              const baseUrl = window.location.origin;
              sendWhatsAppToMembers(
                { ...selectedAnnouncement, target_blocks: null, target_units: null },
                { ...condominium, id: condominium.id },
                baseUrl
              );
            }}
            showWhatsApp={condominium.notification_whatsapp}
          />
        )}

        <MobileBottomNav items={syndicNavItems} />
      </main>
    </div>
  );
}
