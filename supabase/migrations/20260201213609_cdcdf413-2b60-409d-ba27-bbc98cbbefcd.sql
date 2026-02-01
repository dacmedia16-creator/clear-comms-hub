-- 1. Criar tabela plans
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  announcements_per_month integer NOT NULL DEFAULT 10,
  max_attachment_size_mb integer NOT NULL DEFAULT 2,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  badge_class text NOT NULL DEFAULT 'bg-muted text-muted-foreground',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
ON public.plans FOR SELECT
USING (is_active = true OR is_super_admin());

CREATE POLICY "Super admins can manage plans"
ON public.plans FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- 3. Inserir planos existentes
INSERT INTO public.plans (slug, name, price, announcements_per_month, 
  max_attachment_size_mb, features, badge_class, display_order) VALUES
('free', 'Gratuito', 0, 10, 2, 
  '["Até 10 avisos/mês", "Anexos até 2MB", "Timeline pública"]',
  'bg-muted text-muted-foreground', 1),
('starter', 'Inicial', 19900, 50, 5,
  '["Até 50 avisos/mês", "Anexos até 5MB", "Notificações por email", "Suporte prioritário"]',
  'bg-amber-100 text-amber-700', 2),
('pro', 'Profissional', 29900, -1, 10,
  '["Avisos ilimitados", "Anexos até 10MB", "Email + WhatsApp", "Relatórios", "API de integração"]',
  'bg-primary/10 text-primary', 3);

-- 4. Alterar coluna condominiums.plan de ENUM para TEXT
ALTER TABLE public.condominiums 
  ALTER COLUMN plan TYPE text USING plan::text;

-- 5. Trigger para updated_at
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();