
CREATE TABLE public.whatsapp_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id),
  condominium_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  total_members INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.whatsapp_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view broadcasts"
  ON public.whatsapp_broadcasts FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can update broadcasts"
  ON public.whatsapp_broadcasts FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert broadcasts"
  ON public.whatsapp_broadcasts FOR INSERT
  TO authenticated WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_broadcasts;
