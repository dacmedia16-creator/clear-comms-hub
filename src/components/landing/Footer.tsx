import { Bell, MapPin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 md:py-16">
      <div className="container px-4 mx-auto">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">AVISO PRO</span>
            </Link>
            <p className="text-background/70 text-sm">
              O canal oficial de comunicação do seu condomínio.
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
                <Link to="/#features" className="text-background/70 hover:text-background transition-colors">
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link to="/indicar-sindico" className="text-background/70 hover:text-background transition-colors">
                  Indique para seu síndico
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

          {/* Contato */}
          <div>
            <h4 className="font-display font-semibold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-background/70">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-sm">
                  Rua Horacio Cenci, 9 - Parque Campolim<br />
                  Sorocaba - SP, 18047-800
                </span>
              </li>
              <li>
                <a 
                  href="https://wa.me/5515981788214" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-background/70 hover:text-background transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">(15) 98178-8214</span>
                </a>
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
