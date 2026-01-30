import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Bell, Calendar, DollarSign, Shield, Wrench, Users, AlertTriangle } from "lucide-react";
import { ANNOUNCEMENT_CATEGORIES, type AnnouncementCategory } from "@/lib/constants";

interface DemoAnnouncement {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: AnnouncementCategory;
  is_urgent: boolean;
  published_at: string;
}

const DEMO_ANNOUNCEMENTS: DemoAnnouncement[] = [
  {
    id: "1",
    title: "Manutenção dos Elevadores - Torre A",
    summary: "Os elevadores da Torre A estarão fora de serviço para manutenção preventiva.",
    content: "Informamos que os elevadores da Torre A estarão indisponíveis hoje, das 14:00 às 18:00, para manutenção preventiva semestral. Pedimos que utilizem as escadas ou o elevador da Torre B durante este período. Agradecemos a compreensão.",
    category: "urgente",
    is_urgent: true,
    published_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Boleto de Condomínio - Fevereiro 2026",
    summary: "O boleto do condomínio referente a fevereiro já está disponível.",
    content: "O boleto do condomínio referente ao mês de fevereiro de 2026 já está disponível no sistema. Vencimento: 10/02/2026. Valor: R$ 850,00. Para segunda via, entre em contato com a administração.",
    category: "financeiro",
    is_urgent: false,
    published_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: "3",
    title: "Assembleia Geral Ordinária",
    summary: "Convocação para Assembleia Geral Ordinária no dia 15 de fevereiro.",
    content: "Ficam convocados todos os condôminos para a Assembleia Geral Ordinária a realizar-se no dia 15 de fevereiro de 2026, às 19:00, no salão de festas. Pauta: Prestação de contas 2025, aprovação do orçamento 2026 e assuntos gerais.",
    category: "informativo",
    is_urgent: false,
    published_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: "4",
    title: "Reforma da Área da Piscina",
    summary: "Início das obras de reforma da piscina e deck.",
    content: "Informamos que as obras de reforma da piscina e deck terão início na próxima segunda-feira. A área ficará interditada por aproximadamente 30 dias. Agradecemos a compreensão e paciência de todos.",
    category: "manutencao",
    is_urgent: false,
    published_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
  {
    id: "5",
    title: "Novo Sistema de Controle de Acesso",
    summary: "Implementação de novo sistema de portaria com biometria.",
    content: "A partir do dia 01/03, o condomínio contará com novo sistema de controle de acesso por biometria. Todos os moradores devem comparecer à portaria para cadastro das digitais até o dia 28/02. Horário: 8h às 20h.",
    category: "seguranca",
    is_urgent: false,
    published_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
  },
  {
    id: "6",
    title: "Regras de Uso do Salão de Festas",
    summary: "Lembrete sobre as regras de convivência no salão de festas.",
    content: "Lembramos a todos os moradores sobre as regras de uso do salão de festas: reservas com 7 dias de antecedência, limite de 50 pessoas, término das festas até 23h, e responsabilidade pela limpeza do espaço.",
    category: "convivencia",
    is_urgent: false,
    published_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
  },
];

const categoryIcons: Record<AnnouncementCategory, React.ElementType> = {
  informativo: Bell,
  financeiro: DollarSign,
  manutencao: Wrench,
  convivencia: Users,
  seguranca: Shield,
  urgente: AlertTriangle,
};

export default function DemoPage() {
  const [selectedCategory, setSelectedCategory] = useState<AnnouncementCategory | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredAnnouncements = selectedCategory === "all"
    ? DEMO_ANNOUNCEMENTS
    : DEMO_ANNOUNCEMENTS.filter((a) => a.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div className="hidden sm:block h-6 w-px bg-border" />
              <div className="hidden sm:block">
                <h1 className="font-display font-bold text-lg">Condomínio Jardins</h1>
                <p className="text-xs text-muted-foreground">Demonstração</p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link to="/auth/signup">
                Criar minha conta
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Demo Banner */}
      <div className="bg-primary/10 border-b border-primary/20">
        <div className="container mx-auto px-4 py-3">
          <p className="text-sm text-center text-primary font-medium">
            🎯 Esta é uma demonstração. Os avisos abaixo são exemplos fictícios.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Mobile Title */}
        <div className="sm:hidden mb-6 text-center">
          <h1 className="font-display font-bold text-xl">Condomínio Jardins</h1>
          <p className="text-sm text-muted-foreground">Timeline de Avisos</p>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              Todos
            </Button>
            {(Object.keys(ANNOUNCEMENT_CATEGORIES) as AnnouncementCategory[]).map((category) => {
              const config = ANNOUNCEMENT_CATEGORIES[category];
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="gap-1.5"
                >
                  <config.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{config.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Announcements Timeline */}
        <div className="max-w-2xl mx-auto space-y-4">
          {filteredAnnouncements.map((announcement) => {
            const config = ANNOUNCEMENT_CATEGORIES[announcement.category];
            const Icon = categoryIcons[announcement.category];
            const isExpanded = expandedId === announcement.id;

            return (
              <Card
                key={announcement.id}
                className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
                  announcement.is_urgent ? "border-destructive/50 bg-destructive/5" : ""
                }`}
                onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgClass}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Badge className={config.badgeClass}>{config.label}</Badge>
                        <div className="flex items-center text-xs text-muted-foreground gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(announcement.published_at)}
                        </div>
                      </div>

                      <h3 className="font-semibold text-foreground mb-1">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isExpanded ? announcement.content : announcement.summary}
                      </p>

                      {!isExpanded && (
                        <button className="text-xs text-primary mt-2 hover:underline">
                          Ler mais →
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="max-w-2xl mx-auto mt-12">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-6 text-center">
              <h2 className="font-display font-bold text-xl mb-2">
                Gostou do que viu?
              </h2>
              <p className="text-muted-foreground mb-4">
                Crie sua conta e configure seu condomínio em menos de 2 minutos.
              </p>
              <Button asChild size="lg">
                <Link to="/auth/signup">
                  Começar agora – é grátis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
