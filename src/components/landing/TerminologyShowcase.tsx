import { useState } from "react";
import { Building2, Briefcase, Church, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TermMapping {
  condominium: string;
  company: string;
  church: string;
}

const termMappings: { label: string; terms: TermMapping }[] = [
  {
    label: "Gestor",
    terms: { condominium: "Síndico", company: "Gestor", church: "Pastor" },
  },
  {
    label: "Membro",
    terms: { condominium: "Morador", company: "Colaborador", church: "Membro" },
  },
  {
    label: "Localização",
    terms: { condominium: "Bloco", company: "Departamento", church: "Ministério" },
  },
  {
    label: "Sublocalização",
    terms: { condominium: "Unidade", company: "Cargo", church: "Grupo" },
  },
];

const segments = [
  { id: "condominium", label: "Condomínio", icon: Building2 },
  { id: "company", label: "Empresa", icon: Briefcase },
  { id: "church", label: "Igreja", icon: Church },
] as const;

type SegmentId = (typeof segments)[number]["id"];

export function TerminologyShowcase() {
  const [activeSegment, setActiveSegment] = useState<SegmentId>("condominium");

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Sua linguagem,
            <br />
            <span className="text-primary">seu sistema</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            O AVISO PRO adapta automaticamente toda a terminologia para o vocabulário da sua organização.
          </p>
        </div>

        {/* Segment Selector */}
        <div className="flex justify-center gap-3 mb-10">
          {segments.map((segment) => (
            <button
              key={segment.id}
              onClick={() => setActiveSegment(segment.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300",
                activeSegment === segment.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <segment.icon className="w-5 h-5" />
              {segment.label}
            </button>
          ))}
        </div>

        {/* Terminology Cards */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-lg">
            <div className="grid sm:grid-cols-2 gap-4">
              {termMappings.map((mapping) => (
                <div
                  key={mapping.label}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
                >
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {mapping.label}
                    </span>
                    <p className="font-display font-semibold text-lg text-foreground mt-1">
                      {mapping.terms[activeSegment]}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                </div>
              ))}
            </div>

            {/* Info banner */}
            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground font-medium">
                    Campos opcionais para segmentos flexíveis
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Empresas, clínicas, igrejas e comunidades não precisam preencher localização obrigatoriamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
