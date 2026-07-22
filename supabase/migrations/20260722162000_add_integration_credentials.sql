create table public.integration_credentials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null check (provider in ('google_calendar', 'read_ai', 'gemini')),
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  scopes text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider)
);

alter table public.integration_credentials enable row level security;
revoke all on public.integration_credentials from anon, authenticated;
grant all on public.integration_credentials to service_role;

create trigger set_integration_credentials_updated_at
before update on public.integration_credentials
for each row execute function public.set_updated_at();

comment on table public.integration_credentials is
  'Server-only OAuth and integration credentials. Never exposed to browser clients.';
