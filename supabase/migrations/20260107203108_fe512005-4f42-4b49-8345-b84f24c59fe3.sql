-- Adicionar coluna para imagem de capa do PDF
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS pdf_cover_image text;

-- Criar tabela para tabela de preços dos empreendimentos
CREATE TABLE public.property_prices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_type text NOT NULL,
  area_m2 numeric NOT NULL,
  bedrooms integer,
  suites integer,
  parking_spots integer,
  price numeric NOT NULL,
  floor text,
  status text DEFAULT 'available',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_prices ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view prices of active properties"
ON public.property_prices
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.properties p 
  WHERE p.id = property_prices.property_id AND p.is_active = true
));

CREATE POLICY "Admins can manage prices"
ON public.property_prices
FOR ALL
USING (is_admin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_property_prices_updated_at
BEFORE UPDATE ON public.property_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();