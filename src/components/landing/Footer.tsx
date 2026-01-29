import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 md:py-16">
      <div className="container px-4 mx-auto">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">AVISO PRO</span>
            </Link>
            <p className="text-background/70 max-w-md">
              O canal oficial de comunicação do seu condomínio. Centralize informações, 
              notifique moradores e mantenha tudo registrado.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Produto</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/demo" className="text-background/70 hover:text-background transition-colors">
                  Demonstração
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="text-background/70 hover:text-background transition-colors">
                  Planos e Preços
                </Link>
              </li>
              <li>
                <Link to="/#features" className="text-background/70 hover:text-background transition-colors">
                  Funcionalidades
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/termos" className="text-background/70 hover:text-background transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-background/70 hover:text-background transition-colors">
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 text-center text-background/50 text-sm">
          <p>© {new Date().getFullYear()} AVISO PRO. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
