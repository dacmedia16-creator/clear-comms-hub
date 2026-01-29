
# Plano: Fluxo de Cadastro com Selecao de Perfil (Morador ou Sindico)

## Resumo

Criar uma nova pagina intermediaria que aparece ao clicar em "Criar conta". O usuario escolhe seu perfil (Morador ou Sindico) antes de prosseguir com o cadastro. Para moradores, sera necessario informar o codigo do condominio (slug).

---

## Fluxo do Usuario

```text
Usuario clica em "Criar conta"
         |
         v
   Nova pagina: /auth/signup
   "Como voce quer usar o AVISO PRO?"
         |
         v
   +------------------+  +------------------+
   |   SOU MORADOR    |  |   SOU SINDICO    |
   |                  |  |                  |
   | Quero acompanhar |  | Quero gerenciar  |
   | os avisos do meu |  | a comunicacao do |
   | condominio       |  | meu condominio   |
   +------------------+  +------------------+
         |                      |
         v                      v
   Formulario Morador      Formulario Sindico
   - Codigo do condominio  - Nome completo
   - Nome completo         - Email
   - Email                 - Telefone
   - Telefone              - Senha
   - Bloco/Unidade         - Confirmar senha
   - Senha
   - Confirmar senha
         |                      |
         v                      v
   Cria conta + vincula    Cria conta como
   ao condominio           syndic (sem condo)
         |                      |
         v                      v
      Dashboard             Dashboard
   (ve timeline)         (pode criar condo)
```

---

## Novas Rotas

| Rota | Componente | Descricao |
|------|------------|-----------|
| `/auth/signup` | `SignupTypePage` | Escolha do tipo de cadastro |
| `/auth/signup/resident` | `SignupResidentPage` | Formulario para moradores |
| `/auth/signup/syndic` | `SignupSyndicPage` | Formulario para sindicos |
| `/auth` | `AuthPage` | Apenas login (sem signup toggle) |

---

## Interface do Usuario

### Pagina 1: Escolha do Tipo (/auth/signup)

```text
+------------------------------------------+
|  <- Voltar                               |
+------------------------------------------+
|                                          |
|            [Logo AVISO PRO]              |
|                                          |
|   Como voce quer usar o AVISO PRO?       |
|                                          |
|   +----------------+  +----------------+ |
|   |                |  |                | |
|   |   [Icone]      |  |   [Icone]      | |
|   |                |  |                | |
|   | Sou Morador    |  | Sou Sindico    | |
|   |                |  |                | |
|   | Quero receber  |  | Quero criar e  | |
|   | os avisos do   |  | gerenciar os   | |
|   | meu condominio |  | avisos         | |
|   +----------------+  +----------------+ |
|                                          |
|   Ja tem uma conta? Entrar               |
+------------------------------------------+
```

### Pagina 2a: Cadastro Morador (/auth/signup/resident)

```text
+------------------------------------------+
|  <- Voltar                               |
+------------------------------------------+
|                                          |
|   Cadastro de Morador                    |
|   Entre com o codigo do seu condominio   |
|                                          |
|   Codigo do Condominio *                 |
|   [____________________________]         |
|   (Solicite ao seu sindico)              |
|                                          |
|   Nome Completo *                        |
|   [____________________________]         |
|                                          |
|   Telefone *                             |
|   [____________________________]         |
|                                          |
|   Email *                                |
|   [____________________________]         |
|                                          |
|   Bloco e Unidade *                      |
|   [____________________________]         |
|                                          |
|   Senha *                                |
|   [____________________________]         |
|                                          |
|   Confirmar Senha *                      |
|   [____________________________]         |
|                                          |
|          [Criar minha conta]             |
+------------------------------------------+
```

### Pagina 2b: Cadastro Sindico (/auth/signup/syndic)

```text
+------------------------------------------+
|  <- Voltar                               |
+------------------------------------------+
|                                          |
|   Cadastro de Sindico                    |
|   Crie sua conta para gerenciar seu      |
|   condominio                             |
|                                          |
|   Nome Completo *                        |
|   [____________________________]         |
|                                          |
|   Telefone                               |
|   [____________________________]         |
|                                          |
|   Email *                                |
|   [____________________________]         |
|                                          |
|   Senha *                                |
|   [____________________________]         |
|                                          |
|   Confirmar Senha *                      |
|   [____________________________]         |
|                                          |
|          [Criar minha conta]             |
+------------------------------------------+
```

---

## Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/pages/auth/SignupTypePage.tsx` | Criar | Pagina de escolha do tipo |
| `src/pages/auth/SignupResidentPage.tsx` | Criar | Formulario de morador |
| `src/pages/auth/SignupSyndicPage.tsx` | Criar | Formulario de sindico |
| `src/pages/AuthPage.tsx` | Modificar | Remover modo signup, manter apenas login |
| `src/App.tsx` | Modificar | Adicionar novas rotas |
| `src/components/landing/Header.tsx` | Modificar | Atualizar link "Criar conta" |
| `src/components/landing/Hero.tsx` | Modificar | Atualizar links CTA |
| `src/hooks/useAuth.tsx` | Modificar | Suportar dados adicionais no signup |

---

## Secao Tecnica

### Validacao do Codigo do Condominio

O codigo do condominio sera o campo `slug` da tabela `condominiums`. O sistema validara em tempo real se o codigo existe:

```typescript
const validateCondoCode = async (code: string) => {
  const { data, error } = await supabase
    .from("condominiums")
    .select("id, name")
    .eq("slug", code.toLowerCase().trim())
    .single();
  
  return { condominium: data, error };
};
```

### Fluxo de Cadastro do Morador

```typescript
// 1. Criar conta no auth
const { data: authData, error: authError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/`,
    data: { full_name: fullName, phone },
  },
});

// 2. Aguardar trigger criar profile

// 3. Vincular ao condominio com role 'resident'
const { data: profile } = await supabase
  .from("profiles")
  .select("id")
  .eq("user_id", authData.user.id)
  .single();

await supabase.from("user_roles").insert({
  user_id: profile.id,
  condominium_id: condominiumId,
  role: "resident",
  unit: blocoUnidade,
});
```

### Atualizacao do Trigger handle_new_user

O trigger existente ja cria o profile automaticamente. Precisamos atualizar para incluir o telefone:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$;
```

### Schema de Validacao (Zod)

```typescript
const residentSchema = z.object({
  condoCode: z.string().min(1, "Codigo obrigatorio"),
  fullName: z.string().min(2).max(100),
  phone: z.string().min(10, "Telefone invalido"),
  email: z.string().email("Email invalido"),
  unit: z.string().min(1, "Bloco/Unidade obrigatorio"),
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Senhas nao conferem",
  path: ["confirmPassword"],
});

const syndicSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().optional(),
  email: z.string().email("Email invalido"),
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Senhas nao conferem",
  path: ["confirmPassword"],
});
```

---

## Atualizacao de Links

Todos os links "Criar conta" serao atualizados:

| Local | De | Para |
|-------|-----|------|
| Header (desktop) | `/auth?mode=signup` | `/auth/signup` |
| Header (mobile) | `/auth?mode=signup` | `/auth/signup` |
| Hero CTA | `/auth` | `/auth/signup` |
| AuthPage (rodape) | Toggle interno | Link `/auth/signup` |

---

## Resultado Final

Apos implementacao:

1. Clique em "Criar conta" abre pagina de selecao de tipo
2. Morador informa codigo do condominio + dados pessoais + unidade
3. Sindico informa apenas dados pessoais (criara condominio depois)
4. Validacao do codigo em tempo real com feedback visual
5. Vinculacao automatica do morador ao condominio com role correto
6. Sindico redirecionado ao dashboard para criar seu condominio
