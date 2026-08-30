-- Add Minha Casa Minha Vida fields to properties
ALTER TABLE public.properties 
ADD COLUMN is_mcmv BOOLEAN DEFAULT false,
ADD COLUMN mcmv_logo_url TEXT;