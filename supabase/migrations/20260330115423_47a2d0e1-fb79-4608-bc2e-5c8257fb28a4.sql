ALTER TABLE public.whatsapp_senders 
ADD COLUMN button_config text NOT NULL DEFAULT 'two_buttons',
ADD COLUMN has_nome_param boolean NOT NULL DEFAULT true;