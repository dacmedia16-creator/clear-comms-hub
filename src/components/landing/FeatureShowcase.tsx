import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

interface FeatureItem {
  title: string;
  description: string;
  imagePlaceholder: string;
  imageAlt: string;
}

const features: FeatureItem[] = [
  {
    title: "Timeline Cronológica",
    description:
      "Todos os avisos do condomínio organizados por data, do mais recente ao mais antigo. Moradores acompanham tudo em um só lugar, sem perder nenhuma informação importante.",
    imagePlaceholder: "Timeline de avisos",
    imageAlt: "Screenshot da timeline de avisos do sistema",
  },
  {
    title: "Filtros por Categoria",
    description:
      "Informativo, Financeiro, Manutenção, Convivência, Segurança ou Urgente. Encontre rapidamente o que procura com filtros visuais e intuitivos.",
    imagePlaceholder: "Filtros de categoria",
    imageAlt: "Screenshot dos filtros por categoria",
  },
  {
    title: "Dashboard do Síndico",
    description:
      "Painel completo para criar, editar e gerenciar todos os comunicados. Visualize estatísticas de leitura e gerencie membros do condomínio.",
    imagePlaceholder: "Dashboard administrativo",
    imageAlt: "Screenshot do dashboard do síndico",
  },
  {
    title: "Notificações Instantâneas",
    description:
      "WhatsApp e e-mail avisam automaticamente sobre novos comunicados. Moradores ficam informados em tempo real, onde estiverem.",
    imagePlaceholder: "Notificação WhatsApp",
    imageAlt: "Exemplo de notificação via WhatsApp",
  },
];

function FeaturePlaceholder({ text }: { text: string }) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-muted to-muted/50 rounded-xl border border-border flex items-center justify-center">
      <div className="text-center p-8">
        <Skeleton className="w-16 h-16 rounded-lg mx-auto mb-4" />
        <p className="text-muted-foreground text-sm font-medium">{text}</p>
        <p className="text-muted-foreground/60 text-xs mt-1">
          Imagem em breve
        </p>
      </div>
    </div>
  );
}

export function FeatureShowcase() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Conheça o sistema por dentro
          </h2>
          <p className="text-lg text-muted-foreground">
            Veja como o Mural Digital facilita a comunicação do seu condomínio.
          </p>
        </div>

        <div className="space-y-16 md:space-y-24">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={feature.title}
                className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
              >
                {/* Text content */}
                <div
                  className={`${
                    isEven ? "lg:order-1" : "lg:order-2"
                  } order-2`}
                >
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
                    Funcionalidade {index + 1}
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Image placeholder */}
                <div
                  className={`${
                    isEven ? "lg:order-2" : "lg:order-1"
                  } order-1`}
                >
                  <div className="rounded-2xl overflow-hidden shadow-xl border border-border/50 bg-card">
                    <div className="bg-muted/30 px-4 py-2 border-b border-border/50 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive/60" />
                      <div className="w-3 h-3 rounded-full bg-accent-foreground/40" />
                      <div className="w-3 h-3 rounded-full bg-primary/60" />
                    </div>
                    <AspectRatio ratio={16 / 9}>
                      <FeaturePlaceholder text={feature.imagePlaceholder} />
                    </AspectRatio>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
