import { Button } from "@/components/ui/button";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gift,
  Bell,
  CheckCircle,
  MessageSquareOff,
  EyeOff,
  RefreshCw,
  FileX,
  Edit3,
  Send,
  Eye,
  Shield,
  Lock,
  UserX,
  X,
  AlertTriangle,
  ShieldCheck,
  Info,
} from "lucide-react";

const categoryStyles: Record<string, { bg: string; text: string }> = {
  urgente: { bg: "bg-red-100", text: "text-red-700" },
  seguranca: { bg: "bg-amber-100", text: "text-amber-700" },
  informativo: { bg: "bg-blue-100", text: "text-blue-700" },
};

const categoryIcons: Record<string, React.ReactNode> = {
  urgente: <AlertTriangle className="w-5 h-5 text-red-600" />,
  seguranca: <ShieldCheck className="w-5 h-5 text-amber-600" />,
  informativo: <Info className="w-5 h-5 text-blue-600" />,
};

export default function EmpresasLandingPage() {
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
                <Gift className="w-4 h-4" />
                <span>Teste gratuito</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                Quadro de avisos oficial{" "}
                <span className="text-primary">para sua equipe.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Tudo que é importante fica registrado. WhatsApp e e-mail só alertam.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <Button asChild size="lg" className="touch-target text-base font-semibold px-8">
                  <Link to="/auth/signup/company">
                    Centralizar avisos da empresa
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Configuração rápida. Sem complicação. Teste gratuito.</p>
            </div>

            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              <div className="relative">
                <div className="bg-card rounded-3xl shadow-2xl border border-border p-4 mx-auto max-w-sm">
                  <div className="bg-muted rounded-2xl p-4 space-y-4">
                    <div className="text-center pb-3 border-b border-border">
                      <h3 className="font-display font-bold text-lg">Equipe Operacional</h3>
                      <p className="text-sm text-muted-foreground">Canal Oficial</p>
                    </div>
                    {[
                      { type: "urgente", title: "Mudança de Turno", subtitle: "A partir de segunda-feira" },
                      { type: "seguranca", title: "Procedimento de Segurança", subtitle: "Atualização obrigatória" },
                      { type: "informativo", title: "Política Interna", subtitle: "Nova versão disponível" },
                    ].map((a, i) => {
                      const s = { urgente: { bg: "bg-red-100", icon: "text-red-600", badge: "bg-red-500 text-white", label: "Urgente" }, seguranca: { bg: "bg-amber-100", icon: "text-amber-600", badge: "bg-amber-100 text-amber-700", label: "Segurança" }, informativo: { bg: "bg-blue-100", icon: "text-blue-600", badge: "bg-blue-100 text-blue-700", label: "Informativo" } }[a.type]!;
                      return (
                        <div key={i} className="bg-card rounded-xl p-4 shadow-sm border border-border">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center flex-shrink-0`}>
                              <Bell className={`w-5 h-5 ${s.icon}`} />
                            </div>
                            <div>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${s.badge} mb-2`}>{s.label}</span>
                              <h4 className="font-semibold text-sm">{a.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{a.subtitle}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="absolute -right-4 top-1/4 bg-card rounded-xl shadow-lg border border-border p-3 max-w-[200px] hidden md:block">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">WhatsApp enviado!</p>
                      <p className="text-xs text-muted-foreground">48 colaboradores</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DORES */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              O gestor conhece bem{" "}
              <span className="text-primary">esses problemas</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { icon: MessageSquareOff, title: "Time operacional não lê e-mail", desc: "Comunicados importantes ficam sem leitura e sem alcance." },
              { icon: EyeOff, title: "Informações se perdem", desc: "Mudanças de procedimento e avisos urgentes desaparecem na correria do dia." },
              { icon: RefreshCw, title: "Mudança de turno confunde", desc: "Quem saiu não repassa, quem entra não sabe. Retrabalho constante." },
              { icon: FileX, title: "Comunicados sem registro", desc: "Sem documentação, qualquer orientação pode ser negada ou esquecida." },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border shadow-sm">
                <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-destructive" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-10 max-w-lg mx-auto">
            A empresa precisa de um{" "}
            <span className="font-semibold text-foreground">canal oficial de comunicação interna.</span>
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Como funciona?</h2>
            <p className="text-lg text-muted-foreground">Sem grupo. Sem discussão. Sem ruído.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { num: "01", icon: Edit3, title: "Crie o aviso", desc: "Escreva o comunicado e escolha a categoria." },
              { num: "02", icon: Send, title: "Publique com um clique", desc: "WhatsApp e e-mail avisam automaticamente." },
              { num: "03", icon: Eye, title: "Colaboradores consultam", desc: "A informação fica disponível na linha do tempo a qualquer momento." },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-32 h-32 rounded-2xl bg-accent flex items-center justify-center">
                    <step.icon className="w-12 h-12 text-primary" />
                  </div>
                  <span className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center shadow-lg">{step.num}</span>
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">O que muda na prática?</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { title: "Comunicação que chega", desc: "Avisos alcançam todos os colaboradores, inclusive quem não usa e-mail." },
              { title: "Registro oficial", desc: "Cada comunicado com data e hora. Histórico completo e auditável." },
              { title: "Transição de turno clara", desc: "Avisos ficam consultáveis. Quem entra sabe exatamente o que mudou." },
              { title: "Menos retrabalho", desc: "Perguntas repetidas diminuem quando a informação está organizada e acessível." },
            ].map((b) => (
              <div key={b.title} className="flex gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXEMPLOS */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Exemplos de avisos publicados</h2>
            <p className="text-lg text-muted-foreground">Veja como ficam os comunicados na linha do tempo da empresa.</p>
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              { cat: "urgente", label: "Urgente", title: "Mudança de turno", time: "Hoje, 07:00", content: "A escala de turno foi alterada a partir de segunda-feira. Confira a nova grade no aviso." },
              { cat: "seguranca", label: "Segurança", title: "Procedimento de segurança atualizado", time: "Ontem, 10:00", content: "Novo procedimento de evacuação em vigor. Leitura obrigatória para toda a equipe." },
              { cat: "informativo", label: "Informativo", title: "Atualização de política interna", time: "10/02", content: "A política de home office foi revisada. Acesse a versão atualizada na timeline." },
            ].map((a) => {
              const style = categoryStyles[a.cat];
              const icon = categoryIcons[a.cat];
              return (
                <div key={a.title} className="bg-card rounded-xl p-5 border border-border shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>{a.label}</span>
                        <span className="text-xs text-muted-foreground">{a.time}</span>
                      </div>
                      <h4 className="font-semibold text-foreground">{a.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{a.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHATSAPP vs AVISO PRO */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Por que não apenas WhatsApp?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><X className="w-5 h-5 text-red-600" /></div>
                <h3 className="font-display font-bold text-lg text-foreground">WhatsApp</h3>
              </div>
              <p className="text-muted-foreground mb-4 font-medium">É conversa. Conversa se perde.</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {["Mensagens se misturam com conversas", "Sem registro oficial", "Sem organização por categoria", "Difícil de encontrar avisos antigos"].map((t) => (
                  <li key={t} className="flex items-start gap-2"><X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" /><span>{t}</span></li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-primary bg-card p-8 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-primary" /></div>
                <h3 className="font-display font-bold text-lg text-foreground">AVISO PRO</h3>
              </div>
              <p className="text-muted-foreground mb-4 font-medium">É registro oficial. Organizado, consultável e permanente.</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {["Linha do tempo oficial da empresa", "Categorizado por tipo de aviso", "Histórico completo e auditável", "Acesso rápido para toda a equipe"].map((t) => (
                  <li key={t} className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /><span>{t}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* LGPD */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Privacidade dos colaboradores</h2>
            <p className="text-lg text-muted-foreground">Transparência em cada comunicação.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Shield, title: "Apenas avisos oficiais", desc: "Contatos usados exclusivamente para enviar comunicados importantes da empresa." },
              { icon: Lock, title: "Sem propaganda", desc: "Nenhum dado é compartilhado com terceiros. Sem envio de publicidade." },
              { icon: UserX, title: "Descadastro a qualquer momento", desc: "Qualquer colaborador pode optar por não receber mais notificações quando quiser." },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><item.icon className="w-8 h-8 text-primary" /></div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Pronto para centralizar a comunicação da sua empresa?</h2>
          <Button asChild size="lg" variant="secondary" className="touch-target text-base font-semibold px-8 mb-4">
            <Link to="/auth/signup/company">
              Centralizar avisos da empresa
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <p className="text-primary-foreground/80 text-sm mt-4">Comece gratuitamente e organize seus avisos hoje mesmo.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
