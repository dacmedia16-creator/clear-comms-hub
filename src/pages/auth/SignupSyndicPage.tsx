import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, ArrowLeft, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";

const syndicSchema = z.object({
  condoCode: z.string().min(1, "Código obrigatório"),
  fullName: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  phone: z.string().optional(),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

interface CondoValidation {
  id: string;
  name: string;
}

export default function SignupSyndicPage() {
  const [condoCode, setCondoCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [validatingCondo, setValidatingCondo] = useState(false);
  const [validCondo, setValidCondo] = useState<CondoValidation | null>(null);
  const [condoError, setCondoError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Validate condo code with debounce
  useEffect(() => {
    const trimmedCode = condoCode.trim().toLowerCase();
    
    if (!trimmedCode) {
      setValidCondo(null);
      setCondoError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setValidatingCondo(true);
      setCondoError(null);
      
      // Check if it's a numeric code or a slug
      const isNumeric = /^\d+$/.test(trimmedCode);
      
      let query = supabase
        .from("condominiums")
        .select("id, name");
      
      if (isNumeric) {
        query = query.eq("code", parseInt(trimmedCode, 10));
      } else {
        query = query.eq("slug", trimmedCode);
      }
      
      const { data, error } = await query.single();
      
      setValidatingCondo(false);
      
      if (error || !data) {
        setValidCondo(null);
        setCondoError("Código de condomínio não encontrado");
      } else {
        setValidCondo(data);
        setCondoError(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [condoCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = syndicSchema.safeParse({
      condoCode,
      fullName,
      phone: phone || undefined,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (!validCondo) {
      setErrors({ condoCode: "Código de condomínio inválido" });
      return;
    }

    setLoading(true);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            phone: phone || undefined,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast({
            title: "Email já cadastrado",
            description: "Este email já está em uso. Tente fazer login.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao criar conta",
            description: authError.message,
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast({
          title: "Erro ao criar conta",
          description: "Não foi possível criar o usuário.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // 2. Wait for profile to be created by trigger, then link to condominium
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", authData.user.id)
        .single();

      if (profileError || !profile) {
        console.error("Error fetching profile:", profileError);
        toast({
          title: "Conta criada",
          description: "Sua conta foi criada, mas houve um erro ao vincular ao condomínio. Entre em contato com o administrador.",
          variant: "default",
        });
        navigate("/dashboard");
        return;
      }

      // 3. Link to condominium with syndic role (pending approval)
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: profile.id,
          condominium_id: validCondo.id,
          role: "syndic",
          is_approved: false, // Pending approval
        });

      if (roleError) {
        console.error("Error creating role:", roleError);
        toast({
          title: "Conta criada",
          description: "Sua conta foi criada, mas houve um erro ao vincular ao condomínio. Entre em contato com o administrador.",
          variant: "default",
        });
      } else {
        toast({
          title: "Cadastro enviado!",
          description: "Seu cadastro será analisado pelo administrador.",
        });
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link to="/auth/signup" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="font-display text-2xl">Cadastro de Síndico</CardTitle>
            <CardDescription>
              Solicite acesso como síndico de um condomínio existente
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Condo Code */}
              <div className="space-y-2">
                <Label htmlFor="condoCode">Código do Condomínio *</Label>
                <div className="relative">
                  <Input
                    id="condoCode"
                    type="text"
                    placeholder="ex: 101"
                    value={condoCode}
                    onChange={(e) => setCondoCode(e.target.value)}
                    className={`pr-10 ${errors.condoCode || condoError ? "border-destructive" : validCondo ? "border-green-500" : ""}`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {validatingCondo && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    {!validatingCondo && validCondo && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {!validatingCondo && condoError && <XCircle className="w-4 h-4 text-destructive" />}
                  </div>
                </div>
                {validCondo && (
                  <p className="text-sm text-green-600">{validCondo.name}</p>
                )}
                {condoError && (
                  <p className="text-sm text-destructive">{condoError}</p>
                )}
                {errors.condoCode && (
                  <p className="text-sm text-destructive">{errors.condoCode}</p>
                )}
                <p className="text-xs text-muted-foreground">Informe o código do condomínio que deseja gerenciar</p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Approval notice */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Após o cadastro, você precisará aguardar a aprovação do administrador do sistema.
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full touch-target" disabled={loading || !validCondo}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Solicitar acesso
              </Button>
            </form>

            <p className="text-center text-muted-foreground text-sm mt-6">
              Já tem uma conta?{" "}
              <Link to="/auth" className="text-primary hover:underline font-medium">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
