-- 1. Create whatsapp_sender_templates table
CREATE TABLE public.whatsapp_sender_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.whatsapp_senders(id) ON DELETE CASCADE,
  identifier TEXT NOT NULL,
  label TEXT NOT NULL,
  button_config TEXT NOT NULL DEFAULT 'two_buttons',
  has_nome_param BOOLEAN NOT NULL DEFAULT true,
  param_style TEXT NOT NULL DEFAULT 'named',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (sender_id, identifier)
);

-- Index for faster sender lookups
CREATE INDEX idx_whatsapp_sender_templates_sender ON public.whatsapp_sender_templates(sender_id);

-- 2. Enable RLS
ALTER TABLE public.whatsapp_sender_templates ENABLE ROW LEVEL SECURITY;

-- 3. Policies (super admin only — same as whatsapp_senders)
CREATE POLICY "Super admins can view sender templates"
  ON public.whatsapp_sender_templates FOR SELECT
  USING (is_super_admin());

CREATE POLICY "Super admins can insert sender templates"
  ON public.whatsapp_sender_templates FOR INSERT
  WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can update sender templates"
  ON public.whatsapp_sender_templates FOR UPDATE
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can delete sender templates"
  ON public.whatsapp_sender_templates FOR DELETE
  USING (is_super_admin());

-- 4. Trigger to update updated_at
CREATE TRIGGER update_whatsapp_sender_templates_updated_at
  BEFORE UPDATE ON public.whatsapp_sender_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Migrate existing senders' templates as their default template
INSERT INTO public.whatsapp_sender_templates (
  sender_id, identifier, label, button_config, has_nome_param, param_style, is_default
)
SELECT
  s.id,
  COALESCE(s.template_identifier, 'aviso_pro_confirma_3'),
  'Padrão (' || s.name || ')',
  COALESCE(s.button_config, 'two_buttons'),
  COALESCE(s.has_nome_param, true),
  COALESCE(s.param_style, 'named'),
  true
FROM public.whatsapp_senders s
ON CONFLICT (sender_id, identifier) DO NOTHING;

-- 6. Seed: add remax_corretor template to the "Aviso Pro" sender (phone 5515998312112 — adjust if needed)
INSERT INTO public.whatsapp_sender_templates (
  sender_id, identifier, label, button_config, has_nome_param, param_style, is_default
)
SELECT
  s.id,
  'remax_corretor',
  'Re/Max Corretor',
  'two_buttons',
  true,
  'named',
  false
FROM public.whatsapp_senders s
WHERE s.phone LIKE '%998312112%'
   OR s.name ILIKE '%aviso pro%'
ON CONFLICT (sender_id, identifier) DO NOTHING;