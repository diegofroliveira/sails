create extension if not exists pgcrypto;

create type public.app_role as enum ('owner', 'admin', 'finance', 'mentor', 'support', 'student');
create type public.record_status as enum ('draft', 'active', 'paused', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  owner_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  status public.record_status not null default 'draft',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  title text not null,
  position integer not null default 0 check (position >= 0),
  release_after_days integer not null default 0 check (release_after_days >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  lesson_type text not null check (lesson_type in ('video', 'text', 'quiz', 'live', 'file')),
  content jsonb not null default '{}'::jsonb,
  position integer not null default 0 check (position >= 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  objective text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  status text not null default 'active' check (status in ('invited', 'active', 'completed', 'cancelled')),
  progress_percent numeric(5,2) not null default 0 check (progress_percent between 0 and 100),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (student_id, program_id)
);

create table public.student_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  event_type text not null,
  occurred_at timestamptz not null default now(),
  properties jsonb not null default '{}'::jsonb
);

create table public.mentoring_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  meeting_url text,
  private_notes text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.commitments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  title text not null,
  due_at timestamptz,
  status text not null default 'open' check (status in ('open', 'done', 'cancelled')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  source text,
  stage text not null default 'new' check (stage in ('new', 'conversation', 'proposal', 'won', 'lost')),
  owner_id uuid references auth.users(id),
  consent_marketing_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  program_id uuid references public.programs(id) on delete set null,
  name text not null,
  status public.record_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null default 'BRL',
  billing_interval text check (billing_interval in ('month', 'quarter', 'year')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id),
  price_id uuid not null references public.prices(id),
  student_id uuid references public.students(id),
  external_id text,
  status text not null check (status in ('pending', 'paid', 'failed', 'refunded', 'disputed', 'cancelled')),
  gross_amount_minor bigint not null check (gross_amount_minor >= 0),
  currency char(3) not null default 'BRL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, external_id)
);

create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  provider text not null,
  provider_transaction_id text not null,
  transaction_type text not null check (transaction_type in ('charge', 'fee', 'refund', 'dispute', 'payout', 'adjustment')),
  status text not null,
  amount_minor bigint not null,
  currency char(3) not null default 'BRL',
  occurred_at timestamptz not null,
  raw_reference jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider, provider_transaction_id, transaction_type)
);

create table public.ledger_entries (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  transaction_id uuid references public.payment_transactions(id) on delete restrict,
  account text not null,
  direction text not null check (direction in ('debit', 'credit')),
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null default 'BRL',
  effective_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.webhook_events (
  id bigint generated always as identity primary key,
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  status text not null default 'received' check (status in ('received', 'processing', 'succeeded', 'failed')),
  payload jsonb not null,
  attempts integer not null default 0,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  unique (provider, provider_event_id)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete restrict,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index memberships_user_idx on public.memberships(user_id);
create index programs_org_idx on public.programs(organization_id);
create index students_org_idx on public.students(organization_id);
create index enrollments_org_program_idx on public.enrollments(organization_id, program_id);
create index student_events_enrollment_time_idx on public.student_events(enrollment_id, occurred_at desc);
create index leads_org_stage_idx on public.leads(organization_id, stage);
create index orders_org_created_idx on public.orders(organization_id, created_at desc);
create index transactions_org_time_idx on public.payment_transactions(organization_id, occurred_at desc);
create index ledger_org_time_idx on public.ledger_entries(organization_id, effective_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

create or replace function public.handle_new_organization()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.memberships (organization_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create or replace function public.prevent_ledger_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'ledger entries are immutable';
end;
$$;

create or replace function public.has_org_role(target_org uuid, allowed_roles public.app_role[] default null)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = target_org
      and m.user_id = (select auth.uid())
      and (allowed_roles is null or m.role = any(allowed_roles))
  );
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger programs_updated_at before update on public.programs for each row execute function public.set_updated_at();
create trigger modules_updated_at before update on public.modules for each row execute function public.set_updated_at();
create trigger lessons_updated_at before update on public.lessons for each row execute function public.set_updated_at();
create trigger students_updated_at before update on public.students for each row execute function public.set_updated_at();
create trigger leads_updated_at before update on public.leads for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger auth_user_profile after insert on auth.users for each row execute function public.handle_new_user();
create trigger organization_owner_membership after insert on public.organizations for each row execute function public.handle_new_organization();
create trigger ledger_immutable before update or delete on public.ledger_entries for each row execute function public.prevent_ledger_mutation();

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.programs enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.students enable row level security;
alter table public.enrollments enable row level security;
alter table public.student_events enable row level security;
alter table public.mentoring_sessions enable row level security;
alter table public.commitments enable row level security;
alter table public.leads enable row level security;
alter table public.products enable row level security;
alter table public.prices enable row level security;
alter table public.orders enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.webhook_events enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_self_read on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_self_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy organizations_member_read on public.organizations for select to authenticated using (public.has_org_role(id));
create policy organizations_owner_create on public.organizations for insert to authenticated with check (owner_id = (select auth.uid()));
create policy organizations_admin_update on public.organizations for update to authenticated using (public.has_org_role(id, array['owner','admin']::public.app_role[]));
create policy memberships_member_read on public.memberships for select to authenticated using (public.has_org_role(organization_id));
create policy memberships_admin_manage on public.memberships for all to authenticated using (public.has_org_role(organization_id, array['owner','admin']::public.app_role[])) with check (public.has_org_role(organization_id, array['owner','admin']::public.app_role[]));

do $$
declare table_name text;
begin
  foreach table_name in array array['programs','modules','lessons','students','enrollments','student_events','mentoring_sessions','commitments','leads','products','prices']
  loop
    execute format('create policy %I on public.%I for all to authenticated using (public.has_org_role(organization_id)) with check (public.has_org_role(organization_id))', table_name || '_org_access', table_name);
  end loop;
end $$;

create policy orders_finance_read on public.orders for select to authenticated using (public.has_org_role(organization_id, array['owner','admin','finance','support']::public.app_role[]));
create policy orders_finance_manage on public.orders for all to authenticated using (public.has_org_role(organization_id, array['owner','admin','finance']::public.app_role[])) with check (public.has_org_role(organization_id, array['owner','admin','finance']::public.app_role[]));
create policy payment_transactions_finance_access on public.payment_transactions for select to authenticated using (public.has_org_role(organization_id, array['owner','admin','finance']::public.app_role[]));
create policy ledger_entries_finance_access on public.ledger_entries for select to authenticated using (public.has_org_role(organization_id, array['owner','admin','finance']::public.app_role[]));
create policy audit_logs_admin_read on public.audit_logs for select to authenticated using (public.has_org_role(organization_id, array['owner','admin']::public.app_role[]));

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
revoke all on public.webhook_events from anon, authenticated;
revoke insert, update, delete on public.ledger_entries from anon, authenticated;
revoke insert, update, delete on public.payment_transactions from anon, authenticated;
revoke all on function public.has_org_role(uuid, public.app_role[]) from public, anon;
grant execute on function public.has_org_role(uuid, public.app_role[]) to authenticated;
