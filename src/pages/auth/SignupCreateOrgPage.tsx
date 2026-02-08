import { useState } from "react";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { getOrganizationConfig, OrganizationType, ORGANIZATION_TYPES } from "@/lib/organization-types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SignupCreateOrgPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orgName, setOrgName] = useState("");
  const [address, setAddress] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validate organization type
  if (!type || !(type in ORGANIZATION_TYPES)) {
    return <Navigate to="/auth/signup" replace />;
  }

  const orgType = type as OrganizationType;
  const config = getOrganizationConfig(orgType);
  const OrgIcon = config.icon;
  const { terms } = config;

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "Por favor, verifique se as senhas são iguais.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter no mínimo 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Create user account first
      const redirectUrl = `${window.location.origin}/dashboard`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone: phone.replace(/\D/g, ""),
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast({
            title: "Email já cadastrado",
            description: "Este email já está em uso. Tente fazer login ou use outro email.",
            variant: "destructive",
          });
        } else {
          throw authError;
        }
        return;
      }

      if (!authData.user) {
        throw new Error("Falha ao criar conta de usuário");
      }

      // 2. Wait for profile to be created by trigger, then get it
      let profile = null;
      let retries = 0;
      while (!profile && retries < 10) {
        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", authData.user.id)
          .maybeSingle();
        
        if (data) {
          profile = data;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }

      if (!profile) {
        throw new Error("Falha ao criar perfil de usuário");
      }

      // 3. Generate unique slug
      const { data: slugData, error: slugError } = await supabase.rpc("generate_unique_slug", {
        base_name: orgName,
      });

      if (slugError) throw slugError;

      // 4. Create organization
      const { data: org, error: orgError } = await supabase
        .from("condominiums")
        .insert({
          name: orgName,
          address: address || null,
          organization_type: orgType,
          slug: slugData,
          owner_id: profile.id,
          auth_owner_id: authData.user.id,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // 5. Create user_role as syndic (already approved since they're the creator)
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: profile.id,
        auth_user_id: authData.user.id,
        condominium_id: org.id,
        role: "syndic",
        is_approved: true,
      });

      if (roleError) throw roleError;

      toast({
        title: `${terms.organization} criada com sucesso!`,
        description: `Código de acesso: ${org.code}. Verifique seu email para confirmar sua conta.`,
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creating organization:", error);
      toast({
        title: "Erro ao criar organização",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link
          to={`/auth/signup/${orgType}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo with organization icon */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <OrgIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold text-foreground">{config.label}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-display font-bold text-center text-foreground mb-2">
            Criar {terms.organization}
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Configure seu canal oficial de comunicação
          </p>

          {/* Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Dados da {terms.organization}
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="orgName">Nome da {terms.organization} *</Label>
                  <Input
                    id="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={`Ex: ${terms.organization} Central`}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, bairro"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Manager Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Seus Dados ({terms.manager})
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  `Criar ${terms.organization}`
                )}
              </Button>
            </form>
          </Card>

          {/* Login link */}
          <p className="text-center text-muted-foreground mt-6">
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
