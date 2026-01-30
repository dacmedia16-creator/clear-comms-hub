-- Criar bucket de storage para anexos
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Política para visualização pública
CREATE POLICY "Public read access for attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'attachments');

-- Política para upload por usuários autenticados
CREATE POLICY "Authenticated upload for attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

-- Política para exclusão por usuários autenticados
CREATE POLICY "Authenticated delete for attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'attachments');