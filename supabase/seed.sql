-- Sample active jobs for local/demo use.
-- Replace or deactivate these before production if they are not real openings.

insert into public.jobs (
  title,
  department,
  category,
  description,
  qualification,
  specialization,
  experience_min,
  experience_max,
  location,
  employment_type,
  salary_range,
  is_active
) values
(
  'Medical Officer',
  'Clinical',
  'Medical',
  'Support clinical services as part of the hospital care team.',
  'MBBS',
  null,
  2,
  null,
  'Jaipur',
  'Full-time',
  null,
  true
),
(
  'Staff Nurse',
  'Nursing',
  'Nursing',
  'Provide nursing care as part of the multidisciplinary team.',
  'GNM / B.Sc Nursing',
  null,
  1,
  null,
  'Jaipur',
  'Full-time',
  null,
  true
),
(
  'HR Executive',
  'Administration',
  'Administration & Support',
  'Support recruitment and people operations.',
  'Graduate in HR / Business Administration',
  'Human Resources',
  2,
  null,
  'Jaipur',
  'Full-time',
  null,
  true
),
(
  'Lab Technician',
  'Allied Healthcare',
  'Allied Healthcare',
  'Support laboratory services and diagnostics.',
  'DMLT / B.Sc MLT',
  'Laboratory',
  1,
  4,
  'Jaipur',
  'Full-time',
  null,
  true
);
