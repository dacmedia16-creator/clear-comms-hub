-- Adicionar coluna code com sequência iniciando em 101
CREATE SEQUENCE IF NOT EXISTS condominiums_code_seq START WITH 101;

ALTER TABLE public.condominiums 
ADD COLUMN code INTEGER UNIQUE DEFAULT nextval('condominiums_code_seq');

-- Gerar códigos para condomínios existentes
UPDATE public.condominiums 
SET code = nextval('condominiums_code_seq') 
WHERE code IS NULL;

-- Tornar a coluna NOT NULL após popular os existentes
ALTER TABLE public.condominiums 
ALTER COLUMN code SET NOT NULL;