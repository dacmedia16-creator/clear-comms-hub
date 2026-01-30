import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";
import { SalesChatbot } from "@/components/landing/SalesChatbot";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Hero />
        
        <section id="features">
          <FeatureShowcase />
        </section>
        
        <section id="how-it-works">
          <HowItWorks />
        </section>
        
        <section id="pricing">
          <Pricing />
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pronto para transformar a comunicação do seu condomínio?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Configure em minutos e transforme a comunicação do seu condomínio.
            </p>
            <Button asChild size="lg" className="touch-target text-base font-semibold px-8">
              <Link to="/auth">
                Começar agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      
      <SalesChatbot />
    </div>
  );
};

export default Index;
