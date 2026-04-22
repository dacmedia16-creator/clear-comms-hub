ALTER TABLE public.whatsapp_broadcasts
ADD COLUMN sender_id uuid NULL,
ADD COLUMN sender_name_snapshot text NULL,
ADD COLUMN sender_phone_snapshot text NULL,
ADD COLUMN template_id uuid NULL,
ADD COLUMN template_label_snapshot text NULL,
ADD COLUMN template_identifier_snapshot text NULL;

ALTER TABLE public.whatsapp_broadcasts
ADD CONSTRAINT whatsapp_broadcasts_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.whatsapp_senders(id) ON DELETE SET NULL;

ALTER TABLE public.whatsapp_broadcasts
ADD CONSTRAINT whatsapp_broadcasts_template_id_fkey
FOREIGN KEY (template_id) REFERENCES public.whatsapp_sender_templates(id) ON DELETE SET NULL;

CREATE INDEX idx_whatsapp_broadcasts_condominium_status_updated_at
ON public.whatsapp_broadcasts (condominium_id, status, updated_at DESC);

CREATE INDEX idx_whatsapp_broadcasts_announcement_created_at
ON public.whatsapp_broadcasts (announcement_id, created_at DESC);

DROP POLICY IF EXISTS "Authenticated users can view broadcasts" ON public.whatsapp_broadcasts;
DROP POLICY IF EXISTS "Authenticated users can insert broadcasts" ON public.whatsapp_broadcasts;
DROP POLICY IF EXISTS "Authenticated users can update broadcasts" ON public.whatsapp_broadcasts;

CREATE POLICY "Managers can view whatsapp broadcasts"
ON public.whatsapp_broadcasts
FOR SELECT
TO authenticated
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());

CREATE POLICY "Managers can create whatsapp broadcasts"
ON public.whatsapp_broadcasts
FOR INSERT
TO authenticated
WITH CHECK (public.can_manage_condominium(condominium_id) OR public.is_super_admin());

CREATE POLICY "Managers can update whatsapp broadcasts"
ON public.whatsapp_broadcasts
FOR UPDATE
TO authenticated
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin())
WITH CHECK (public.can_manage_condominium(condominium_id) OR public.is_super_admin());