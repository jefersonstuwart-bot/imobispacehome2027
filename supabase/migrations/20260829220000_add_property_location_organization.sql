-- Organização geográfica do catálogo: Estado -> Cidade -> Bairro/Região.
-- IF NOT EXISTS permite aplicar a migração com segurança caso alguma coluna já exista.
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS state_uf text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS neighborhood text,
  ADD COLUMN IF NOT EXISTS developer text;

CREATE INDEX IF NOT EXISTS idx_properties_state_uf ON public.properties (state_uf);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties (city);
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood ON public.properties (neighborhood);
CREATE INDEX IF NOT EXISTS idx_properties_developer ON public.properties (developer);
