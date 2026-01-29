-- Permitir que usuários vejam seus próprios registros em user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (
  user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);