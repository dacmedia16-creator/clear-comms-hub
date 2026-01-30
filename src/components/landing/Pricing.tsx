import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { PLANS } from "@/lib/constants";

export function Pricing() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Planos simples e transparentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Escolha o plano ideal para seu condomínio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Starter Plan - Highlighted */}
          <div className="bg-card rounded-2xl border-2 border-primary p-8 flex flex-col relative shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                Popular
              </span>
            </div>

            <div className="mb-6">
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                {PLANS.starter.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-foreground">R$ {PLANS.starter.price}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {PLANS.starter.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button asChild size="lg" className="w-full touch-target">
              <Link to="/auth">Escolher plano</Link>
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-card rounded-2xl border border-border p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                {PLANS.pro.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-foreground">R$ {PLANS.pro.price}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {PLANS.pro.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button asChild variant="outline" size="lg" className="w-full touch-target">
              <Link to="/auth">Escolher plano</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
