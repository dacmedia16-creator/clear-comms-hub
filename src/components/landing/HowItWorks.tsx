import { Building2, Edit3, Send, Eye } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Building2,
    title: "Cadastre seu Condomínio",
    description: "Crie sua conta gratuita e configure as informações do seu condomínio em poucos minutos.",
  },
  {
    number: "02",
    icon: Edit3,
    title: "Crie seus Avisos",
    description: "Escreva o comunicado, escolha a categoria, adicione anexos se necessário.",
  },
  {
    number: "03",
    icon: Send,
    title: "Publique e Notifique",
    description: "Com um clique, o aviso vai para a timeline e os moradores recebem a notificação.",
  },
  {
    number: "04",
    icon: Eye,
    title: "Moradores Visualizam",
    description: "Basta clicar no link para acessar a timeline completa. Sem login, sem complicação.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como funciona?
          </h2>
          <p className="text-lg text-muted-foreground">
            Em 4 passos simples, sua comunicação com os moradores será transformada.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[calc(100%+1rem)] w-[calc(100%-2rem)] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" />
              )}

              <div className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-32 h-32 rounded-2xl bg-accent flex items-center justify-center">
                    <step.icon className="w-12 h-12 text-primary" />
                  </div>
                  <span className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center shadow-lg">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-xl text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
