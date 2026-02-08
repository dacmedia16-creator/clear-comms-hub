import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Webhook, Key, BookOpen, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WebhookList } from "@/components/integrations/WebhookList";
import { ApiTokenList } from "@/components/integrations/ApiTokenList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Condominium {
  id: string;
  name: string;
  slug: string;
}

export default function IntegrationsPage() {
  const { condoId } = useParams<{ condoId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [condominium, setCondominium] = useState<Condominium | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (condoId) {
      fetchCondominium();
    }
  }, [condoId]);

  const fetchCondominium = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("condominiums")
        .select("id, name, slug")
        .eq("id", condoId)
        .single();

      if (error) throw error;
      setCondominium(data);
    } catch (error: unknown) {
      console.error("Error fetching condominium:", error);
      toast({
        title: "Erro ao carregar organização",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container px-4 mx-auto">
          <div className="flex items-center h-16 gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/admin/${condoId}/settings`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">
                {condominium.name}
              </h1>
              <p className="text-sm text-muted-foreground">Integrações</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 mx-auto py-8 max-w-4xl">
        <Tabs defaultValue="webhooks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Tokens de API
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Documentação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks">
            <WebhookList condominiumId={condoId!} />
          </TabsContent>

          <TabsContent value="tokens">
            <ApiTokenList condominiumId={condoId!} />
          </TabsContent>

          <TabsContent value="docs">
            <Card>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Documentação da API
                </CardTitle>
                <CardDescription>
                  Guia rápido para integrar sistemas externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Base URL */}
                <div>
                  <h3 className="font-semibold mb-2">URL Base</h3>
                  <code className="block bg-muted p-3 rounded text-sm">
                    https://jiqbgxtgzpdosbmydfcw.supabase.co/functions/v1/public-api
                  </code>
                </div>

                {/* Authentication */}
                <div>
                  <h3 className="font-semibold mb-2">Autenticação</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Todas as requisições devem incluir o header de autorização:
                  </p>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`Authorization: Bearer avp_seu_token_aqui`}
                  </pre>
                </div>

                {/* Endpoints */}
                <div>
                  <h3 className="font-semibold mb-2">Endpoints Disponíveis</h3>
                  <div className="space-y-4">
                    {/* GET Announcements */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-xs font-medium">
                          GET
                        </span>
                        <code className="text-sm">/announcements</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Lista todos os avisos da organização
                      </p>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`# Parâmetros opcionais
?limit=50        # Quantidade (máx 100)
?offset=0        # Paginação
?category=urgente  # Filtrar por categoria`}
                      </pre>
                    </div>

                    {/* POST Announcements */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">
                          POST
                        </span>
                        <code className="text-sm">/announcements</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Cria um novo aviso
                      </p>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`{
  "title": "Título do aviso",
  "content": "Conteúdo completo...",
  "summary": "Resumo opcional",
  "category": "informativo",
  "is_urgent": false,
  "is_pinned": false
}`}
                      </pre>
                    </div>

                    {/* GET Members */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-xs font-medium">
                          GET
                        </span>
                        <code className="text-sm">/members</code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Lista todos os membros da organização
                      </p>
                    </div>

                    {/* POST Members */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">
                          POST
                        </span>
                        <code className="text-sm">/members</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Adiciona um novo membro
                      </p>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`{
  "full_name": "João Silva",
  "email": "joao@email.com",
  "phone": "+5511999999999",
  "role": "resident",
  "block": "A",
  "unit": "101"
}`}
                      </pre>
                    </div>

                    {/* POST Members Bulk */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">
                          POST
                        </span>
                        <code className="text-sm">/members/bulk</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Importa múltiplos membros de uma vez
                      </p>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`{
  "members": [
    { "full_name": "Maria", "email": "maria@email.com" },
    { "full_name": "Pedro", "phone": "+5511888888888" }
  ]
}`}
                      </pre>
                    </div>

                    {/* GET Info */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-xs font-medium">
                          GET
                        </span>
                        <code className="text-sm">/info</code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Retorna informações da organização e permissões do token
                      </p>
                    </div>
                  </div>
                </div>

                {/* Webhooks */}
                <div>
                  <h3 className="font-semibold mb-2">Webhooks</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Quando configurado, enviamos um POST para sua URL com o seguinte payload:
                  </p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "event": "announcement.created",
  "timestamp": "2026-02-08T10:30:00Z",
  "data": {
    "id": "uuid",
    "title": "Título do aviso",
    "summary": "Resumo",
    "category": "informativo",
    "published_at": "2026-02-08T10:30:00Z",
    "organization": {
      "id": "uuid",
      "name": "Nome da Organização",
      "type": "condominium"
    }
  }
}`}
                  </pre>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Header de assinatura:</strong> X-AVISO-Signature: sha256=...
                  </p>
                </div>

                {/* Example with cURL */}
                <div>
                  <h3 className="font-semibold mb-2">Exemplo com cURL</h3>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`# Listar avisos
curl -X GET \\
  -H "Authorization: Bearer avp_seu_token" \\
  "https://jiqbgxtgzpdosbmydfcw.supabase.co/functions/v1/public-api/announcements"

# Criar aviso
curl -X POST \\
  -H "Authorization: Bearer avp_seu_token" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Novo Aviso","content":"Conteúdo..."}' \\
  "https://jiqbgxtgzpdosbmydfcw.supabase.co/functions/v1/public-api/announcements"`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
