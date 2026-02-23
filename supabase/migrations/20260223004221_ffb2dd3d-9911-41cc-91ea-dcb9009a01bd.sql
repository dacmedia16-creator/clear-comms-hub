
-- Create member_lists table
CREATE TABLE public.member_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.member_lists ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Managers can view member_lists"
ON public.member_lists FOR SELECT
USING (can_manage_condominium(condominium_id) OR is_super_admin());

CREATE POLICY "Managers can create member_lists"
ON public.member_lists FOR INSERT
WITH CHECK (can_manage_condominium(condominium_id) OR is_super_admin());

CREATE POLICY "Managers can update member_lists"
ON public.member_lists FOR UPDATE
USING (can_manage_condominium(condominium_id) OR is_super_admin())
WITH CHECK (can_manage_condominium(condominium_id) OR is_super_admin());

CREATE POLICY "Managers can delete member_lists"
ON public.member_lists FOR DELETE
USING (can_manage_condominium(condominium_id) OR is_super_admin());

-- Add list_id column to user_roles
ALTER TABLE public.user_roles
ADD COLUMN list_id UUID REFERENCES public.member_lists(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX idx_user_roles_list_id ON public.user_roles(list_id);
CREATE INDEX idx_member_lists_condominium_id ON public.member_lists(condominium_id);
