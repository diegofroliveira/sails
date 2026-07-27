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
  normalized_email text := lower(trim(p_email));
  normalized_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
begin
  if length(trim(p_name)) not between 2 and 120
    or normalized_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    or length(regexp_replace(normalized_phone, '[^0-9]', '', 'g')) not between 10 and 15
    or p_source not in ('from-data-booking', 'from-data-whatsapp') then
    raise exception 'Dados de contato inválidos';
  end if;

  select id into lead_id
  from public.leads
  where organization_id = 'df67d7ba-c5e5-4d51-b76f-40bf4052eee3'
    and lower(email) = normalized_email
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
        phone = normalized_phone,
        source = p_source,
        updated_at = now()
    where id = lead_id;
  end if;

  return lead_id;
end;
$$;

revoke all on function public.capture_from_data_lead(text, text, text, text) from public;
grant execute on function public.capture_from_data_lead(text, text, text, text) to anon, authenticated;
