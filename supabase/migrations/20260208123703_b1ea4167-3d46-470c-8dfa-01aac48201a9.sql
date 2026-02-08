-- Adicionar novos valores ao enum announcement_category para categorias por segmento
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'pedagogico';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'calendario';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'rh';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'compliance';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'atendimento';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'horarios';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'treinos';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'cultos';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'pastoral';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'eventos';