import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { SegmentGrid } from "@/components/landing/SegmentGrid";
import { UseCaseTabs } from "@/components/landing/UseCaseTabs";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TrustSection } from "@/components/landing/TrustSection";
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
        
        {/* Segment Grid - Shows all supported organization types */}
        <SegmentGrid />
        
        {/* Use Case Tabs - Interactive segment-specific content */}
        <UseCaseTabs />
        
        <section id="features">
          <FeatureShowcase />
        </section>
        
        <TrustSection />
        
        <section id="how-it-works">
          <HowItWorks />
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Crie o canal oficial da sua organização
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Teste grátis por 3 meses. Sem cartão, sem compromisso.
            </p>
            <Button asChild size="lg" className="touch-target text-base font-semibold px-8">
              <Link to="/auth/signup">
                Criar meu canal oficial
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
