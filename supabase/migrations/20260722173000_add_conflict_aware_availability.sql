create or replace function public.get_from_data_available_slots(p_date date)
returns table(starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  with settings as (
    select
      mt.duration_minutes,
      mt.buffer_before_minutes,
      mt.buffer_after_minutes
    from public.meeting_types mt
    where mt.organization_id = 'df67d7ba-c5e5-4d51-b76f-40bf4052eee3'
      and mt.kind = 'brief_call'
      and mt.status = 'active'
    limit 1
  ), candidates as (
    select
      slot_start as starts_at,
      slot_start + make_interval(mins => s.duration_minutes) as ends_at,
      s.buffer_before_minutes,
      s.buffer_after_minutes
    from public.availability_rules ar
    cross join settings s
    cross join lateral generate_series(
      (p_date + ar.starts_at) at time zone ar.timezone,
      ((p_date + ar.ends_at) at time zone ar.timezone)
        - make_interval(mins => s.duration_minutes + s.buffer_after_minutes),
      interval '30 minutes'
    ) slot_start
    where ar.organization_id = 'df67d7ba-c5e5-4d51-b76f-40bf4052eee3'
      and ar.mentor_user_id = '58e87bfb-8b6f-446a-8604-bd3ff4bd90d9'
      and ar.active
      and ar.weekday = extract(dow from p_date)::smallint
  )
  select c.starts_at, c.ends_at
  from candidates c
  where c.starts_at >= now() + interval '2 hours'
    and c.starts_at < now() + interval '60 days'
    and not exists (
      select 1
      from public.appointments a
      where a.organization_id = 'df67d7ba-c5e5-4d51-b76f-40bf4052eee3'
        and a.status not in ('cancelled', 'no_show')
        and tstzrange(
          a.starts_at,
          a.ends_at,
          '[)'
        ) && tstzrange(
          c.starts_at - make_interval(mins => c.buffer_before_minutes),
          c.ends_at + make_interval(mins => c.buffer_after_minutes),
          '[)'
        )
    )
  order by c.starts_at;
$$;

revoke all on function public.get_from_data_available_slots(date) from public;
grant execute on function public.get_from_data_available_slots(date) to anon, authenticated;

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
  -- Serialize requests for the same slot so two different leads cannot reserve
  -- it between the availability check and the insert.
  perform pg_advisory_xact_lock(
    hashtext('from-data-booking-' || p_starts_at::text)
  );

  if length(trim(p_name)) not between 2 and 120
    or p_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    or length(trim(p_career_goal)) not between 10 and 2000
    or length(trim(p_current_challenge)) not between 10 and 2000
    or p_starts_at < now() + interval '2 hours'
    or p_starts_at > now() + interval '60 days'
    or p_weekly_hours not between 1 and 80 then
    raise exception 'Dados de agendamento inválidos';
  end if;

  if not exists (
    select 1
    from public.get_from_data_available_slots((p_starts_at at time zone 'America/Sao_Paulo')::date) slot
    where slot.starts_at = p_starts_at
  ) then
    raise exception 'Este horário não está mais disponível';
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

update public.integration_connections
set configuration = configuration || jsonb_build_object(
  'booking_calendar_id', coalesce(configuration->>'calendar_id', 'primary'),
  'selected_calendar_ids', jsonb_build_array(coalesce(configuration->>'calendar_id', 'primary'))
)
where organization_id = 'df67d7ba-c5e5-4d51-b76f-40bf4052eee3'
  and provider = 'google_calendar';
