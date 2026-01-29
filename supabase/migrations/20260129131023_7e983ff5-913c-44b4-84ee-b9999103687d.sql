-- Adicionar role 'resident' ao enum app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'resident';