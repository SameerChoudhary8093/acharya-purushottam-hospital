-- REVIEW BEFORE RUNNING in the Supabase SQL editor. Do not reset the database.
-- Existing applications and jobs are retained; no candidate details are changed.
begin;

alter table public.applications
  add column if not exists hiring_category text,
  add column if not exists confirmed boolean;
alter table public.applications alter column department drop not null;

-- Historical applications have NULL for information that was not collected.
-- NOT VALID protects existing rows; the API validates every new submission.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'applications_hiring_category_approved'
      and conrelid = 'public.applications'::regclass
  ) then
    alter table public.applications add constraint applications_hiring_category_approved
    check (hiring_category is null or hiring_category in (
      'Medical Faculty & Clinical Professionals',
      'Nursing Professionals',
      'Allied Healthcare Professionals',
      'Hospital Administration & Support Services'
    )) not valid;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'applications_confirmed_when_collected'
      and conrelid = 'public.applications'::regclass
  ) then
    alter table public.applications add constraint applications_confirmed_when_collected
    check (confirmed is null or confirmed = true) not valid;
  end if;
end;
$$;

alter table public.applications enable row level security;
revoke all on public.applications from anon, authenticated;

-- Four MiB leaves multipart overhead below Vercel's 4.5 MB body limit.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', false, 4194304, array[
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Recruitment resumes are server-only" on storage.objects;
create policy "Recruitment resumes are server-only"
on storage.objects as restrictive
for all to anon, authenticated
using (bucket_id <> 'resumes')
with check (bucket_id <> 'resumes');

commit;
