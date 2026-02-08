import { Link, useParams, Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, Briefcase, PlusCircle } from "lucide-react";
import { getOrganizationConfig, OrganizationType, ORGANIZATION_TYPES } from "@/lib/organization-types";

export default function SignupRolePage() {
  const { type } = useParams<{ type: string }>();

  // Validate organization type
  if (!type || !(type in ORGANIZATION_TYPES)) {
    return <Navigate to="/auth/signup" replace />;
  }

  const orgType = type as OrganizationType;
  const config = getOrganizationConfig(orgType);
  const OrgIcon = config.icon;
  const { terms } = config;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link to="/auth/signup" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          {/* Logo with organization icon */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <OrgIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold text-foreground">{config.label}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-display font-bold text-center text-foreground mb-2">
            Como você quer usar o AVISO PRO?
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Escolha o seu perfil para continuar
          </p>

          {/* Options - 3 columns on larger screens */}
          <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
            {/* Member */}
            <Link to={`/auth/signup/${orgType}/member`}>
              <Card className="p-6 md:p-8 hover:border-primary hover:shadow-lg transition-all cursor-pointer group h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                      Sou {terms.member}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Já tenho um código de acesso
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Manager */}
            <Link to={`/auth/signup/${orgType}/manager`}>
              <Card className="p-6 md:p-8 hover:border-primary hover:shadow-lg transition-all cursor-pointer group h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Briefcase className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                      Sou {terms.manager}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Já existe um código de acesso
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Create New Organization */}
            <Link to={`/auth/signup/${orgType}/create`}>
              <Card className="p-6 md:p-8 hover:border-primary hover:shadow-lg transition-all cursor-pointer group h-full border-dashed">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <PlusCircle className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                      Criar {terms.organization}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Quero criar um canal oficial
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* Login link */}
          <p className="text-center text-muted-foreground mt-8">
            Já tem uma conta?{" "}
            <Link to="/auth" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
