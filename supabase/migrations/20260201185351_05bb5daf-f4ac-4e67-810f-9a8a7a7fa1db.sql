-- Criar tabela para armazenar indicações de síndicos
CREATE TABLE public.syndic_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syndic_name TEXT NOT NULL,
  syndic_phone TEXT NOT NULL,
  syndic_email TEXT NOT NULL,
  condominium_name TEXT NOT NULL,
  referrer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending',
  whatsapp_sent BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  notes TEXT
);

-- Habilitar RLS
ALTER TABLE public.syndic_referrals ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT público (formulário sem autenticação)
CREATE POLICY "Allow public insert on syndic_referrals"
ON public.syndic_referrals
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Super admin pode ver todas as indicações
CREATE POLICY "Super admins can view all referrals"
ON public.syndic_referrals
FOR SELECT
TO authenticated
USING (is_super_admin());

-- Super admin pode atualizar indicações
CREATE POLICY "Super admins can update referrals"
ON public.syndic_referrals
FOR UPDATE
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Super admin pode deletar indicações
CREATE POLICY "Super admins can delete referrals"
ON public.syndic_referrals
FOR DELETE
TO authenticated
USING (is_super_admin());