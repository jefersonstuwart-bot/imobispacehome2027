create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Admins can manage site settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public can read site settings"
  on public.site_settings for select
  using (true);
