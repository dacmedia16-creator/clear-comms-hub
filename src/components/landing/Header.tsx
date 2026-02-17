import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { Link } from "react-router-dom";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="AVISO PRO" className="h-9 w-auto rounded-lg" />
            <span className="font-display text-xl font-bold text-foreground">AVISO PRO</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              Como funciona
            </a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Benefícios
            </a>
            <a href="#segmentos" className="text-muted-foreground hover:text-foreground transition-colors">
              Para quem é
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/auth/signup">Criar canal</Link>
            </Button>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 touch-target"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                Como funciona
              </a>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                Benefícios
              </a>
              <a href="#segmentos" className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                Para quem é
              </a>
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Button asChild variant="outline" className="w-full touch-target">
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button asChild className="w-full touch-target">
                  <Link to="/auth/signup">Criar canal</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
