import { AspectRatio } from "@/components/ui/aspect-ratio";

import timelineImg from "@/assets/screenshots/timeline.png";
import filtersImg from "@/assets/screenshots/filters.png";
import dashboardImg from "@/assets/screenshots/dashboard.png";
import whatsappImg from "@/assets/screenshots/whatsapp.png";

interface FeatureItem {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

const features: FeatureItem[] = [
  {
    title: "Tudo fica registrado",
    description:
      "Cada aviso tem data, hora e fica disponível para consulta. Fim do 'eu não vi'.",
    image: timelineImg,
    imageAlt: "Screenshot da linha do tempo de avisos",
  },
  {
    title: "Encontre rápido o que importa",
    description:
      "Urgente, financeiro, manutenção... Cada tipo de aviso no seu lugar.",
    image: filtersImg,
    imageAlt: "Screenshot dos filtros por categoria",
  },
  {
    title: "Você comprova que comunicou",
    description:
      "Histórico completo de avisos enviados. Documentação que protege o gestor.",
    image: dashboardImg,
    imageAlt: "Screenshot do painel de gestão",
  },
  {
    title: "Ninguém pode dizer que não viu",
    description:
      "WhatsApp e e-mail avisam sobre o novo comunicado. A informação oficial está na linha do tempo.",
    image: whatsappImg,
    imageAlt: "Exemplo de notificação via WhatsApp",
  },
];

export function FeatureShowcase() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Por que usar um canal oficial?
          </h2>
          <p className="text-lg text-muted-foreground">
            Clareza, registro e menos ruído na comunicação.
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
                    Benefício {index + 1}
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Image */}
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
                      <img
                        src={feature.image}
                        alt={feature.imageAlt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
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
