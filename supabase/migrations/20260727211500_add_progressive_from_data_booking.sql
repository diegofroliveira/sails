create or replace function public.capture_from_data_lead(
  p_name text,
  p_email text,
  p_phone text,
  p_source text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  lead_id uuid;
  normalized_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  normalized_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
begin
  if length(trim(p_name)) not between 2 and 120
    or length(regexp_replace(normalized_phone, '[^0-9]', '', 'g')) not between 10 and 15
    or p_source not in ('from-data-booking', 'from-data-whatsapp')
    or (p_source = 'from-data-booking' and normalized_email is null)
    or (normalized_email is not null and normalized_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$') then
    raise exception 'Dados de contato inválidos';
  end if;

  select id into lead_id
  from public.leads
  where organization_id = 'df67d7ba-c5e5-4d51-b76f-40bf4052eee3'
    and (
      (normalized_email is not null and lower(email) = normalized_email)
      or regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') = regexp_replace(normalized_phone, '[^0-9]', '', 'g')
    )
  order by created_at desc
  limit 1;

  if lead_id is null then
    insert into public.leads (
      organization_id, full_name, email, phone, source, stage
    ) values (
      'df67d7ba-c5e5-4d51-b76f-40bf4052eee3',
      trim(p_name), normalized_email, normalized_phone, p_source, 'new'
    )
    returning id into lead_id;
  else
    update public.leads
    set full_name = trim(p_name),
        email = coalesce(normalized_email, email),
        phone = normalized_phone,
        source = p_source,
        updated_at = now()
    where id = lead_id;
  end if;

  return lead_id;
end;
$$;

create or replace function public.request_from_data_quick_call(
  p_name text,
  p_email text,
  p_phone text,
  p_starts_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  appointment_id uuid;
  meeting_type_id uuid;
  captured_lead_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('from-data-booking-' || p_starts_at::text));

  if length(trim(p_name)) not between 2 and 120
    or p_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    or length(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')) not between 10 and 15
    or p_starts_at < now() + interval '2 hours'
    or p_starts_at > now() + interval '60 days' then
    raise exception 'Dados de agendamento inválidos';
  end if;

  if not exists (
    select 1
    from public.get_from_data_available_slots((p_starts_at at time zone 'America/Sao_Paulo')::date) slot
    where slot.starts_at = p_starts_at
  ) then
    raise exception 'Este horário não está mais disponível';
  end if;

  captured_lead_id := public.capture_from_data_lead(
    p_name, p_email, p_phone, 'from-data-booking'
  );

  select id into meeting_type_id
  from public.meeting_types
  where organization_id = 'df67d7ba-c5e5-4d51-b76f-40bf4052eee3'
    and kind = 'brief_call'
    and status = 'active'
  limit 1;

  insert into public.appointments (
    organization_id, meeting_type_id, mentor_user_id, lead_id, attendee_name,
    attendee_email, starts_at, ends_at, timezone, status
  ) values (
    'df67d7ba-c5e5-4d51-b76f-40bf4052eee3', meeting_type_id,
    '58e87bfb-8b6f-446a-8604-bd3ff4bd90d9', captured_lead_id, trim(p_name),
    lower(trim(p_email)), p_starts_at, p_starts_at + interval '30 minutes',
    'America/Sao_Paulo', 'pending'
  )
  returning id into appointment_id;

  return appointment_id;
exception
  when unique_violation then
    raise exception 'Este horário ou e-mail já possui um agendamento';
end;
$$;

create or replace function public.save_from_data_optional_briefing(
  p_appointment_id uuid,
  p_email text,
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
  briefing_id uuid;
begin
  if p_weekly_hours not between 1 and 80
    or not exists (
      select 1
      from public.appointments a
      where a.id = p_appointment_id
        and a.organization_id = 'df67d7ba-c5e5-4d51-b76f-40bf4052eee3'
        and lower(a.attendee_email) = lower(trim(p_email))
        and a.status in ('pending', 'scheduled')
    ) then
    raise exception 'Agendamento inválido';
  end if;

  insert into public.intake_briefings (
    organization_id, appointment_id, career_role, experience_level, career_goal,
    current_challenge, weekly_availability_hours, ai_processing_consent,
    privacy_consent_at
  ) values (
    'df67d7ba-c5e5-4d51-b76f-40bf4052eee3', p_appointment_id,
    nullif(trim(p_career_role), ''), nullif(trim(p_experience_level), ''),
    coalesce(nullif(trim(p_career_goal), ''), 'A aprofundar na call'),
    coalesce(nullif(trim(p_current_challenge), ''), 'A aprofundar na call'),
    p_weekly_hours, p_ai_consent, now()
  )
  on conflict (appointment_id) do update
  set career_role = excluded.career_role,
      experience_level = excluded.experience_level,
      career_goal = excluded.career_goal,
      current_challenge = excluded.current_challenge,
      weekly_availability_hours = excluded.weekly_availability_hours,
      ai_processing_consent = excluded.ai_processing_consent,
      privacy_consent_at = excluded.privacy_consent_at,
      updated_at = now()
  returning id into briefing_id;

  return briefing_id;
end;
$$;

revoke all on function public.capture_from_data_lead(text, text, text, text) from public;
revoke all on function public.request_from_data_quick_call(text, text, text, timestamptz) from public;
revoke all on function public.save_from_data_optional_briefing(uuid, text, text, text, text, text, numeric, boolean) from public;

grant execute on function public.capture_from_data_lead(text, text, text, text) to anon, authenticated;
grant execute on function public.request_from_data_quick_call(text, text, text, timestamptz) to anon, authenticated;
grant execute on function public.save_from_data_optional_briefing(uuid, text, text, text, text, text, numeric, boolean) to anon, authenticated;
