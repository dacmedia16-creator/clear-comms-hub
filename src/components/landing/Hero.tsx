import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gift, CheckCircle, Bell, UserPlus, MessageSquareOff } from "lucide-react";
import { Link } from "react-router-dom";

interface SegmentMockup {
  name: string;
  role: string;
  announcements: {
    type: "urgent" | "financial" | "info";
    title: string;
    subtitle: string;
  }[];
}

const segmentMockups: SegmentMockup[] = [
  {
    name: "Condomínio Jardins",
    role: "Canal Oficial",
    announcements: [
      { type: "urgent", title: "Manutenção Elevadores", subtitle: "Hoje às 14:00 - 18:00" },
      { type: "financial", title: "Boleto Disponível", subtitle: "Vencimento: 10/02/2026" },
      { type: "info", title: "Assembleia Geral", subtitle: "Sábado, 15 de Fevereiro" },
    ],
  },
  {
    name: "Clínica Saúde Total",
    role: "Canal Oficial",
    announcements: [
      { type: "urgent", title: "Plantão Alterado", subtitle: "Sábados: 8h às 14h" },
      { type: "info", title: "Campanha de Vacinação", subtitle: "Gripe - a partir de 01/03" },
      { type: "financial", title: "Novos Convênios", subtitle: "Unimed e Bradesco Saúde" },
    ],
  },
  {
    name: "Tech Solutions",
    role: "Canal Oficial",
    announcements: [
      { type: "urgent", title: "Deploy em Produção", subtitle: "Hoje às 22:00 - 23:00" },
      { type: "info", title: "Treinamento Obrigatório", subtitle: "Segurança de Dados" },
      { type: "financial", title: "PLR Aprovada", subtitle: "Pagamento em 15/03" },
    ],
  },
  {
    name: "Igreja Esperança",
    role: "Canal Oficial",
    announcements: [
      { type: "info", title: "Culto Especial", subtitle: "Domingo às 19:00" },
      { type: "urgent", title: "Retiro de Jovens", subtitle: "Inscrições até 20/02" },
      { type: "info", title: "Ação Social", subtitle: "Arrecadação de alimentos" },
    ],
  },
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSegment = segmentMockups[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % segmentMockups.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-secondary to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6 border border-emerald-200">
              <Gift className="w-4 h-4" />
              <span>3 meses grátis para testar</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Quando é importante,
              <br />
              <span className="text-primary">vira AVISO.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              O canal oficial de avisos da sua organização. Uma linha do tempo. 
              Tudo registrado. WhatsApp e e-mail apenas lembram.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-4">
              <Button asChild size="lg" className="touch-target text-base font-semibold px-8">
              <Link to="/auth/signup">
                  Criar meu canal oficial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="touch-target text-base">
                <Link to="/demo">
                  Ver demonstração
                </Link>
              </Button>
            </div>

            {/* Link de indicação */}
            <div className="text-center lg:text-left mb-6">
              <Link 
                to="/indicar-sindico" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Indique para seu síndico
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 justify-center lg:justify-start text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <MessageSquareOff className="w-4 h-4 text-primary" />
                <span>Sem grupo de WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>3 meses grátis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Sem cartão de crédito</span>
              </div>
            </div>

            {/* Segmentos */}
            <p className="text-sm text-muted-foreground/80">
              Para condomínios, escolas, empresas, clínicas, associações e igrejas.
            </p>
          </div>

          {/* Visual */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative">
              {/* Phone mockup */}
              <div className="bg-card rounded-3xl shadow-2xl border border-border p-4 mx-auto max-w-sm">
                <div className="bg-muted rounded-2xl p-4 space-y-4">
                  {/* Header - Dynamic */}
                  <div className="text-center pb-3 border-b border-border transition-all duration-500">
                    <h3 className="font-display font-bold text-lg" key={currentSegment.name}>
                      {currentSegment.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{currentSegment.role}</p>
                  </div>

                  {/* Sample announcements - Dynamic */}
                  <div className="space-y-3">
                    {currentSegment.announcements.map((announcement, index) => {
                      const typeStyles = {
                        urgent: {
                          bg: "bg-red-100",
                          iconColor: "text-red-600",
                          badgeBg: "bg-red-500",
                          badgeText: "text-white",
                          label: "Urgente",
                        },
                        financial: {
                          bg: "bg-emerald-100",
                          iconColor: "text-emerald-600",
                          badgeBg: "bg-emerald-100",
                          badgeText: "text-emerald-700",
                          label: "Financeiro",
                        },
                        info: {
                          bg: "bg-blue-100",
                          iconColor: "text-blue-600",
                          badgeBg: "bg-blue-100",
                          badgeText: "text-blue-700",
                          label: "Informativo",
                        },
                      };
                      const style = typeStyles[announcement.type];

                      return (
                        <div
                          key={`${currentSegment.name}-${index}`}
                          className="bg-card rounded-xl p-4 shadow-sm border border-border animate-fade-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                              {announcement.type === "financial" ? (
                                <CheckCircle className={`w-5 h-5 ${style.iconColor}`} />
                              ) : (
                                <Bell className={`w-5 h-5 ${style.iconColor}`} />
                              )}
                            </div>
                            <div>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${style.badgeBg} ${style.badgeText} mb-2`}>
                                {style.label}
                              </span>
                              <h4 className="font-semibold text-sm">{announcement.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{announcement.subtitle}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Segment indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {segmentMockups.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? "bg-primary w-6" : "bg-muted-foreground/30"
                    }`}
                    aria-label={`Ver segmento ${index + 1}`}
                  />
                ))}
              </div>

              {/* Floating notification */}
              <div className="absolute -right-4 top-1/4 bg-card rounded-xl shadow-lg border border-border p-3 max-w-[200px] animate-slide-in hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">WhatsApp enviado!</p>
                    <p className="text-xs text-muted-foreground">
                      {currentIndex === 0 ? "32 moradores" : 
                       currentIndex === 1 ? "48 pacientes" : 
                       currentIndex === 2 ? "65 colaboradores" : "120 membros"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
