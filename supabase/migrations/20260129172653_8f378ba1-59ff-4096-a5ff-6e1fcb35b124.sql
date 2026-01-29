-- Allow authenticated users to self-register as resident
CREATE POLICY "Users can self-register as resident"
ON public.user_roles
FOR INSERT
WITH CHECK (
  role = 'resident'
  AND user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);