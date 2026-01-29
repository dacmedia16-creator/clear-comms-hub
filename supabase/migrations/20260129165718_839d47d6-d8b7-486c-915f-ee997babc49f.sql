-- 1. Add phone column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone text;

COMMENT ON COLUMN public.profiles.phone IS 
  'Telefone no formato internacional E.164 (ex: +5511999999999)';

-- 2. Create whatsapp_logs table for tracking message delivery
CREATE TABLE public.whatsapp_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id uuid REFERENCES public.announcements(id) ON DELETE CASCADE,
  condominium_id uuid REFERENCES public.condominiums(id) ON DELETE CASCADE,
  recipient_phone text NOT NULL,
  recipient_name text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  sent_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id)
);

-- 3. Enable RLS on whatsapp_logs
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for whatsapp_logs
CREATE POLICY "View whatsapp logs" ON public.whatsapp_logs
FOR SELECT USING (
  can_manage_condominium(condominium_id) OR is_super_admin()
);

CREATE POLICY "Insert whatsapp logs" ON public.whatsapp_logs
FOR INSERT WITH CHECK (
  can_manage_condominium(condominium_id) OR is_super_admin()
);