import { Building2, MessageSquareText, Video, Sparkles } from "lucide-react";

const highlights = [
  {
    icon: Building2,
    title: "6 Segmentos",
    description: "Condomínios, Empresas, Clínicas, Igrejas, Comunidades e Franquias",
  },
  {
    icon: MessageSquareText,
    title: "Terminologia Adaptada",
    description: "Cada organização usa sua própria linguagem automaticamente",
  },
  {
    icon: Video,
    title: "Upload de Vídeos",
    description: "Até 300MB por vídeo na linha do tempo oficial",
  },
];

export function HighlightsBar() {
  return (
    <section className="py-10 md:py-14 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-y border-border/50">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Novidades
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
