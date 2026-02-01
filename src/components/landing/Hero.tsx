import { Button } from "@/components/ui/button";
import { ArrowRight, Gift, CheckCircle, Bell, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
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
              Centralize toda a comunicação oficial do seu condomínio em uma única timeline. 
              WhatsApp e e-mail apenas avisam – a verdade oficial está aqui.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-4">
              <Button asChild size="lg" className="touch-target text-base font-semibold px-8">
              <Link to="/auth/signup">
                  Começar agora
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
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Indique para seu síndico
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Configuração em 2 minutos</span>
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
          </div>

          {/* Visual */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative">
              {/* Phone mockup */}
              <div className="bg-card rounded-3xl shadow-2xl border border-border p-4 mx-auto max-w-sm">
                <div className="bg-muted rounded-2xl p-4 space-y-4">
                  {/* Header */}
                  <div className="text-center pb-3 border-b border-border">
                    <h3 className="font-display font-bold text-lg">Condomínio Jardins</h3>
                    <p className="text-sm text-muted-foreground">Avisos Oficiais</p>
                  </div>

                  {/* Sample announcements */}
                  <div className="space-y-3">
                    <div className="bg-card rounded-xl p-4 shadow-sm border border-border animate-fade-in">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Bell className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-500 text-white mb-2">
                            Urgente
                          </span>
                          <h4 className="font-semibold text-sm">Manutenção Elevadores</h4>
                          <p className="text-xs text-muted-foreground mt-1">Hoje às 14:00 - 18:00</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card rounded-xl p-4 shadow-sm border border-border animate-fade-in" style={{ animationDelay: "0.1s" }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 mb-2">
                            Financeiro
                          </span>
                          <h4 className="font-semibold text-sm">Boleto Disponível</h4>
                          <p className="text-xs text-muted-foreground mt-1">Vencimento: 10/02/2026</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card rounded-xl p-4 shadow-sm border border-border animate-fade-in" style={{ animationDelay: "0.2s" }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Bell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 mb-2">
                            Informativo
                          </span>
                          <h4 className="font-semibold text-sm">Assembleia Geral</h4>
                          <p className="text-xs text-muted-foreground mt-1">Sábado, 15 de Fevereiro</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -right-4 top-1/4 bg-card rounded-xl shadow-lg border border-border p-3 max-w-[200px] animate-slide-in hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">WhatsApp enviado!</p>
                    <p className="text-xs text-muted-foreground">32 moradores</p>
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
