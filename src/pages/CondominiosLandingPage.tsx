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
  Search,
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
  Wrench,
  DollarSign,
  Info,
  BookOpen,
} from "lucide-react";

/* ───── category badge config ───── */
const categoryStyles: Record<string, { bg: string; text: string }> = {
  urgente: { bg: "bg-red-100", text: "text-red-700" },
  manutencao: { bg: "bg-amber-100", text: "text-amber-700" },
  financeiro: { bg: "bg-emerald-100", text: "text-emerald-700" },
  informativo: { bg: "bg-blue-100", text: "text-blue-700" },
  regras: { bg: "bg-purple-100", text: "text-purple-700" },
};

const categoryIcons: Record<string, React.ReactNode> = {
  urgente: <AlertTriangle className="w-5 h-5 text-red-600" />,
  manutencao: <Wrench className="w-5 h-5 text-amber-600" />,
  financeiro: <DollarSign className="w-5 h-5 text-emerald-600" />,
  informativo: <Info className="w-5 h-5 text-blue-600" />,
  regras: <BookOpen className="w-5 h-5 text-purple-600" />,
};

export default function CondominiosLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── SEÇÃO 1 — HERO ── */}
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-secondary to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* copy */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6 border border-emerald-200">
                <Gift className="w-4 h-4" />
                <span>Teste gratuito</span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                Comunicação oficial do condomínio,{" "}
                <span className="text-primary">sem confusão.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Centralize todos os avisos importantes em uma única linha do tempo. WhatsApp e e-mail apenas avisam — a informação oficial fica registrada.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <Button asChild size="lg" className="touch-target text-base font-semibold px-8">
                  <Link to="/auth/signup/condominium">
                    Criar canal oficial do condomínio
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Configuração rápida. Sem complicação. Teste gratuito.
              </p>
            </div>

            {/* phone mockup — static, condo only */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              <div className="relative">
                <div className="bg-card rounded-3xl shadow-2xl border border-border p-4 mx-auto max-w-sm">
                  <div className="bg-muted rounded-2xl p-4 space-y-4">
                    <div className="text-center pb-3 border-b border-border">
                      <h3 className="font-display font-bold text-lg">Condomínio Jardins</h3>
                      <p className="text-sm text-muted-foreground">Canal Oficial</p>
                    </div>

                    {[
                      { type: "urgent" as const, title: "Manutenção Elevadores", subtitle: "Hoje às 14:00 - 18:00" },
                      { type: "financial" as const, title: "Boleto Disponível", subtitle: "Vencimento: 10/02/2026" },
                      { type: "info" as const, title: "Assembleia Geral", subtitle: "Sábado, 15 de Fevereiro" },
                    ].map((a, i) => {
                      const s = {
                        urgent: { bg: "bg-red-100", icon: "text-red-600", badge: "bg-red-500 text-white", label: "Urgente" },
                        financial: { bg: "bg-emerald-100", icon: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700", label: "Financeiro" },
                        info: { bg: "bg-blue-100", icon: "text-blue-600", badge: "bg-blue-100 text-blue-700", label: "Informativo" },
                      }[a.type];
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

                {/* floating notification */}
                <div className="absolute -right-4 top-1/4 bg-card rounded-xl shadow-lg border border-border p-3 max-w-[200px] hidden md:block">
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

      {/* ── SEÇÃO 2 — DOR REAL DO SÍNDICO ── */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              O síndico conhece bem{" "}
              <span className="text-primary">esses problemas</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: MessageSquareOff, title: "Avisos se perdem em grupos de WhatsApp", desc: "Mensagens importantes somem entre memes, áudios e conversas paralelas." },
              { icon: EyeOff, title: "Moradores dizem que não foram avisados", desc: "Sem registro, não há como comprovar que a informação foi enviada." },
              { icon: Search, title: "Informações antigas são difíceis de encontrar", desc: "Precisa de um aviso antigo? Boa sorte rolando o histórico do grupo." },
              { icon: RefreshCw, title: "Dúvidas repetidas geram retrabalho", desc: "Repetir a mesma informação várias vezes consome tempo e energia." },
              { icon: FileX, title: "Falta de registro formal", desc: "Sem documentação oficial, qualquer decisão pode ser questionada." },
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
            O condomínio precisa de uma{" "}
            <span className="font-semibold text-foreground">fonte oficial de informação.</span>
          </p>
        </div>
      </section>

      {/* ── SEÇÃO 3 — COMO FUNCIONA ── */}
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
              { num: "03", icon: Eye, title: "Moradores acessam a linha do tempo", desc: "A informação fica disponível para consulta a qualquer momento." },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-32 h-32 rounded-2xl bg-accent flex items-center justify-center">
                    <step.icon className="w-12 h-12 text-primary" />
                  </div>
                  <span className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center shadow-lg">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 4 — BENEFÍCIOS ── */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">O que muda na prática?</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { title: "Tudo fica registrado", desc: "Cada aviso com data e hora. Histórico completo e acessível." },
              { title: "Reduz conflitos e mal-entendidos", desc: "A informação oficial está sempre disponível. Sem espaço para 'eu não vi'." },
              { title: "Organização por categoria", desc: "Financeiro, manutenção, urgente, assembleia… Cada aviso no seu lugar." },
              { title: "Comprovação de envio", desc: "Histórico de comunicados enviados. Proteção para o síndico e a administradora." },
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

      {/* ── SEÇÃO 5 — EXEMPLOS REAIS DE AVISOS ── */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Exemplos de avisos publicados</h2>
            <p className="text-lg text-muted-foreground">Veja como ficam os comunicados na linha do tempo do condomínio.</p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {[
              { cat: "urgente", label: "Urgente", title: "Interrupção de água", time: "Hoje, 08:30", content: "A água será interrompida das 9h às 12h para reparo na tubulação do bloco B." },
              { cat: "manutencao", label: "Manutenção", title: "Manutenção dos elevadores", time: "Ontem, 14:00", content: "Os elevadores do bloco A estarão em manutenção preventiva nesta sexta-feira." },
              { cat: "financeiro", label: "Financeiro", title: "Boleto de condomínio disponível", time: "12/02", content: "O boleto de fevereiro já está disponível. Vencimento: 10/03." },
              { cat: "informativo", label: "Informativo", title: "Assembleia geral ordinária", time: "10/02", content: "A assembleia será realizada no salão de festas, dia 22/02 às 19h." },
              { cat: "regras", label: "Regras", title: "Normas para reformas e obras", time: "05/02", content: "Obras permitidas de segunda a sexta, das 8h às 17h. Sábados até 12h." },
            ].map((a) => {
              const style = categoryStyles[a.cat];
              const icon = categoryIcons[a.cat];
              return (
                <div key={a.title} className="bg-card rounded-xl p-5 border border-border shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
                          {a.label}
                        </span>
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

      {/* ── SEÇÃO 6 — POR QUE NÃO APENAS WHATSAPP? ── */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Por que não apenas WhatsApp?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* WhatsApp */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground">WhatsApp</h3>
              </div>
              <p className="text-muted-foreground mb-4 font-medium">É conversa. Conversa se perde.</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Mensagens se misturam com conversas",
                  "Sem registro oficial",
                  "Sem organização por categoria",
                  "Difícil de encontrar avisos antigos",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AVISO PRO */}
            <div className="rounded-2xl border-2 border-primary bg-card p-8 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground">AVISO PRO</h3>
              </div>
              <p className="text-muted-foreground mb-4 font-medium">É registro oficial. Organizado, consultável e permanente.</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Linha do tempo oficial do condomínio",
                  "Categorizado por tipo de aviso",
                  "Histórico completo e acessível",
                  "Acesso sem login para moradores",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 7 — PRIVACIDADE E LGPD ── */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Privacidade dos moradores</h2>
            <p className="text-lg text-muted-foreground">Transparência em cada comunicação.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Shield, title: "Apenas avisos oficiais", desc: "Contatos usados exclusivamente para enviar comunicados importantes do condomínio." },
              { icon: Lock, title: "Sem propaganda", desc: "Nenhum dado é compartilhado com terceiros. Sem envio de publicidade." },
              { icon: UserX, title: "Descadastro a qualquer momento", desc: "Qualquer morador pode optar por não receber mais notificações quando quiser." },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 8 — CTA FINAL ── */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Pronto para organizar a comunicação do seu condomínio?
          </h2>
          <Button asChild size="lg" variant="secondary" className="touch-target text-base font-semibold px-8 mb-4">
            <Link to="/auth/signup/condominium">
              Criar canal oficial agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <p className="text-primary-foreground/80 text-sm mt-4">
            Comece gratuitamente e organize seus avisos hoje mesmo.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
