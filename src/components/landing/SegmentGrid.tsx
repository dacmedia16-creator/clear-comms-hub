import { 
  Building2, 
  Stethoscope, 
  Briefcase, 
  Users, 
  Church, 
  Store,
  GraduationCap,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

interface Segment {
  icon: React.ElementType;
  label: string;
  description: string;
  terms: {
    manager: string;
    member: string;
  };
  isNew?: boolean;
  link?: string;
}

const segments: Segment[] = [
  {
    icon: Building2,
    label: "Condomínios",
    description: "Síndicos e moradores",
    terms: { manager: "Síndico", member: "Morador" },
    link: "/condominios",
  },
  {
    icon: Stethoscope,
    label: "Clínicas e Saúde",
    description: "Gestores e pacientes",
    terms: { manager: "Administrador", member: "Paciente" },
    link: "/clinicas",
  },
  {
    icon: Briefcase,
    label: "Empresas",
    description: "Gestores e colaboradores",
    terms: { manager: "Gestor", member: "Colaborador" },
    link: "/empresas",
  },
  {
    icon: Users,
    label: "Associações e Clubes",
    description: "Presidentes e membros",
    terms: { manager: "Presidente", member: "Associado" },
    link: "/associacoes",
  },
  {
    icon: Church,
    label: "Igrejas",
    description: "Pastores e membros",
    terms: { manager: "Pastor", member: "Membro" },
    isNew: true,
    link: "/igrejas",
  },
  {
    icon: Store,
    label: "Franquias",
    description: "Franqueadores e franqueados",
    terms: { manager: "Franqueador", member: "Franqueado" },
    link: "/franquias",
  },
  {
    icon: GraduationCap,
    label: "Escolas e Cursos",
    description: "Diretores e alunos",
    terms: { manager: "Diretor", member: "Aluno" },
    isNew: true,
    link: "/escolas",
  },
];

export function SegmentGrid() {
  return (
    <section id="segmentos" className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Para todo tipo de organização
          </h2>
          <p className="text-lg text-muted-foreground">
            O AVISO PRO se adapta à linguagem e necessidades do seu segmento.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          {segments.map((segment) => {
            const content = (
              <>
                {segment.isNew && (
                  <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                    <Sparkles className="w-3 h-3" />
                    Novo
                  </div>
                )}
                <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-3">
                  <segment.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                  {segment.label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {segment.description}
                </p>
              </>
            );

            const classes = "relative flex flex-col items-center text-center p-5 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300";

            return segment.link ? (
              <Link key={segment.label} to={segment.link} className={classes}>
                {content}
              </Link>
            ) : (
              <div key={segment.label} className={classes}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
