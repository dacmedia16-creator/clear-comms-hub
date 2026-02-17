import { MessageSquareOff, EyeOff, Search, RefreshCw } from "lucide-react";

const painPoints = [
  {
    icon: MessageSquareOff,
    title: "Avisos perdidos em grupos",
    description: "Mensagens importantes somem entre memes, áudios e conversas paralelas.",
  },
  {
    icon: EyeOff,
    title: "'Eu não vi'",
    description: "Moradores e membros dizem que não foram avisados. Sem registro, não há como comprovar.",
  },
  {
    icon: Search,
    title: "Informação difícil de encontrar",
    description: "Precisa de um aviso antigo? Boa sorte rolando o histórico do grupo.",
  },
  {
    icon: RefreshCw,
    title: "Desgaste para quem comunica",
    description: "Repetir a mesma informação várias vezes gera retrabalho e frustração.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            A comunicação da sua organização
            <br />
            <span className="text-primary">está espalhada?</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {painPoints.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border shadow-sm"
            >
              <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                <item.icon className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-10 max-w-lg mx-auto">
          Isso gera ruído, retrabalho e desgaste. <span className="font-semibold text-foreground">Existe uma forma melhor.</span>
        </p>
      </div>
    </section>
  );
}
