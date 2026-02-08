import { useState } from "react";
import { 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Stethoscope, 
  Dumbbell, 
  Church,
  CheckCircle,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UseCase {
  title: string;
  description: string;
}

interface SegmentData {
  id: string;
  icon: LucideIcon;
  label: string;
  headline: string;
  subheadline: string;
  useCases: UseCase[];
  ctaText: string;
}

const segmentsData: SegmentData[] = [
  {
    id: "condominium",
    icon: Building2,
    label: "Condomínios",
    headline: "Comunicação oficial para seu condomínio",
    subheadline: "Reduza ruído e aumente clareza. Moradores informados, síndico protegido.",
    useCases: [
      { title: "Assembleias e votações", description: "Convoque e documente todas as decisões" },
      { title: "Manutenções programadas", description: "Avise sobre obras e interrupções" },
      { title: "Regras de convivência", description: "Comunique normas sem discussão" },
      { title: "Boletos e prestações", description: "Lembretes financeiros oficiais" },
    ],
    ctaText: "Sou Síndico",
  },
  {
    id: "school",
    icon: GraduationCap,
    label: "Escolas",
    headline: "Mantenha pais e alunos informados",
    subheadline: "Comunicação escolar organizada. Menos grupos, mais clareza.",
    useCases: [
      { title: "Reuniões de pais", description: "Convites e pautas documentados" },
      { title: "Calendário escolar", description: "Feriados, provas e eventos" },
      { title: "Avisos pedagógicos", description: "Notas, boletins e comunicados" },
      { title: "Eventos e festas", description: "Organize com antecedência" },
    ],
    ctaText: "Sou Diretor",
  },
  {
    id: "company",
    icon: Briefcase,
    label: "Empresas",
    headline: "Comunicados corporativos sem ruído",
    subheadline: "Do RH ao colaborador em segundos. Tudo documentado.",
    useCases: [
      { title: "Comunicados de RH", description: "Benefícios, políticas e avisos" },
      { title: "Compliance e normas", description: "Registre comunicações oficiais" },
      { title: "Treinamentos", description: "Convocações e materiais" },
      { title: "Eventos corporativos", description: "Confraternizações e reuniões" },
    ],
    ctaText: "Sou Gestor",
  },
  {
    id: "clinic",
    icon: Stethoscope,
    label: "Clínicas",
    headline: "Pacientes sempre informados",
    subheadline: "Horários, procedimentos e campanhas de saúde.",
    useCases: [
      { title: "Horários de atendimento", description: "Alterações e feriados" },
      { title: "Campanhas de saúde", description: "Vacinação e prevenção" },
      { title: "Procedimentos", description: "Orientações pré e pós-consulta" },
      { title: "Novos serviços", description: "Especialidades e exames" },
    ],
    ctaText: "Sou Administrador",
  },
  {
    id: "gym",
    icon: Dumbbell,
    label: "Academias",
    headline: "Alunos engajados e informados",
    subheadline: "Horários, treinos e eventos fitness.",
    useCases: [
      { title: "Grade de aulas", description: "Horários e substituições" },
      { title: "Manutenção de equipamentos", description: "Avise sobre interdições" },
      { title: "Eventos e desafios", description: "Competições e workshops" },
      { title: "Promoções", description: "Planos e renovações" },
    ],
    ctaText: "Sou Proprietário",
  },
  {
    id: "church",
    icon: Church,
    label: "Igrejas",
    headline: "Comunique com sua comunidade",
    subheadline: "Cultos, eventos e ações sociais organizados.",
    useCases: [
      { title: "Programação de cultos", description: "Horários e pregadores" },
      { title: "Eventos especiais", description: "Retiros, conferências e batismos" },
      { title: "Ações sociais", description: "Campanhas e voluntariado" },
      { title: "Avisos pastorais", description: "Comunicados da liderança" },
    ],
    ctaText: "Sou Pastor",
  },
];

export function UseCaseTabs() {
  const [activeSegment, setActiveSegment] = useState(segmentsData[0]);

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Casos de uso para
            <br />
            <span className="text-primary">cada segmento</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Veja como o AVISO PRO resolve problemas específicos do seu tipo de organização.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10">
          {segmentsData.map((segment) => (
            <button
              key={segment.id}
              onClick={() => setActiveSegment(segment)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                activeSegment.id === segment.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <segment.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{segment.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-3xl border border-border p-6 md:p-10 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Left side - Headlines */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <activeSegment.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-primary">{activeSegment.label}</span>
                </div>
                
                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                  {activeSegment.headline}
                </h3>
                
                <p className="text-muted-foreground text-lg mb-6">
                  {activeSegment.subheadline}
                </p>

                <a
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
                >
                  {activeSegment.ctaText}
                  <span className="text-primary-foreground/70">→</span>
                </a>
              </div>

              {/* Right side - Use cases */}
              <div className="flex-1">
                <div className="space-y-4">
                  {activeSegment.useCases.map((useCase, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground text-sm mb-0.5">
                          {useCase.title}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {useCase.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
