import { Shield, Lock, UserX } from "lucide-react";

const trustItems = [
  {
    icon: Shield,
    title: "Apenas avisos oficiais",
    description: "Os contatos são usados exclusivamente para enviar comunicados importantes da sua organização.",
  },
  {
    icon: Lock,
    title: "Sem propaganda, sem spam",
    description: "Nenhum dado é compartilhado com terceiros. Sem envio de publicidade ou mensagens indesejadas.",
  },
  {
    icon: UserX,
    title: "Descadastro a qualquer momento",
    description: "Qualquer pessoa pode optar por não receber mais notificações quando quiser.",
  },
];

export function TrustSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Seus contatos protegidos
          </h2>
          <p className="text-lg text-muted-foreground">
            Privacidade e transparência em cada comunicação.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {trustItems.map((item) => (
            <div key={item.title} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
