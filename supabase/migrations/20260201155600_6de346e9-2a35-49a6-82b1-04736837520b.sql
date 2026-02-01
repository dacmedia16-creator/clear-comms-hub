-- Adicionar coluna trial_ends_at
ALTER TABLE public.condominiums 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Definir valor padrao para novos registros
ALTER TABLE public.condominiums 
ALTER COLUMN trial_ends_at SET DEFAULT (now() + INTERVAL '3 months');

-- Atualizar registros existentes (trial de 3 meses a partir da criacao)
UPDATE public.condominiums 
SET trial_ends_at = created_at + INTERVAL '3 months'
WHERE trial_ends_at IS NULL;