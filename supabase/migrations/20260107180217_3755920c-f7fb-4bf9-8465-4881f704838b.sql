-- Atualizar a função para definir admin pelo email específico
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role user_role;
BEGIN
  -- Define como admin se for o email do gestor principal
  IF NEW.email = 'jefersonstuwart@gmail.com' THEN
    user_role := 'admin';
  ELSE
    user_role := COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'broker');
  END IF;

  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    user_role
  );
  RETURN NEW;
END;
$$;