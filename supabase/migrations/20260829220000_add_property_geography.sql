-- Organização geográfica dos empreendimentos
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS state_uf TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS developer TEXT;

UPDATE public.properties
SET state_uf = UPPER(TRIM(state_uf))
WHERE state_uf IS NOT NULL;

CREATE INDEX IF NOT EXISTS properties_state_uf_idx ON public.properties(state_uf);
CREATE INDEX IF NOT EXISTS properties_city_idx ON public.properties(city);
CREATE INDEX IF NOT EXISTS properties_neighborhood_idx ON public.properties(neighborhood);
CREATE INDEX IF NOT EXISTS properties_developer_idx ON public.properties(developer);
