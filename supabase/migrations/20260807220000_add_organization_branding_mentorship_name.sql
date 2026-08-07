alter table public.organization_branding
  add column mentorship_name text;

update public.organization_branding
  set mentorship_name = portal_name
  where mentorship_name is null;
