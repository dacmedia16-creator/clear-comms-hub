import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Bell, ArrowLeft, Home, Building2 } from "lucide-react";

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
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold text-foreground">AVISO PRO</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-display font-bold text-center text-foreground mb-8">
            Como você quer usar o AVISO PRO?
          </h1>

          {/* Options */}
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {/* Morador */}
            <Link to="/auth/signup/resident">
              <Card className="p-6 md:p-8 hover:border-primary hover:shadow-lg transition-all cursor-pointer group h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Home className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                      Sou Morador
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Quero receber os avisos do meu condomínio
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Síndico */}
            <Link to="/auth/signup/syndic">
              <Card className="p-6 md:p-8 hover:border-primary hover:shadow-lg transition-all cursor-pointer group h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                      Sou Síndico
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Quero criar e gerenciar os avisos do condomínio
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
