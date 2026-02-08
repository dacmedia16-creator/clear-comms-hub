-- 1. Criar enum de tipos de organização
CREATE TYPE public.organization_type AS ENUM (
  'condominium',
  'school',
  'company',
  'clinic',
  'association',
  'gym',
  'church',
  'club',
  'other'
);

-- 2. Adicionar coluna na tabela condominiums
ALTER TABLE public.condominiums 
ADD COLUMN organization_type public.organization_type DEFAULT 'condominium';