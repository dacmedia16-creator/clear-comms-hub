ALTER TABLE whatsapp_senders 
ADD COLUMN IF NOT EXISTS param_style text NOT NULL DEFAULT 'named';