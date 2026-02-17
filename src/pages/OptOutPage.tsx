import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/logo.png";

type Status = "loading" | "success" | "already" | "error" | "invalid";

export default function OptOutPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("t");
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setMessage("Link inválido. Verifique se o link está correto.");
      return;
    }

    const processOptOut = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("whatsapp-optout", {
          body: { token },
        });

        if (error) {
          setStatus("error");
          setMessage("Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.");
          return;
        }

        if (data?.already) {
          setStatus("already");
          setMessage("Você já foi descadastrado anteriormente. Não receberá mais mensagens.");
        } else if (data?.success) {
          setStatus("success");
          setMessage("Pronto! Você não receberá mais mensagens deste número. Obrigado!");
        } else {
          setStatus("error");
          setMessage(data?.error || "Erro ao processar descadastro.");
        }
      } catch {
        setStatus("error");
        setMessage("Erro de conexão. Tente novamente mais tarde.");
      }
    };

    processOptOut();
  }, [token]);

  const icons = {
    loading: <Loader2 className="w-12 h-12 animate-spin text-primary" />,
    success: <CheckCircle2 className="w-12 h-12 text-primary" />,
    already: <AlertCircle className="w-12 h-12 text-muted-foreground" />,
    error: <XCircle className="w-12 h-12 text-destructive" />,
    invalid: <XCircle className="w-12 h-12 text-destructive" />,
  };

  const titles = {
    loading: "Processando...",
    success: "Descadastrado com sucesso",
    already: "Já descadastrado",
    error: "Erro",
    invalid: "Link inválido",
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-6">
          <img src={logo} alt="AvisoPro" className="h-10 mb-2" />

          {icons[status]}

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">{titles[status]}</h1>
            <p className="text-muted-foreground text-sm">{message || "Aguarde enquanto processamos sua solicitação..."}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
