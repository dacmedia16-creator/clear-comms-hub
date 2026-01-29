-- Adicionar coluna notification_sms na tabela condominiums
ALTER TABLE public.condominiums 
ADD COLUMN notification_sms boolean DEFAULT false;

-- Criar tabela sms_logs
CREATE TABLE public.sms_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id uuid REFERENCES public.announcements(id) ON DELETE SET NULL,
  condominium_id uuid REFERENCES public.condominiums(id) ON DELETE SET NULL,
  recipient_phone text NOT NULL,
  recipient_name text,
  status text DEFAULT 'pending',
  error_message text,
  sent_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Habilitar RLS
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- Politica para super admins visualizarem todos os logs
CREATE POLICY "Super admins can view all sms_logs"
  ON public.sms_logs FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- Politica para gestores visualizarem logs do seu condominio
CREATE POLICY "Condo managers can view their sms_logs"
  ON public.sms_logs FOR SELECT
  TO authenticated
  USING (public.can_manage_condominium(condominium_id));

-- Politica para inserir logs
CREATE POLICY "Insert sms_logs"
  ON public.sms_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.can_manage_condominium(condominium_id) OR public.is_super_admin());