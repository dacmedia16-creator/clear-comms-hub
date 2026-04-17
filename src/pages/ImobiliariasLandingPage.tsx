import { Button } from "@/components/ui/button";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import {
  ArrowRight, Gift, Home, MessageCircle, Users, Building, ListChecks,
  TrendingUp, Shield, Layers, CheckCircle,
} from "lucide-react";

export default function ImobiliariasLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-secondary to-transparent rounded-full blur-3xl" />
        </div>
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6 border border-emerald-200">
                <Gift className="w-4 h-4" /><span>Teste gratuito</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                CRM de captação para{" "}
                <span className="text-primary">imobiliárias e corretores.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Gerencie a captação de imóveis e corretores com pipelines, tarefas, follow-ups e WhatsApp/SMS/Email — tudo organizado e rastreável.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <Button asChild size="lg" className="touch-target text-base font-semibold px-8">
                  <Link to="/auth/signup/real_estate">
                    Começar grátis<ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/demo">Ver demonstração</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Configuração rápida. Sem complicação. Teste gratuito.</p>
            </div>
            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              <div className="bg-card rounded-3xl shadow-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Home className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">Pipeline de Captação</p>
                    <p className="text-xs text-muted-foreground">Imóveis em andamento</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { stage: "Lead", count: 12, color: "bg-slate-400" },
                    { stage: "Contato feito", count: 8, color: "bg-blue-400" },
                    { stage: "Visita agendada", count: 5, color: "bg-violet-400" },
                    { stage: "Documentação", count: 3, color: "bg-amber-400" },
                    { stage: "Captado", count: 7, color: "bg-emerald-500" },
                  ].map((s) => (
                    <div key={s.stage} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${s.color}`} />
                      <span className="text-sm flex-1">{s.stage}</span>
                      <span className="text-sm font-bold">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Tudo que sua imobiliária precisa
            </h2>
            <p className="text-lg text-muted-foreground">
              Captação organizada, comunicação centralizada, histórico de cada contato.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Building, title: "Cadastro de imóveis", desc: "Dados completos, fotos, status e responsável." },
              { icon: Users, title: "Captação de corretores", desc: "Pipeline dedicado para recrutamento." },
              { icon: Layers, title: "Pipelines visuais", desc: "Kanban com etapas configuráveis." },
              { icon: ListChecks, title: "Tarefas e follow-up", desc: "Lembretes para nunca perder um lead." },
              { icon: MessageCircle, title: "WhatsApp, SMS e Email", desc: "Envio direto pela plataforma." },
              { icon: TrendingUp, title: "Histórico unificado", desc: "Toda a interação registrada em um lugar." },
            ].map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Seguro, rastreável, escalável
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Cada ação registrada. Permissões por perfil. Dados isolados por imobiliária.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              "Histórico de interações por imóvel",
              "Templates reutilizáveis de mensagem",
              "Auditoria de mudanças de etapa",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
          <Button asChild size="lg" className="mt-8">
            <Link to="/auth/signup/real_estate">
              Criar minha imobiliária <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
