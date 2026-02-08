import { 
  Building2, 
  Stethoscope, 
  Briefcase, 
  Users, 
  Church, 
  Store,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Segment {
  icon: React.ElementType;
  label: string;
  description: string;
  terms: {
    manager: string;
    member: string;
  };
  isNew?: boolean;
}

const segments: Segment[] = [
  {
    icon: Building2,
    label: "Condomínios",
    description: "Síndicos e moradores",
    terms: { manager: "Síndico", member: "Morador" },
  },
  {
    icon: Stethoscope,
    label: "Clínicas e Saúde",
    description: "Gestores e pacientes",
    terms: { manager: "Administrador", member: "Paciente" },
  },
  {
    icon: Briefcase,
    label: "Empresas",
    description: "Gestores e colaboradores",
    terms: { manager: "Gestor", member: "Colaborador" },
  },
  {
    icon: Users,
    label: "Associações e Clubes",
    description: "Presidentes e membros",
    terms: { manager: "Presidente", member: "Associado" },
  },
  {
    icon: Church,
    label: "Igrejas",
    description: "Pastores e membros",
    terms: { manager: "Pastor", member: "Membro" },
    isNew: true,
  },
  {
    icon: Store,
    label: "Franquias",
    description: "Franqueadores e franqueados",
    terms: { manager: "Franqueador", member: "Franqueado" },
    isNew: true,
  },
];

export function SegmentGrid() {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  return (
    <section id="segmentos" className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Um canal oficial para
            <br />
            <span className="text-primary">cada tipo de organização</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            O AVISO PRO se adapta à linguagem e necessidades do seu segmento.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {segments.map((segment) => (
            <div
              key={segment.label}
              onMouseEnter={() => setHoveredSegment(segment.label)}
              onMouseLeave={() => setHoveredSegment(null)}
              className={cn(
                "relative flex flex-col items-center text-center p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 group cursor-pointer",
                hoveredSegment === segment.label && "border-primary/50 shadow-md"
              )}
            >
              {/* New badge */}
              {segment.isNew && (
                <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                  <Sparkles className="w-3 h-3" />
                  Novo
                </div>
              )}

              <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                <segment.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                {segment.label}
              </h3>
              
              {/* Description or Terms on hover */}
              <div className="h-8 overflow-hidden">
                <p className={cn(
                  "text-xs transition-all duration-300",
                  hoveredSegment === segment.label 
                    ? "text-primary font-medium" 
                    : "text-muted-foreground"
                )}>
                  {hoveredSegment === segment.label 
                    ? `${segment.terms.manager} → ${segment.terms.member}`
                    : segment.description
                  }
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom info */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Passe o mouse para ver a terminologia adaptada de cada segmento
        </p>
      </div>
    </section>
  );
}
