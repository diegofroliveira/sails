create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null check (provider in ('google_calendar', 'read_ai', 'gemini')),
  account_label text,
  secret_reference text,
  configuration jsonb not null default '{}'::jsonb,
  status text not null default 'disconnected' check (status in ('disconnected', 'pending', 'connected', 'error')),
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider)
);

create table public.meeting_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  kind text not null check (kind in ('brief_call', 'mentoring', 'live', 'office_hours')),
  duration_minutes integer not null check (duration_minutes between 15 and 480),
  buffer_before_minutes integer not null default 0 check (buffer_before_minutes between 0 and 120),
  buffer_after_minutes integer not null default 0 check (buffer_after_minutes between 0 and 120),
  location_type text not null default 'google_meet' check (location_type in ('google_meet', 'zoom', 'physical', 'custom')),
  intake_required boolean not null default false,
  max_attendees integer not null default 1 check (max_attendees > 0),
  color text not null default '#06b6d4' check (color ~ '^#[0-9a-fA-F]{6}$'),
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  mentor_user_id uuid not null references auth.users(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  timezone text not null default 'America/Sao_Paulo',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at),
  unique (organization_id, mentor_user_id, weekday, starts_at, ends_at)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  meeting_type_id uuid not null references public.meeting_types(id),
  mentor_user_id uuid not null references auth.users(id),
  student_id uuid references public.students(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  attendee_name text not null,
  attendee_email text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'America/Sao_Paulo',
  status text not null default 'scheduled' check (status in ('pending', 'scheduled', 'completed', 'cancelled', 'no_show')),
  google_event_id text,
  conference_url text,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at),
  unique (organization_id, attendee_email, starts_at),
  unique (organization_id, google_event_id)
);

create table public.intake_briefings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  career_role text,
  experience_level text,
  career_goal text not null,
  current_challenge text not null,
  desired_outcome text,
  weekly_availability_hours numeric(4,1) check (weekly_availability_hours between 0 and 100),
  tools_and_skills text[] not null default '{}',
  portfolio_url text,
  linkedin_url text,
  context_notes text,
  ai_processing_consent boolean not null default false,
  privacy_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meeting_intelligence (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  read_meeting_id text,
  report_url text,
  summary text,
  action_items jsonb not null default '[]'::jsonb,
  key_topics jsonb not null default '[]'::jsonb,
  transcript_retained boolean not null default false,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, read_meeting_id)
);

create table public.mentoring_action_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'shared', 'archived')),
  objective text not null,
  diagnosis_summary text not null,
  milestones jsonb not null default '[]'::jsonb,
  next_actions jsonb not null default '[]'::jsonb,
  success_metrics jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  model_provider text,
  model_name text,
  generated_at timestamptz,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  shared_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index appointments_org_time_idx on public.appointments (organization_id, starts_at);
create index appointments_mentor_time_idx on public.appointments (mentor_user_id, starts_at);
create index action_plans_org_status_idx on public.mentoring_action_plans (organization_id, status);

create trigger integration_connections_updated_at before update on public.integration_connections for each row execute function public.set_updated_at();
create trigger meeting_types_updated_at before update on public.meeting_types for each row execute function public.set_updated_at();
create trigger availability_rules_updated_at before update on public.availability_rules for each row execute function public.set_updated_at();
create trigger appointments_updated_at before update on public.appointments for each row execute function public.set_updated_at();
create trigger intake_briefings_updated_at before update on public.intake_briefings for each row execute function public.set_updated_at();
create trigger meeting_intelligence_updated_at before update on public.meeting_intelligence for each row execute function public.set_updated_at();
create trigger mentoring_action_plans_updated_at before update on public.mentoring_action_plans for each row execute function public.set_updated_at();

alter table public.integration_connections enable row level security;
alter table public.meeting_types enable row level security;
alter table public.availability_rules enable row level security;
alter table public.appointments enable row level security;
alter table public.intake_briefings enable row level security;
alter table public.meeting_intelligence enable row level security;
alter table public.mentoring_action_plans enable row level security;

create policy integration_connections_admin_access
  on public.integration_connections for all to authenticated
  using (public.has_org_role(organization_id, array['owner','admin']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner','admin']::public.app_role[]));

create policy meeting_types_member_read
  on public.meeting_types for select to authenticated
  using (public.has_org_role(organization_id));

create policy meeting_types_admin_manage
  on public.meeting_types for all to authenticated
  using (public.has_org_role(organization_id, array['owner','admin','mentor']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner','admin','mentor']::public.app_role[]));

create policy availability_member_read
  on public.availability_rules for select to authenticated
  using (public.has_org_role(organization_id));

create policy availability_mentor_manage
  on public.availability_rules for all to authenticated
  using (
    public.has_org_role(organization_id, array['owner','admin']::public.app_role[])
    or (mentor_user_id = (select auth.uid()) and public.has_org_role(organization_id, array['mentor']::public.app_role[]))
  )
  with check (
    public.has_org_role(organization_id, array['owner','admin']::public.app_role[])
    or (mentor_user_id = (select auth.uid()) and public.has_org_role(organization_id, array['mentor']::public.app_role[]))
  );

create policy appointments_staff_manage
  on public.appointments for all to authenticated
  using (public.has_org_role(organization_id, array['owner','admin','mentor','support']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner','admin','mentor','support']::public.app_role[]));

create policy appointments_student_read
  on public.appointments for select to authenticated
  using (
    exists (
      select 1 from public.students s
      where s.id = appointments.student_id and s.user_id = (select auth.uid())
    )
  );

create policy intake_briefings_staff_manage
  on public.intake_briefings for all to authenticated
  using (public.has_org_role(organization_id, array['owner','admin','mentor','support']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner','admin','mentor','support']::public.app_role[]));

create policy intake_briefings_student_manage
  on public.intake_briefings for all to authenticated
  using (
    exists (
      select 1 from public.appointments a join public.students s on s.id = a.student_id
      where a.id = intake_briefings.appointment_id and s.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.appointments a join public.students s on s.id = a.student_id
      where a.id = intake_briefings.appointment_id and s.user_id = (select auth.uid())
    )
  );

create policy meeting_intelligence_staff_access
  on public.meeting_intelligence for all to authenticated
  using (public.has_org_role(organization_id, array['owner','admin','mentor']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner','admin','mentor']::public.app_role[]));

create policy action_plans_staff_manage
  on public.mentoring_action_plans for all to authenticated
  using (public.has_org_role(organization_id, array['owner','admin','mentor']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner','admin','mentor']::public.app_role[]));

create policy action_plans_student_read_shared
  on public.mentoring_action_plans for select to authenticated
  using (
    status = 'shared' and exists (
      select 1 from public.students s
      where s.id = mentoring_action_plans.student_id and s.user_id = (select auth.uid())
    )
  );

grant select, insert, update, delete on public.integration_connections, public.meeting_types,
  public.availability_rules, public.appointments, public.intake_briefings,
  public.meeting_intelligence, public.mentoring_action_plans to authenticated;

insert into public.organizations (id, name, slug, owner_id)
values ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3', 'FROM DATA', 'from-data', '58e87bfb-8b6f-446a-8604-bd3ff4bd90d9')
on conflict (slug) do update set name = excluded.name, owner_id = excluded.owner_id;

update public.profiles
set full_name = 'Diego Oliveira'
where id = '58e87bfb-8b6f-446a-8604-bd3ff4bd90d9';

insert into public.organization_branding (
  organization_id, portal_name, tagline, primary_color, accent_color,
  logo_url, email_sender_name, hide_sails_branding
)
values (
  'df67d7ba-c5e5-4d51-b76f-40bf4052eee3',
  'FROM DATA',
  'Every career starts with a FROM.',
  '#06b6d4',
  '#8b5cf6',
  '/from-data-logo.png',
  'Diego · FROM DATA',
  false
)
on conflict (organization_id) do update set
  portal_name = excluded.portal_name,
  tagline = excluded.tagline,
  primary_color = excluded.primary_color,
  accent_color = excluded.accent_color,
  logo_url = excluded.logo_url,
  email_sender_name = excluded.email_sender_name;

insert into public.organization_addons (
  organization_id, addon_code, status, setup_amount_cents, monthly_amount_cents, trial_ends_at, activated_at
)
values (
  'df67d7ba-c5e5-4d51-b76f-40bf4052eee3', 'custom_branding', 'trial', 49000, 14900,
  now() + interval '90 days', now()
)
on conflict (organization_id, addon_code) do nothing;

insert into public.meeting_types (
  organization_id, name, description, kind, duration_minutes, buffer_after_minutes,
  intake_required, max_attendees, color
)
values
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3', 'Brief call FROM DATA', 'Diagnóstico inicial para entender momento, objetivo e próximos passos.', 'brief_call', 30, 15, true, 1, '#06b6d4'),
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3', 'Mentoria individual', 'Sessão individual de acompanhamento e direção.', 'mentoring', 60, 15, false, 1, '#8b5cf6'),
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3', 'Live FROM DATA', 'Encontro coletivo ao vivo da comunidade.', 'live', 90, 15, false, 100, '#3b82f6')
on conflict (organization_id, name) do nothing;

insert into public.availability_rules (
  organization_id, mentor_user_id, weekday, starts_at, ends_at, timezone
)
values
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3', '58e87bfb-8b6f-446a-8604-bd3ff4bd90d9', 2, '18:00', '21:00', 'America/Sao_Paulo'),
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3', '58e87bfb-8b6f-446a-8604-bd3ff4bd90d9', 4, '18:00', '21:00', 'America/Sao_Paulo')
on conflict do nothing;

insert into public.integration_connections (organization_id, provider, account_label, status, configuration)
values
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3', 'google_calendar', 'diego.fjddf@gmail.com', 'pending', '{"calendar_id":"primary","timezone":"America/Sao_Paulo"}'::jsonb),
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3', 'read_ai', 'FROM DATA meetings', 'pending', '{"mode":"webhook_and_rest"}'::jsonb),
  ('df67d7ba-c5e5-4d51-b76f-40bf4052eee3', 'gemini', 'Plano de ação FROM DATA', 'pending', '{"tier":"free","human_approval_required":true}'::jsonb)
on conflict (organization_id, provider) do update set account_label = excluded.account_label, configuration = excluded.configuration;

create or replace function public.request_from_data_brief_call(
  p_name text,
  p_email text,
  p_starts_at timestamptz,
  p_career_role text,
  p_experience_level text,
  p_career_goal text,
  p_current_challenge text,
  p_weekly_hours numeric,
  p_ai_consent boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  appointment_id uuid;
  meeting_type_id uuid;
begin
  if length(trim(p_name)) not between 2 and 120
    or p_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    or length(trim(p_career_goal)) not between 10 and 2000
    or length(trim(p_current_challenge)) not between 10 and 2000
    or p_starts_at < now() + interval '30 minutes'
    or p_starts_at > now() + interval '180 days'
    or p_weekly_hours not between 1 and 80 then
    raise exception 'Dados de agendamento inválidos';
  end if;

  select id into meeting_type_id
  from public.meeting_types
  where organization_id = 'df67d7ba-c5e5-4d51-b76f-40bf4052eee3'
    and kind = 'brief_call'
    and status = 'active'
  limit 1;

  insert into public.appointments (
    organization_id, meeting_type_id, mentor_user_id, attendee_name, attendee_email,
    starts_at, ends_at, timezone, status
  ) values (
    'df67d7ba-c5e5-4d51-b76f-40bf4052eee3', meeting_type_id,
    '58e87bfb-8b6f-446a-8604-bd3ff4bd90d9', trim(p_name), lower(trim(p_email)),
    p_starts_at, p_starts_at + interval '30 minutes', 'America/Sao_Paulo', 'pending'
  ) returning id into appointment_id;

  insert into public.intake_briefings (
    organization_id, appointment_id, career_role, experience_level, career_goal,
    current_challenge, weekly_availability_hours, ai_processing_consent, privacy_consent_at
  ) values (
    'df67d7ba-c5e5-4d51-b76f-40bf4052eee3', appointment_id, nullif(trim(p_career_role), ''),
    nullif(trim(p_experience_level), ''), trim(p_career_goal), trim(p_current_challenge),
    p_weekly_hours, p_ai_consent, case when p_ai_consent then now() else null end
  );

  return appointment_id;
exception
  when unique_violation then
    raise exception 'Este horário ou e-mail já possui um agendamento';
end;
$$;

revoke all on function public.request_from_data_brief_call(text, text, timestamptz, text, text, text, text, numeric, boolean) from public;
grant execute on function public.request_from_data_brief_call(text, text, timestamptz, text, text, text, text, numeric, boolean) to anon, authenticated;
