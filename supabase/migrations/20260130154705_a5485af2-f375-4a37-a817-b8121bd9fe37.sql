-- Adicionar coluna block em user_roles
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS block TEXT;

-- Adicionar colunas de segmentação em announcements
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_blocks TEXT[];
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_units TEXT[];