import { 
  Building2, 
  Stethoscope, 
  Briefcase, 
  Users, 
  Church, 
  Store 
} from "lucide-react";

interface Segment {
  icon: React.ElementType;
  label: string;
  description: string;
}

const segments: Segment[] = [
  {
    icon: Building2,
    label: "Condomínios",
    description: "Síndicos e moradores",
  },
  {
    icon: Stethoscope,
    label: "Clínicas e Saúde",
    description: "Gestores e pacientes",
  },
  {
    icon: Briefcase,
    label: "Empresas",
    description: "Gestores e colaboradores",
  },
  {
    icon: Users,
    label: "Associações e Clubes",
    description: "Presidentes e membros",
  },
  {
    icon: Church,
    label: "Igrejas",
    description: "Pastores e membros",
  },
  {
    icon: Store,
    label: "Franquias",
    description: "Franqueadores e franqueados",
  },
];

export function SegmentGrid() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
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
              className="flex flex-col items-center text-center p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                <segment.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                {segment.label}
              </h3>
              <p className="text-xs text-muted-foreground">
                {segment.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
