
-- Create whatsapp_optouts table
CREATE TABLE public.whatsapp_optouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  token text NOT NULL UNIQUE,
  condominium_id uuid REFERENCES public.condominiums(id) ON DELETE SET NULL,
  member_name text,
  opted_out_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast phone lookups during send
CREATE INDEX idx_whatsapp_optouts_phone ON public.whatsapp_optouts(phone) WHERE opted_out_at IS NOT NULL;
CREATE INDEX idx_whatsapp_optouts_token ON public.whatsapp_optouts(token);

-- Enable RLS
ALTER TABLE public.whatsapp_optouts ENABLE ROW LEVEL SECURITY;

-- Super admins can view all opt-outs
CREATE POLICY "Super admins can view optouts"
ON public.whatsapp_optouts FOR SELECT
USING (is_super_admin());

-- Condo managers can view their optouts
CREATE POLICY "Managers can view their optouts"
ON public.whatsapp_optouts FOR SELECT
USING (can_manage_condominium(condominium_id));

-- Super admins can delete (reactivate)
CREATE POLICY "Super admins can delete optouts"
ON public.whatsapp_optouts FOR DELETE
USING (is_super_admin());
