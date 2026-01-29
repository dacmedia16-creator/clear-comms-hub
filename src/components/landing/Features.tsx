import { 
  Bell, 
  Clock, 
  Filter, 
  Link2, 
  Lock, 
  MessageSquare, 
  Smartphone, 
  Zap 
} from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Timeline Cronológica",
    description: "Todos os avisos organizados por data, do mais recente ao mais antigo. Fácil de acompanhar.",
  },
  {
    icon: Filter,
    title: "Filtros por Categoria",
    description: "Informativo, Financeiro, Manutenção, Convivência, Segurança ou Urgente. Encontre rápido.",
  },
  {
    icon: Link2,
    title: "Link Privado",
    description: "Cada condomínio tem seu link único. Compartilhe apenas com moradores, sem login.",
  },
  {
    icon: MessageSquare,
    title: "Notificações Inteligentes",
    description: "WhatsApp e e-mail avisam sobre novos comunicados. O conteúdo fica registrado aqui.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Otimizado para celular. Moradores leem no ônibus, no elevador, em qualquer lugar.",
  },
  {
    icon: Lock,
    title: "Registro Oficial",
    description: "Todas as comunicações ficam documentadas. Evite discussões sobre 'eu não vi'.",
  },
  {
    icon: Zap,
    title: "Publicação em 1 Clique",
    description: "Crie o aviso, escolha as notificações e publique. Simples assim.",
  },
  {
    icon: Bell,
    title: "Avisos Fixados",
    description: "Destaque os comunicados mais importantes no topo da timeline.",
  },
];

export function Features() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tudo que você precisa para uma
            <br />
            <span className="text-primary">comunicação eficiente</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Ferramentas simples e poderosas para manter todos os moradores informados.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
