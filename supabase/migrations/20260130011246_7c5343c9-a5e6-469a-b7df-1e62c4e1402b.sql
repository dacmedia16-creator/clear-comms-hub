-- Create email_logs table for tracking email notifications
CREATE TABLE public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE SET NULL,
  condominium_id UUID REFERENCES public.condominiums(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins can view all email logs
CREATE POLICY "Super admins can view all email_logs"
ON public.email_logs
FOR SELECT
USING (is_super_admin());

-- Policy: Condo managers can view their email logs
CREATE POLICY "Condo managers can view their email_logs"
ON public.email_logs
FOR SELECT
USING (can_manage_condominium(condominium_id));

-- Policy: Insert email logs (for edge function with service role)
CREATE POLICY "Insert email_logs"
ON public.email_logs
FOR INSERT
WITH CHECK (can_manage_condominium(condominium_id) OR is_super_admin());

-- Create index for better query performance
CREATE INDEX idx_email_logs_announcement ON public.email_logs(announcement_id);
CREATE INDEX idx_email_logs_condominium ON public.email_logs(condominium_id);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at DESC);