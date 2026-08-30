-- Adicionar coluna de renda mínima na tabela properties
ALTER TABLE public.properties 
ADD COLUMN min_income numeric NULL;

-- Comentário para documentação
COMMENT ON COLUMN public.properties.min_income IS 'Renda mínima necessária para financiamento do imóvel';