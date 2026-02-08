import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Bell, ArrowLeft } from "lucide-react";
import { ORGANIZATION_TYPE_OPTIONS } from "@/lib/organization-types";

export default function SignupTypePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold text-foreground">AVISO PRO</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-display font-bold text-center text-foreground mb-2">
            Qual é o seu segmento?
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Selecione o tipo de organização para continuar
          </p>

          {/* Grid of organization types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ORGANIZATION_TYPE_OPTIONS.map(({ value, label, icon: Icon, description, examples }) => (
              <Link key={value} to={`/auth/signup/${value}`}>
                <Card className="p-5 hover:border-primary hover:shadow-lg transition-all cursor-pointer group h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-display font-semibold text-foreground mb-1">
                        {label}
                      </h2>
                      <p className="text-muted-foreground text-sm mb-2">
                        {description}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Ex: {examples}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
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
