-- ============================================================
-- CRM Imobiliário — Fundação (PR1 + PR2 base)
-- Aditivo: nada existente é alterado.
-- ============================================================

-- 1) Adicionar real_estate ao enum organization_type
ALTER TYPE public.organization_type ADD VALUE IF NOT EXISTS 'real_estate';

-- 2) Bucket privado para documentos de imóveis
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-docs', 'property-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: gestores da org dona do imóvel acessam (path: <condominium_id>/...)
CREATE POLICY "Managers can read property-docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'property-docs'
  AND (
    public.can_manage_condominium(((storage.foldername(name))[1])::uuid)
    OR public.is_super_admin()
  )
);

CREATE POLICY "Managers can upload property-docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-docs'
  AND (
    public.can_manage_condominium(((storage.foldername(name))[1])::uuid)
    OR public.is_super_admin()
  )
);

CREATE POLICY "Managers can update property-docs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-docs'
  AND (
    public.can_manage_condominium(((storage.foldername(name))[1])::uuid)
    OR public.is_super_admin()
  )
);

CREATE POLICY "Managers can delete property-docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-docs'
  AND (
    public.can_manage_condominium(((storage.foldername(name))[1])::uuid)
    OR public.is_super_admin()
  )
);

-- 3) Pipelines + estágios
CREATE TABLE public.pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id uuid NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  name text NOT NULL,
  lead_type text NOT NULL CHECK (lead_type IN ('property','broker')),
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pipelines_condo ON public.pipelines(condominium_id);
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View pipelines" ON public.pipelines FOR SELECT
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Insert pipelines" ON public.pipelines FOR INSERT
WITH CHECK (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Update pipelines" ON public.pipelines FOR UPDATE
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Delete pipelines" ON public.pipelines FOR DELETE
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());

CREATE TRIGGER pipelines_updated_at BEFORE UPDATE ON public.pipelines
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  name text NOT NULL,
  position int NOT NULL DEFAULT 0,
  color text,
  sla_days int,
  is_terminal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_stages_pipeline ON public.pipeline_stages(pipeline_id, position);
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View stages" ON public.pipeline_stages FOR SELECT
USING (EXISTS (SELECT 1 FROM public.pipelines p WHERE p.id = pipeline_id
  AND (public.can_manage_condominium(p.condominium_id) OR public.is_super_admin())));
CREATE POLICY "Insert stages" ON public.pipeline_stages FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.pipelines p WHERE p.id = pipeline_id
  AND (public.can_manage_condominium(p.condominium_id) OR public.is_super_admin())));
CREATE POLICY "Update stages" ON public.pipeline_stages FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.pipelines p WHERE p.id = pipeline_id
  AND (public.can_manage_condominium(p.condominium_id) OR public.is_super_admin())));
CREATE POLICY "Delete stages" ON public.pipeline_stages FOR DELETE
USING (EXISTS (SELECT 1 FROM public.pipelines p WHERE p.id = pipeline_id
  AND (public.can_manage_condominium(p.condominium_id) OR public.is_super_admin())));

-- 4) Imóveis
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id uuid NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  owner_member_id uuid REFERENCES public.condo_members(id) ON DELETE SET NULL,
  listing_agent_member_id uuid REFERENCES public.condo_members(id) ON DELETE SET NULL,
  stage_id uuid REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  code text,
  title text NOT NULL,
  property_type text,
  status text NOT NULL DEFAULT 'capturing',
  transaction_type text,
  address text,
  neighborhood text,
  city text,
  state text,
  zip_code text,
  price numeric(14,2),
  condo_fee numeric(12,2),
  iptu numeric(12,2),
  area_m2 numeric(10,2),
  bedrooms int,
  bathrooms int,
  parking int,
  description text,
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  captured_at timestamptz,
  published_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_properties_condo ON public.properties(condominium_id);
CREATE INDEX idx_properties_stage ON public.properties(stage_id);
CREATE INDEX idx_properties_status ON public.properties(condominium_id, status);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View properties" ON public.properties FOR SELECT
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Insert properties" ON public.properties FOR INSERT
WITH CHECK (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Update properties" ON public.properties FOR UPDATE
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Delete properties" ON public.properties FOR DELETE
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());

CREATE TRIGGER properties_updated_at BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5) Leads de captação
CREATE TABLE public.capture_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id uuid NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  lead_type text NOT NULL CHECK (lead_type IN ('property','broker')),
  full_name text NOT NULL,
  phone text,
  email text,
  source text,
  stage_id uuid REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  assigned_to_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  converted_at timestamptz,
  converted_to_id uuid,
  converted_to_type text CHECK (converted_to_type IN ('property','broker_member')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_condo ON public.capture_leads(condominium_id);
CREATE INDEX idx_leads_stage ON public.capture_leads(stage_id);
CREATE INDEX idx_leads_type ON public.capture_leads(condominium_id, lead_type);
ALTER TABLE public.capture_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View leads" ON public.capture_leads FOR SELECT
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Insert leads" ON public.capture_leads FOR INSERT
WITH CHECK (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Update leads" ON public.capture_leads FOR UPDATE
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Delete leads" ON public.capture_leads FOR DELETE
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());

CREATE TRIGGER capture_leads_updated_at BEFORE UPDATE ON public.capture_leads
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6) Interações (timeline polimórfica)
CREATE TABLE public.interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id uuid NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('property','lead','member')),
  entity_id uuid NOT NULL,
  channel text NOT NULL CHECK (channel IN ('whatsapp','sms','email','call','visit','note','system')),
  direction text CHECK (direction IN ('outbound','inbound','internal')),
  subject text,
  content text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_interactions_entity ON public.interactions(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_interactions_condo ON public.interactions(condominium_id, created_at DESC);
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View interactions" ON public.interactions FOR SELECT
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Insert interactions" ON public.interactions FOR INSERT
WITH CHECK (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Update interactions" ON public.interactions FOR UPDATE
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Delete interactions" ON public.interactions FOR DELETE
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());

-- 7) Tarefas / follow-ups
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id uuid NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  entity_type text CHECK (entity_type IN ('property','lead','member')),
  entity_id uuid,
  assigned_to_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  due_at timestamptz,
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','done','cancelled')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_tasks_condo ON public.tasks(condominium_id);
CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_to_profile_id, status);
CREATE INDEX idx_tasks_entity ON public.tasks(entity_type, entity_id);
CREATE INDEX idx_tasks_due ON public.tasks(condominium_id, due_at) WHERE status IN ('open','in_progress');
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View tasks" ON public.tasks FOR SELECT
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Insert tasks" ON public.tasks FOR INSERT
WITH CHECK (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Update tasks" ON public.tasks FOR UPDATE
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Delete tasks" ON public.tasks FOR DELETE
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8) Templates de mensagem
CREATE TABLE public.message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id uuid NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('whatsapp','sms','email')),
  name text NOT NULL,
  subject text,
  body text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_msg_templates_condo ON public.message_templates(condominium_id, channel);
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View msg templates" ON public.message_templates FOR SELECT
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Insert msg templates" ON public.message_templates FOR INSERT
WITH CHECK (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Update msg templates" ON public.message_templates FOR UPDATE
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
CREATE POLICY "Delete msg templates" ON public.message_templates FOR DELETE
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());

CREATE TRIGGER msg_templates_updated_at BEFORE UPDATE ON public.message_templates
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9) Auditoria (somente leitura para gestores; escrita via SECURITY DEFINER)
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id uuid NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  actor_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_condo ON public.audit_logs(condominium_id, created_at DESC);
CREATE INDEX idx_audit_entity ON public.audit_logs(entity_type, entity_id);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view audit_logs" ON public.audit_logs FOR SELECT
USING (public.can_manage_condominium(condominium_id) OR public.is_super_admin());
-- Sem INSERT/UPDATE/DELETE policies: bloqueado para clients; só via SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.write_audit_log(
  _condominium_id uuid,
  _action text,
  _entity_type text,
  _entity_id uuid,
  _before jsonb DEFAULT NULL,
  _after jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor uuid;
  _id uuid;
BEGIN
  IF NOT (public.can_manage_condominium(_condominium_id) OR public.is_super_admin()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT p.id INTO _actor FROM public.profiles p WHERE p.user_id = auth.uid();

  INSERT INTO public.audit_logs (condominium_id, actor_profile_id, action, entity_type, entity_id, before, after)
  VALUES (_condominium_id, _actor, _action, _entity_type, _entity_id, _before, _after)
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

-- 10) Seed automático de pipelines quando uma org real_estate é criada
CREATE OR REPLACE FUNCTION public.seed_real_estate_pipelines()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _pipe_property uuid;
  _pipe_broker uuid;
BEGIN
  IF NEW.organization_type IS DISTINCT FROM 'real_estate'::organization_type THEN
    RETURN NEW;
  END IF;

  -- Captação de Imóveis
  INSERT INTO public.pipelines (condominium_id, name, lead_type, is_default)
  VALUES (NEW.id, 'Captação de Imóveis', 'property', true)
  RETURNING id INTO _pipe_property;

  INSERT INTO public.pipeline_stages (pipeline_id, name, position, color) VALUES
    (_pipe_property, 'Lead', 0, '#94a3b8'),
    (_pipe_property, 'Contato feito', 1, '#60a5fa'),
    (_pipe_property, 'Visita agendada', 2, '#a78bfa'),
    (_pipe_property, 'Documentação', 3, '#f59e0b'),
    (_pipe_property, 'Captado', 4, '#10b981'),
    (_pipe_property, 'Publicado', 5, '#059669');

  -- Captação de Corretores
  INSERT INTO public.pipelines (condominium_id, name, lead_type, is_default)
  VALUES (NEW.id, 'Captação de Corretores', 'broker', true)
  RETURNING id INTO _pipe_broker;

  INSERT INTO public.pipeline_stages (pipeline_id, name, position, color) VALUES
    (_pipe_broker, 'Lead', 0, '#94a3b8'),
    (_pipe_broker, 'Contato feito', 1, '#60a5fa'),
    (_pipe_broker, 'Entrevista', 2, '#a78bfa'),
    (_pipe_broker, 'Aprovado', 3, '#f59e0b'),
    (_pipe_broker, 'Onboarding', 4, '#10b981'),
    (_pipe_broker, 'Ativo', 5, '#059669');

  RETURN NEW;
END;
$$;

CREATE TRIGGER condominiums_seed_real_estate_pipelines
AFTER INSERT ON public.condominiums
FOR EACH ROW EXECUTE FUNCTION public.seed_real_estate_pipelines();
