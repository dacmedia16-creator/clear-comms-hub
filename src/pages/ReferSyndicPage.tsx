import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Bell, UserPlus, Loader2, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const referralSchema = z.object({
  syndicName: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  syndicPhone: z.string().trim().min(10, "Telefone inválido").max(20, "Telefone muito longo"),
  syndicEmail: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  condominiumName: z.string().trim().min(2, "Nome do condomínio obrigatório").max(200, "Nome muito longo"),
  referrerName: z.string().trim().max(100, "Nome muito longo").optional(),
});

type ReferralFormData = z.infer<typeof referralSchema>;

export default function ReferSyndicPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
  });

  const onSubmit = async (data: ReferralFormData) => {
    setIsLoading(true);

    try {
      const { data: result, error } = await supabase.functions.invoke("send-referral", {
        body: data,
      });

      if (error) {
        throw error;
      }

      if (result?.success) {
        setIsSuccess(true);
        reset();
        toast({
          title: "Indicação enviada!",
          description: "O síndico receberá sua indicação via WhatsApp e Email.",
        });
      } else {
        throw new Error(result?.error || "Erro ao enviar indicação");
      }
    } catch (error: any) {
      console.error("Referral error:", error);
      toast({
        title: "Erro ao enviar indicação",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container px-4 mx-auto py-4 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao site</span>
            </Link>
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">AVISO PRO</span>
            </Link>
          </div>
        </header>

        {/* Success Content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">Indicação Enviada!</CardTitle>
              <CardDescription className="text-base">
                O síndico receberá uma mensagem via WhatsApp e Email com informações sobre o AVISO PRO.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Obrigado por indicar! Você está ajudando a melhorar a comunicação do seu condomínio.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/">Voltar ao site</Link>
                </Button>
                <Button onClick={() => setIsSuccess(false)} className="flex-1">
                  Nova indicação
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container px-4 mx-auto py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao site</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">AVISO PRO</span>
          </Link>
        </div>
      </header>

      {/* Form Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <UserPlus className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Indique para seu Síndico</CardTitle>
            <CardDescription>
              Preencha os dados abaixo e enviaremos uma mensagem apresentando o AVISO PRO.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="syndicName">Nome do Síndico *</Label>
                <Input
                  id="syndicName"
                  placeholder="Ex: João Silva"
                  {...register("syndicName")}
                  disabled={isLoading}
                />
                {errors.syndicName && (
                  <p className="text-sm text-destructive">{errors.syndicName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="syndicPhone">Telefone do Síndico *</Label>
                <Input
                  id="syndicPhone"
                  type="tel"
                  placeholder="Ex: (11) 99999-9999"
                  {...register("syndicPhone")}
                  disabled={isLoading}
                />
                {errors.syndicPhone && (
                  <p className="text-sm text-destructive">{errors.syndicPhone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="syndicEmail">Email do Síndico *</Label>
                <Input
                  id="syndicEmail"
                  type="email"
                  placeholder="Ex: sindico@email.com"
                  {...register("syndicEmail")}
                  disabled={isLoading}
                />
                {errors.syndicEmail && (
                  <p className="text-sm text-destructive">{errors.syndicEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="condominiumName">Nome do Condomínio *</Label>
                <Input
                  id="condominiumName"
                  placeholder="Ex: Condomínio Jardins"
                  {...register("condominiumName")}
                  disabled={isLoading}
                />
                {errors.condominiumName && (
                  <p className="text-sm text-destructive">{errors.condominiumName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="referrerName">Seu Nome (opcional)</Label>
                <Input
                  id="referrerName"
                  placeholder="Ex: Maria Santos"
                  {...register("referrerName")}
                  disabled={isLoading}
                />
                {errors.referrerName && (
                  <p className="text-sm text-destructive">{errors.referrerName.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Será mencionado na mensagem enviada ao síndico.
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Indicação
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground pt-2">
                O síndico receberá uma mensagem via WhatsApp e Email apresentando o AVISO PRO.
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
