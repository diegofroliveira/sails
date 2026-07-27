create table public.client_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  status text not null default 'active' check (status in ('lead', 'active', 'paused', 'alumni', 'cancelled')),
  health_score smallint check (health_score between 0 and 100),
  acquisition_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table public.service_catalog (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  category text not null check (category in ('mentoring', 'course', 'community', 'consulting', 'material', 'event')),
  description text,
  deliverables jsonb not null default '[]'::jsonb,
  price_minor bigint not null default 0 check (price_minor >= 0),
  billing_type text not null default 'one_time' check (billing_type in ('one_time', 'monthly', 'installments', 'custom')),
  visibility text not null default 'private' check (visibility in ('public', 'private')),
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_account_id uuid not null references public.client_accounts(id) on delete restrict,
  service_id uuid not null references public.service_catalog(id) on delete restrict,
  contract_number text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'active', 'completed', 'cancelled', 'expired')),
  starts_on date not null,
  ends_on date,
  amount_minor bigint not null check (amount_minor >= 0),
  payment_terms text,
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, contract_number),
  check (ends_on is null or ends_on >= starts_on)
);

create table public.receivables (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_account_id uuid not null references public.client_accounts(id) on delete restrict,
  contract_id uuid references public.client_contracts(id) on delete set null,
  description text not null,
  due_on date not null,
  amount_minor bigint not null check (amount_minor >= 0),
  paid_amount_minor bigint not null default 0 check (paid_amount_minor >= 0),
  status text not null default 'pending' check (status in ('pending', 'overdue', 'partial', 'paid', 'cancelled')),
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (paid_amount_minor <= amount_minor)
);

create table public.business_expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  description text not null,
  vendor text,
  category text not null,
  occurred_on date not null,
  amount_minor bigint not null check (amount_minor >= 0),
  status text not null default 'paid' check (status in ('planned', 'pending', 'paid', 'cancelled')),
  recurring boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index client_accounts_org_status_idx on public.client_accounts(organization_id, status);
create index service_catalog_org_status_idx on public.service_catalog(organization_id, status);
create index client_contracts_org_status_idx on public.client_contracts(organization_id, status);
create index receivables_org_due_idx on public.receivables(organization_id, due_on, status);
create index business_expenses_org_date_idx on public.business_expenses(organization_id, occurred_on desc);

create trigger set_client_accounts_updated_at before update on public.client_accounts for each row execute function public.set_updated_at();
create trigger set_service_catalog_updated_at before update on public.service_catalog for each row execute function public.set_updated_at();
create trigger set_client_contracts_updated_at before update on public.client_contracts for each row execute function public.set_updated_at();
create trigger set_receivables_updated_at before update on public.receivables for each row execute function public.set_updated_at();
create trigger set_business_expenses_updated_at before update on public.business_expenses for each row execute function public.set_updated_at();

alter table public.client_accounts enable row level security;
alter table public.service_catalog enable row level security;
alter table public.client_contracts enable row level security;
alter table public.receivables enable row level security;
alter table public.business_expenses enable row level security;

create policy client_accounts_staff_access on public.client_accounts
for all to authenticated
using (public.has_org_role(organization_id, array['owner','admin','finance','mentor','support']::public.app_role[]))
with check (public.has_org_role(organization_id, array['owner','admin','finance','mentor','support']::public.app_role[]));

create policy service_catalog_staff_access on public.service_catalog
for all to authenticated
using (public.has_org_role(organization_id, array['owner','admin','finance','mentor','support']::public.app_role[]))
with check (public.has_org_role(organization_id, array['owner','admin','finance','mentor','support']::public.app_role[]));

create policy client_contracts_finance_access on public.client_contracts
for all to authenticated
using (public.has_org_role(organization_id, array['owner','admin','finance']::public.app_role[]))
with check (public.has_org_role(organization_id, array['owner','admin','finance']::public.app_role[]));

create policy receivables_finance_access on public.receivables
for all to authenticated
using (public.has_org_role(organization_id, array['owner','admin','finance']::public.app_role[]))
with check (public.has_org_role(organization_id, array['owner','admin','finance']::public.app_role[]));

create policy business_expenses_finance_access on public.business_expenses
for all to authenticated
using (public.has_org_role(organization_id, array['owner','admin','finance']::public.app_role[]))
with check (public.has_org_role(organization_id, array['owner','admin','finance']::public.app_role[]));

grant select, insert, update, delete on public.client_accounts, public.service_catalog, public.client_contracts, public.receivables, public.business_expenses to authenticated;

insert into public.client_accounts (id, organization_id, full_name, email, phone, status, health_score, acquisition_source) values
  ('ca000001-0000-4000-8000-000000000001','df67d7ba-c5e5-4d51-b76f-40bf4052eee3','Marina Lopes','marina@example.com','(11) 99911-2040','active',82,'Indicação'),
  ('ca000001-0000-4000-8000-000000000002','df67d7ba-c5e5-4d51-b76f-40bf4052eee3','Rafael Costa','rafael@example.com','(21) 99844-1028','active',38,'Webinar'),
  ('ca000001-0000-4000-8000-000000000003','df67d7ba-c5e5-4d51-b76f-40bf4052eee3','João Mendes','joao@example.com','(31) 99715-8830','active',61,'LinkedIn'),
  ('ca000001-0000-4000-8000-000000000004','df67d7ba-c5e5-4d51-b76f-40bf4052eee3','Elisa Moura','elisa@example.com','(41) 99628-4402','active',90,'Landing page'),
  ('ca000001-0000-4000-8000-000000000005','df67d7ba-c5e5-4d51-b76f-40bf4052eee3','Bruno Reis','bruno@example.com','(51) 99531-7721','paused',55,'Instagram'),
  ('ca000001-0000-4000-8000-000000000006','df67d7ba-c5e5-4d51-b76f-40bf4052eee3','Camila Rocha','camila@example.com','(61) 99447-3320','lead',72,'YouTube');

insert into public.service_catalog (id, organization_id, name, category, description, deliverables, price_minor, billing_type, visibility, status) values
  ('5e000001-0000-4000-8000-000000000001','df67d7ba-c5e5-4d51-b76f-40bf4052eee3','FROM DATA · Mentoria Premium','mentoring','Jornada individual para acelerar a carreira em Dados.','["Diagnóstico inicial","Plano de ação individual","8 mentorias ao vivo","Revisão de portfólio","Comunidade FROM DATA"]'::jsonb,249000,'installments','private','active'),
  ('5e000001-0000-4000-8000-000000000002','df67d7ba-c5e5-4d51-b76f-40bf4052eee3','Clube SQL Analytics','community','Prática contínua, desafios e encontros coletivos.','["Desafio mensal","Live de dúvidas","Biblioteca de queries","Comunidade"]'::jsonb,29700,'monthly','public','active'),
  ('5e000001-0000-4000-8000-000000000003','df67d7ba-c5e5-4d51-b76f-40bf4052eee3','Career Query · Sessão estratégica','consulting','Diagnóstico e direcionamento de carreira em uma sessão.','["Briefing pré-call","Sessão de 90 minutos","Plano de 30 dias"]'::jsonb,69000,'one_time','public','active');

insert into public.client_contracts (id, organization_id, client_account_id, service_id, contract_number, status, starts_on, ends_on, amount_minor, payment_terms, signed_at) values
  ('c7000001-0000-4000-8000-000000000001','df67d7ba-c5e5-4d51-b76f-40bf4052eee3','ca000001-0000-4000-8000-000000000001','5e000001-0000-4000-8000-000000000001','FD-2026-001','active','2026-07-01','2026-12-31',249000,'3 parcelas de R$ 830,00','2026-06-28 18:00:00+00'),
  ('c7000001-0000-4000-8000-000000000002','df67d7ba-c5e5-4d51-b76f-40bf4052eee3','ca000001-0000-4000-8000-000000000002','5e000001-0000-4000-8000-000000000001','FD-2026-002','active','2026-07-10','2027-01-10',249000,'Pagamento único','2026-07-09 14:30:00+00'),
  ('c7000001-0000-4000-8000-000000000003','df67d7ba-c5e5-4d51-b76f-40bf4052eee3','ca000001-0000-4000-8000-000000000003','5e000001-0000-4000-8000-000000000002','FD-2026-003','active','2026-07-15',null,29700,'Mensal recorrente','2026-07-14 20:00:00+00'),
  ('c7000001-0000-4000-8000-000000000004','df67d7ba-c5e5-4d51-b76f-40bf4052eee3','ca000001-0000-4000-8000-000000000004','5e000001-0000-4000-8000-000000000001','FD-2026-004','sent','2026-08-01','2027-01-31',249000,'3 parcelas de R$ 830,00',null);

insert into public.receivables (organization_id, client_account_id, contract_id, description, due_on, amount_minor, paid_amount_minor, status, payment_method, paid_at) values
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3','ca000001-0000-4000-8000-000000000001','c7000001-0000-4000-8000-000000000001','Mentoria Premium · parcela 1/3','2026-07-05',83000,83000,'paid','Pix','2026-07-05 13:15:00+00'),
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3','ca000001-0000-4000-8000-000000000001','c7000001-0000-4000-8000-000000000001','Mentoria Premium · parcela 2/3','2026-08-05',83000,0,'pending','Pix',null),
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3','ca000001-0000-4000-8000-000000000002','c7000001-0000-4000-8000-000000000002','Mentoria Premium · pagamento único','2026-07-10',249000,249000,'paid','Cartão','2026-07-10 15:10:00+00'),
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3','ca000001-0000-4000-8000-000000000003','c7000001-0000-4000-8000-000000000003','Clube SQL · julho','2026-07-15',29700,29700,'paid','Cartão','2026-07-15 12:00:00+00'),
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3','ca000001-0000-4000-8000-000000000003','c7000001-0000-4000-8000-000000000003','Clube SQL · agosto','2026-08-15',29700,0,'pending','Cartão',null),
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3','ca000001-0000-4000-8000-000000000004','c7000001-0000-4000-8000-000000000004','Mentoria Premium · entrada','2026-08-01',83000,0,'pending','Pix',null);

insert into public.business_expenses (organization_id, description, vendor, category, occurred_on, amount_minor, status, recurring, notes) values
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3','Infraestrutura da plataforma','Cloud & SaaS','Tecnologia','2026-07-03',48900,'paid',true,'Hospedagem, banco e ferramentas'),
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3','Mídia de aquisição','Meta Ads','Marketing','2026-07-08',62000,'paid',false,'Campanha da brief call'),
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3','Design de materiais','Freelancer','Conteúdo','2026-07-12',35000,'paid',false,'Templates da comunidade'),
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3','Ferramenta de reuniões','Read.ai','Tecnologia','2026-07-20',9900,'pending',true,'Ativar após validação do piloto');
