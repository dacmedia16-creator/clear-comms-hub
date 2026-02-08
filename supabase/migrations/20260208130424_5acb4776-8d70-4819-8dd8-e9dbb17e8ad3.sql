-- Create webhooks table for storing webhook configurations
CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] NOT NULL DEFAULT ARRAY['announcement.created'],
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create api_tokens table for REST API authentication
CREATE TABLE public.api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  token_prefix TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  permissions TEXT[] DEFAULT ARRAY['read:announcements', 'read:members'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create webhook_logs table for tracking webhook deliveries
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  success BOOLEAN DEFAULT false
);

-- Enable RLS on all tables
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Webhooks policies: managers can CRUD
CREATE POLICY "Managers can view webhooks"
  ON public.webhooks FOR SELECT
  USING (can_manage_condominium(condominium_id) OR is_super_admin());

CREATE POLICY "Managers can create webhooks"
  ON public.webhooks FOR INSERT
  WITH CHECK (can_manage_condominium(condominium_id) OR is_super_admin());

CREATE POLICY "Managers can update webhooks"
  ON public.webhooks FOR UPDATE
  USING (can_manage_condominium(condominium_id) OR is_super_admin())
  WITH CHECK (can_manage_condominium(condominium_id) OR is_super_admin());

CREATE POLICY "Managers can delete webhooks"
  ON public.webhooks FOR DELETE
  USING (can_manage_condominium(condominium_id) OR is_super_admin());

-- API Tokens policies: managers can CRUD
CREATE POLICY "Managers can view api_tokens"
  ON public.api_tokens FOR SELECT
  USING (can_manage_condominium(condominium_id) OR is_super_admin());

CREATE POLICY "Managers can create api_tokens"
  ON public.api_tokens FOR INSERT
  WITH CHECK (can_manage_condominium(condominium_id) OR is_super_admin());

CREATE POLICY "Managers can update api_tokens"
  ON public.api_tokens FOR UPDATE
  USING (can_manage_condominium(condominium_id) OR is_super_admin())
  WITH CHECK (can_manage_condominium(condominium_id) OR is_super_admin());

CREATE POLICY "Managers can delete api_tokens"
  ON public.api_tokens FOR DELETE
  USING (can_manage_condominium(condominium_id) OR is_super_admin());

-- Webhook logs policies: managers can view logs for their webhooks
CREATE POLICY "Managers can view webhook_logs"
  ON public.webhook_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM webhooks w 
    WHERE w.id = webhook_logs.webhook_id 
    AND (can_manage_condominium(w.condominium_id) OR is_super_admin())
  ));

CREATE POLICY "System can insert webhook_logs"
  ON public.webhook_logs FOR INSERT
  WITH CHECK (true);

-- Add updated_at trigger to webhooks
CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_webhooks_condominium_id ON public.webhooks(condominium_id);
CREATE INDEX idx_webhooks_is_active ON public.webhooks(is_active);
CREATE INDEX idx_api_tokens_condominium_id ON public.api_tokens(condominium_id);
CREATE INDEX idx_api_tokens_token_hash ON public.api_tokens(token_hash);
CREATE INDEX idx_webhook_logs_webhook_id ON public.webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_sent_at ON public.webhook_logs(sent_at DESC);