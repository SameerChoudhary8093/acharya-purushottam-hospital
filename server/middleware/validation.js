const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeMobile(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  return digits;
}

function isValidIndianMobile(value) {
  return /^[6-9]\d{9}$/.test(normalizeMobile(value));
}

function optionalDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return value;
}

export function validateApplicationPayload(body, file) {
  const fields = {};

  const fullName = String(body.full_name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const mobileRaw = String(body.mobile || "").trim();
  const applyingFor = String(body.applying_for || "").trim();
  const department = String(body.department || "").trim();
  const qualification = String(body.qualification || "").trim();
  const confirmed = String(body.confirmed || "") === "true";

  if (!fullName) fields.fullName = "Full name is required.";
  if (!email) fields.email = "Email address is required.";
  else if (!EMAIL_RE.test(email)) fields.email = "Enter a valid email address.";

  if (!mobileRaw) fields.mobile = "Mobile number is required.";
  else if (!isValidIndianMobile(mobileRaw)) {
    fields.mobile = "Enter a valid 10-digit Indian mobile number.";
  }

  if (!applyingFor) fields.applyingFor = "Please select the role you are applying for.";
  if (!department) fields.department = "Department is required.";
  if (!qualification) fields.qualification = "Qualification is required.";

  const experienceRaw = body.total_experience;
  if (experienceRaw === undefined || experienceRaw === null || experienceRaw === "") {
    fields.totalExperience = "Total experience is required.";
  } else if (Number.isNaN(Number(experienceRaw)) || Number(experienceRaw) < 0) {
    fields.totalExperience = "Enter a valid number of years.";
  }

  if (!confirmed) {
    fields.confirmed = "Please confirm that the information provided is accurate.";
  }

  if (!file) fields.resume = "Please upload your resume.";

  const dateOfBirth = optionalDate(body.date_of_birth);
  if (dateOfBirth === undefined) fields.dateOfBirth = "Enter a valid date of birth.";

  const jobId = String(body.job_id || "").trim();
  if (jobId && !UUID_RE.test(jobId)) fields.applyingFor = "Invalid position selected.";

  if (Object.keys(fields).length > 0) {
    const error = new Error("Please check the form and try again.");
    error.status = 400;
    error.fields = fields;
    throw error;
  }

  return {
    job_id: jobId || null,
    full_name: fullName,
    email,
    mobile: normalizeMobile(mobileRaw),
    date_of_birth: dateOfBirth,
    gender: String(body.gender || "").trim() || null,
    applying_for: applyingFor,
    department,
    qualification,
    specialization: String(body.specialization || "").trim() || null,
    total_experience: Number(experienceRaw),
    current_organization: String(body.current_organization || "").trim() || null,
    current_designation: String(body.current_designation || "").trim() || null,
    current_location: String(body.current_location || "").trim() || null,
    expected_salary: String(body.expected_salary || "").trim() || null,
    notice_period: String(body.notice_period || "").trim() || null,
  };
}
