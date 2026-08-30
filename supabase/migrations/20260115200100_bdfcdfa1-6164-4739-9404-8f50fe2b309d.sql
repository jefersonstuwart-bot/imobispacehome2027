-- Add new columns to properties table for bulk import support
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS category text DEFAULT 'sale' CHECK (category IN ('sale', 'rent')),
ADD COLUMN IF NOT EXISTS property_type text,
ADD COLUMN IF NOT EXISTS bedrooms integer,
ADD COLUMN IF NOT EXISTS size_m2 numeric,
ADD COLUMN IF NOT EXISTS rental_value numeric,
ADD COLUMN IF NOT EXISTS import_batch_id uuid,
ADD COLUMN IF NOT EXISTS import_folder_name text;

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_properties_category ON public.properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON public.properties(bedrooms);