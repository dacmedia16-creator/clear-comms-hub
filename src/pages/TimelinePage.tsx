import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Bell, 
  Loader2, 
  Search, 
  Building2, 
  ChevronDown, 
  ChevronUp,
  Pin,
  AlertTriangle,
  Clock,
  Filter,
  X,
  Paperclip,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Download,
  Eye
} from "lucide-react";
import { ANNOUNCEMENT_CATEGORIES, AnnouncementCategory } from "@/lib/constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileIcon(fileType: string | null, fileName: string) {
  const name = fileName.toLowerCase();
  
  if (fileType === "application/pdf" || name.endsWith(".pdf")) {
    return <FileText className="w-4 h-4 text-red-500" />;
  }
  if (fileType?.startsWith("image/")) {
    return <Image className="w-4 h-4 text-blue-500" />;
  }
  if (
    fileType?.includes("spreadsheet") ||
    fileType?.includes("excel") ||
    name.endsWith(".xls") ||
    name.endsWith(".xlsx")
  ) {
    return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
  }
  if (
    fileType?.includes("document") ||
    fileType?.includes("word") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return <FileText className="w-4 h-4 text-blue-600" />;
  }
  return <File className="w-4 h-4 text-muted-foreground" />;
}

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
}

interface Announcement {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  category: AnnouncementCategory;
  is_pinned: boolean;
  is_urgent: boolean;
  published_at: string;
  attachments?: Attachment[];
}

interface Condominium {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
}

export default function TimelinePage() {
  const { slug } = useParams<{ slug: string }>();
  const [condominium, setCondominium] = useState<Condominium | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AnnouncementCategory | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;

      try {
        // Load condominium by slug
        const { data: condoData, error: condoError } = await supabase
          .from("condominiums")
          .select("*")
          .eq("slug", slug)
          .single();

        if (condoError) {
          if (condoError.code === "PGRST116") {
            setError("Condomínio não encontrado");
          } else {
            throw condoError;
          }
          return;
        }

        setCondominium(condoData);

        // Load announcements with attachments
        const { data: announcementsData, error: announcementsError } = await supabase
          .from("announcements")
          .select(`
            *,
            attachments (
              id,
              file_name,
              file_url,
              file_type,
              file_size
            )
          `)
          .eq("condominium_id", condoData.id)
          .order("is_pinned", { ascending: false })
          .order("published_at", { ascending: false });

        if (announcementsError) throw announcementsError;
        setAnnouncements(announcementsData || []);
        setFilteredAnnouncements(announcementsData || []);
      } catch (err: any) {
        console.error("Error loading timeline:", err);
        setError("Erro ao carregar os avisos");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  // Filter announcements
  useEffect(() => {
    let filtered = [...announcements];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.summary?.toLowerCase().includes(query) ||
          a.content.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    // Keep pinned at top
    filtered.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });

    setFilteredAnnouncements(filtered);
  }, [announcements, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !condominium) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">
          {error || "Condomínio não encontrado"}
        </h1>
        <p className="text-muted-foreground mb-6">
          Verifique se o link está correto
        </p>
        <Button asChild variant="outline">
          <Link to="/">Ir para página inicial</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container px-4 mx-auto">
          <div className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              {condominium.logo_url ? (
                <img 
                  src={condominium.logo_url} 
                  alt={condominium.name} 
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Building2 className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-lg truncate">{condominium.name}</h1>
              <p className="text-sm text-muted-foreground">Avisos Oficiais</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="sticky top-[80px] z-40 bg-background border-b border-border py-4">
        <div className="container px-4 mx-auto space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar avisos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 touch-target"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="flex-shrink-0"
            >
              <Filter className="w-4 h-4 mr-1" />
              Todos
            </Button>
            {Object.entries(ANNOUNCEMENT_CATEGORIES).map(([key, cat]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key as AnnouncementCategory)}
                className="flex-shrink-0"
              >
                <cat.icon className="w-4 h-4 mr-1" />
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <main className="container px-4 mx-auto py-6">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">
              {announcements.length === 0 
                ? "Nenhum aviso publicado ainda" 
                : "Nenhum aviso encontrado"}
            </h2>
            <p className="text-muted-foreground">
              {announcements.length === 0 
                ? "Os avisos aparecerão aqui quando forem publicados" 
                : "Tente ajustar os filtros ou a busca"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => {
              const categoryInfo = ANNOUNCEMENT_CATEGORIES[announcement.category];
              const Icon = categoryInfo.icon;
              const isExpanded = expandedId === announcement.id;

              return (
                <Card 
                  key={announcement.id} 
                  className={`${announcement.is_urgent ? "border-destructive bg-destructive/5" : ""} animate-fade-in`}
                >
                  <Collapsible open={isExpanded} onOpenChange={() => setExpandedId(isExpanded ? null : announcement.id)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryInfo.bgClass}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <Badge variant="outline" className={categoryInfo.badgeClass}>
                              {categoryInfo.label}
                            </Badge>
                            {announcement.is_pinned && (
                              <Badge variant="secondary" className="gap-1">
                                <Pin className="w-3 h-3" />
                                Fixado
                              </Badge>
                            )}
                            {announcement.is_urgent && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Urgente
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="font-display text-lg leading-tight">
                            {announcement.title}
                          </CardTitle>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {format(new Date(announcement.published_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {announcement.summary && (
                        <p className="text-muted-foreground mt-3 leading-relaxed">
                          {announcement.summary}
                        </p>
                      )}

                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="mt-3 w-full justify-center gap-2">
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Recolher
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Ver conteúdo completo
                            </>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </CardHeader>

                    <CollapsibleContent>
                      <CardContent className="pt-0 border-t border-border mt-2">
                        <div className="prose prose-sm max-w-none text-foreground pt-4 whitespace-pre-wrap">
                          {announcement.content}
                        </div>

                        {/* Attachments */}
                        {announcement.attachments && announcement.attachments.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2 text-sm font-medium mb-3">
                              <Paperclip className="w-4 h-4" />
                              <span>Anexos ({announcement.attachments.length})</span>
                            </div>
                            <div className="space-y-2">
                              {announcement.attachments.map((attachment) => {
                                const isImage = attachment.file_type?.startsWith("image/");
                                return (
                                  <div
                                    key={attachment.id}
                                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                                  >
                                    {getFileIcon(attachment.file_type, attachment.file_name)}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                                      {attachment.file_size && (
                                        <p className="text-xs text-muted-foreground">
                                          {formatFileSize(attachment.file_size)}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {isImage && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          asChild
                                          className="h-8"
                                        >
                                          <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                                            <Eye className="w-4 h-4 mr-1" />
                                            Ver
                                          </a>
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className="h-8"
                                      >
                                        <a href={attachment.file_url} download={attachment.file_name}>
                                          <Download className="w-4 h-4 mr-1" />
                                          Baixar
                                        </a>
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Comunicação oficial de {condominium.name}
          </p>
          <Link 
            to="/" 
            className="text-sm text-primary hover:underline mt-1 inline-block"
          >
            Powered by AVISO PRO
          </Link>
        </div>
      </footer>
    </div>
  );
}
