import { getRecruitmentCategory, getRecruitmentDesignation } from "../../shared/recruitment.js";
import { validateResumeContent } from "./upload.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return typeof value === "string" && UUID_RE.test(value);
}

function normalizeMobile(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  return digits;
}

function optionalDate(value) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value || date > new Date()) return undefined;
  return value;
}

export function validateApplicationPayload(body, file) {
  const fields = {};
  function text(name, label, max = 200) {
    const raw = body[name];
    if (raw === undefined || raw === null) return "";
    if (typeof raw !== "string" || raw.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(raw)) {
      fields[label] = `Enter a valid value (maximum ${max} characters).`;
      return "";
    }
    return raw.trim();
  }

  const fullName = text("full_name", "fullName");
  const email = text("email", "email", 254).toLowerCase();
  const mobileRaw = text("mobile", "mobile", 25);
  const category = getRecruitmentCategory(text("hiring_category", "hiringCategory"));
  const applyingFor = getRecruitmentDesignation(category?.id, text("applying_for", "applyingFor"));
  const department = text("department", "department");
  const qualification = text("qualification", "qualification", 500);
  const confirmed = body.confirmed === "true" || body.confirmed === true;

  if (!fullName) fields.fullName ||= "Full name is required.";
  if (!email) fields.email ||= "Email address is required.";
  else if (!EMAIL_RE.test(email)) fields.email = "Enter a valid email address.";
  if (!mobileRaw) fields.mobile ||= "Mobile number is required.";
  else if (!/^[+\d\s()-]+$/.test(mobileRaw) || !/^[6-9]\d{9}$/.test(normalizeMobile(mobileRaw))) {
    fields.mobile = "Enter a valid 10-digit Indian mobile number.";
  }

  if (!category) fields.hiringCategory = "Please select one of the four hiring categories.";
  if (!applyingFor) fields.applyingFor = "Please select a designation from your hiring category.";
  if (!qualification) fields.qualification ||= "Qualification is required.";

  const experienceRaw = text("total_experience", "totalExperience", 64);
  const experience = Number(experienceRaw);
  if (!experienceRaw) fields.totalExperience ||= "Total experience is required.";
  else if (!/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(experienceRaw) || !Number.isFinite(experience) || experience < 0 || experience > Number.MAX_SAFE_INTEGER) {
    fields.totalExperience = "Enter a valid non-negative number of years.";
  }
  if (!confirmed) fields.confirmed = "Please confirm that the information provided is accurate.";
  if (!file) fields.resume = "Please upload your resume.";
  else validateResumeContent(file);

  const dateOfBirth = optionalDate(text("date_of_birth", "dateOfBirth", 10));
  if (dateOfBirth === undefined) fields.dateOfBirth = "Enter a valid date of birth that is not in the future.";
  const jobId = text("job_id", "applyingFor", 36);
  if (jobId && !isUuid(jobId)) fields.applyingFor = "Invalid position selected.";

  const optional = {
    gender: text("gender", "gender", 50) || null,
    specialization: text("specialization", "specialization", 500) || null,
    current_organization: text("current_organization", "currentOrganization", 300) || null,
    current_designation: text("current_designation", "currentDesignation", 300) || null,
    current_location: text("current_location", "currentLocation", 300) || null,
    expected_salary: text("expected_salary", "expectedSalary", 200) || null,
    notice_period: text("notice_period", "noticePeriod", 200) || null,
  };
  if (optional.gender && !["female", "male", "other", "prefer_not_to_say"].includes(optional.gender)) {
    fields.gender = "Select a valid gender option.";
  }
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
    hiring_category: category.title,
    applying_for: applyingFor,
    department: department || null,
    qualification,
    total_experience: experience,
    confirmed,
    ...optional,
  };
}
