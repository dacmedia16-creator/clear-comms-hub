import { 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Stethoscope, 
  Dumbbell, 
  Church, 
  Users, 
  Landmark 
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
    icon: GraduationCap,
    label: "Escolas",
    description: "Diretores e pais",
  },
  {
    icon: Briefcase,
    label: "Empresas",
    description: "RH e colaboradores",
  },
  {
    icon: Stethoscope,
    label: "Clínicas",
    description: "Gestores e pacientes",
  },
  {
    icon: Dumbbell,
    label: "Academias",
    description: "Proprietários e alunos",
  },
  {
    icon: Church,
    label: "Igrejas",
    description: "Pastores e membros",
  },
  {
    icon: Landmark,
    label: "Clubes",
    description: "Diretoria e sócios",
  },
  {
    icon: Users,
    label: "Associações",
    description: "Presidentes e associados",
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

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
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
