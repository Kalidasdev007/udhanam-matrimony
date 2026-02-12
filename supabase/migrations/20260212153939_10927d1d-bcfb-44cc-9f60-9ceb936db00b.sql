-- Add explicit DELETE policy for messages table (only admins can delete)
CREATE POLICY "Admins can delete messages"
  ON public.messages FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));