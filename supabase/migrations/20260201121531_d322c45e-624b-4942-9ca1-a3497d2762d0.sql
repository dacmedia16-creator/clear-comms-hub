-- Create table for WhatsApp sender numbers
CREATE TABLE public.whatsapp_senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  api_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_senders ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage whatsapp_senders
CREATE POLICY "Super admins can view whatsapp_senders"
ON public.whatsapp_senders FOR SELECT
USING (is_super_admin());

CREATE POLICY "Super admins can insert whatsapp_senders"
ON public.whatsapp_senders FOR INSERT
WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can update whatsapp_senders"
ON public.whatsapp_senders FOR UPDATE
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can delete whatsapp_senders"
ON public.whatsapp_senders FOR DELETE
USING (is_super_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_whatsapp_senders_updated_at
BEFORE UPDATE ON public.whatsapp_senders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();