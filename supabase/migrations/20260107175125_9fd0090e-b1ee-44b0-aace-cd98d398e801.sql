-- Corrigir search_path na função update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- As policies com "true" são intencionais para proposals e documents
-- pois clientes públicos precisam enviar propostas sem login
-- Isso é aceitável para INSERT pois é a funcionalidade desejada