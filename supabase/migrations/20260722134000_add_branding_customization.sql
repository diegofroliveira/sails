create table public.organization_branding (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  portal_name text not null,
  tagline text,
  primary_color text not null default '#ff6b35' check (primary_color ~ '^#[0-9a-fA-F]{6}$'),
  accent_color text not null default '#142033' check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  logo_url text,
  favicon_url text,
  custom_domain text unique,
  email_sender_name text,
  email_reply_to text,
  hide_sails_branding boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_addons (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  addon_code text not null check (addon_code in ('custom_branding', 'custom_domain', 'white_label')),
  status text not null default 'trial' check (status in ('trial', 'active', 'past_due', 'cancelled')),
  setup_amount_cents integer not null default 0 check (setup_amount_cents >= 0),
  monthly_amount_cents integer not null default 0 check (monthly_amount_cents >= 0),
  trial_ends_at timestamptz,
  activated_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, addon_code)
);

create index organization_addons_org_status_idx
  on public.organization_addons (organization_id, status);

create trigger organization_branding_updated_at
  before update on public.organization_branding
  for each row execute function public.set_updated_at();

create trigger organization_addons_updated_at
  before update on public.organization_addons
  for each row execute function public.set_updated_at();

alter table public.organization_branding enable row level security;
alter table public.organization_addons enable row level security;

create policy organization_branding_member_read
  on public.organization_branding for select to authenticated
  using (public.has_org_role(organization_id));

create policy organization_branding_admin_manage
  on public.organization_branding for all to authenticated
  using (public.has_org_role(organization_id, array['owner','admin']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner','admin']::public.app_role[]));

create policy organization_addons_finance_read
  on public.organization_addons for select to authenticated
  using (public.has_org_role(organization_id, array['owner','admin','finance']::public.app_role[]));

create policy organization_addons_admin_manage
  on public.organization_addons for all to authenticated
  using (public.has_org_role(organization_id, array['owner','admin']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner','admin']::public.app_role[]));

grant select, insert, update, delete on public.organization_branding to authenticated;
grant select, insert, update, delete on public.organization_addons to authenticated;
