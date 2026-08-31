-- Acharya Purushottam Hospital & Medical College
-- Recruitment schema for Supabase PostgreSQL + Storage
-- Run this in the Supabase SQL editor before seed.sql

create extension if not exists "pgcrypto";

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  category text,
  description text,
  qualification text,
  specialization text,
  experience_min integer,
  experience_max integer,
  location text,
  employment_type text,
  salary_range text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id),
  full_name text not null,
  email text not null,
  mobile text not null,
  date_of_birth date,
  gender text,
  applying_for text not null,
  department text not null,
  qualification text not null,
  specialization text,
  total_experience numeric,
  current_organization text,
  current_designation text,
  current_location text,
  expected_salary text,
  notice_period text,
  resume_path text not null,
  status text not null default 'new'
    check (status in ('new', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_is_active_idx on public.jobs (is_active);
create index if not exists jobs_department_idx on public.jobs (department);
create index if not exists applications_email_idx on public.applications (email);
create index if not exists applications_status_idx on public.applications (status);
create index if not exists applications_job_id_idx on public.applications (job_id);
create index if not exists applications_created_at_idx on public.applications (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

alter table public.jobs enable row level security;
alter table public.applications enable row level security;

-- No anon/authenticated policies: the Node.js service role bypasses RLS.
-- Candidates cannot query applications or jobs directly from the browser.

revoke all on public.jobs from anon, authenticated;
revoke all on public.applications from anon, authenticated;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do update set public = false;

-- Private bucket: do not add anon/authenticated policies for `resumes`.
-- No matching policy means candidates cannot list or download files.
-- The Node.js secret key bypasses RLS for server-side uploads.
