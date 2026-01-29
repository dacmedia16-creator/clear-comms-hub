-- Add is_approved column to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT true;

-- Create policy for syndics to self-register as pending
CREATE POLICY "Syndics can self-register as pending"
ON public.user_roles FOR INSERT
WITH CHECK (
  role = 'syndic'::app_role 
  AND is_approved = false
  AND user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);