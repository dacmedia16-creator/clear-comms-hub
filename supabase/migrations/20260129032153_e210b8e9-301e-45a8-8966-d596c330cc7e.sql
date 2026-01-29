-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'syndic');

-- Create announcement category enum
CREATE TYPE public.announcement_category AS ENUM ('informativo', 'financeiro', 'manutencao', 'convivencia', 'seguranca', 'urgente');

-- Create plan type enum
CREATE TYPE public.plan_type AS ENUM ('free', 'starter', 'pro');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create condominiums table
CREATE TABLE public.condominiums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  plan plan_type NOT NULL DEFAULT 'free',
  notification_email BOOLEAN NOT NULL DEFAULT true,
  notification_whatsapp BOOLEAN NOT NULL DEFAULT false,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (for multi-admin support)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  condominium_id UUID REFERENCES public.condominiums(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'syndic',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, condominium_id)
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id UUID REFERENCES public.condominiums(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  category announcement_category NOT NULL DEFAULT 'informativo',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create attachments table
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_condominiums_updated_at
  BEFORE UPDATE ON public.condominiums
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generate unique slug function
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from name (lowercase, replace spaces with hyphens, remove special chars)
  slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9\s]', '', 'g'));
  slug := regexp_replace(slug, '\s+', '-', 'g');
  
  -- Add random suffix
  slug := slug || '-' || substr(md5(random()::text), 1, 6);
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper function: Check if user is condominium owner
CREATE OR REPLACE FUNCTION public.is_condominium_owner(cond_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.condominiums c
    JOIN public.profiles p ON c.owner_id = p.id
    WHERE c.id = cond_id AND p.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Helper function: Check if user has role in condominium
CREATE OR REPLACE FUNCTION public.has_condominium_role(cond_id UUID, _role app_role DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON ur.user_id = p.id
    WHERE ur.condominium_id = cond_id 
      AND p.user_id = auth.uid()
      AND (_role IS NULL OR ur.role = _role)
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Helper function: Check if user can manage condominium (owner or admin)
CREATE OR REPLACE FUNCTION public.can_manage_condominium(cond_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_condominium_owner(cond_id) OR public.has_condominium_role(cond_id, 'admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Condominiums RLS Policies
CREATE POLICY "Anyone can view condominiums by slug"
  ON public.condominiums FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create condominiums"
  ON public.condominiums FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can update their condominiums"
  ON public.condominiums FOR UPDATE
  TO authenticated
  USING (public.can_manage_condominium(id))
  WITH CHECK (public.can_manage_condominium(id));

CREATE POLICY "Owners can delete their condominiums"
  ON public.condominiums FOR DELETE
  TO authenticated
  USING (public.is_condominium_owner(id));

-- User Roles RLS Policies
CREATE POLICY "Managers can view roles for their condominiums"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.can_manage_condominium(condominium_id));

CREATE POLICY "Managers can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.can_manage_condominium(condominium_id));

CREATE POLICY "Managers can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.can_manage_condominium(condominium_id));

-- Announcements RLS Policies
CREATE POLICY "Anyone can view announcements"
  ON public.announcements FOR SELECT
  USING (true);

CREATE POLICY "Managers can create announcements"
  ON public.announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_manage_condominium(condominium_id) AND
    created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Managers can update announcements"
  ON public.announcements FOR UPDATE
  TO authenticated
  USING (public.can_manage_condominium(condominium_id))
  WITH CHECK (public.can_manage_condominium(condominium_id));

CREATE POLICY "Managers can delete announcements"
  ON public.announcements FOR DELETE
  TO authenticated
  USING (public.can_manage_condominium(condominium_id));

-- Attachments RLS Policies
CREATE POLICY "Anyone can view attachments"
  ON public.attachments FOR SELECT
  USING (true);

CREATE POLICY "Managers can create attachments"
  ON public.attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.announcements a
      WHERE a.id = announcement_id
        AND public.can_manage_condominium(a.condominium_id)
    )
  );

CREATE POLICY "Managers can delete attachments"
  ON public.attachments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.announcements a
      WHERE a.id = announcement_id
        AND public.can_manage_condominium(a.condominium_id)
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_condominiums_slug ON public.condominiums(slug);
CREATE INDEX idx_condominiums_owner ON public.condominiums(owner_id);
CREATE INDEX idx_announcements_condominium ON public.announcements(condominium_id);
CREATE INDEX idx_announcements_published ON public.announcements(published_at DESC);
CREATE INDEX idx_announcements_category ON public.announcements(category);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_condominium ON public.user_roles(condominium_id);
CREATE INDEX idx_attachments_announcement ON public.attachments(announcement_id);