import { MAX_RESUME_BYTES, MAX_RESUME_MB, getRecruitmentCategory } from "../../shared/recruitment.js";

export { MAX_RESUME_BYTES };

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RESUME_TYPE_BY_EXTENSION = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function normalizeMobile(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  return digits;
}

export function isValidIndianMobile(value) {
  return /^[6-9]\d{9}$/.test(normalizeMobile(value));
}

export function isValidResumeFile(file) {
  if (!file) return { ok: false, message: "Please upload your resume." };
  const name = (file.name || "").toLowerCase();
  const extension = Object.keys(RESUME_TYPE_BY_EXTENSION).find((ext) => name.endsWith(ext));
  const typeOk = !file.type || file.type === RESUME_TYPE_BY_EXTENSION[extension];
  if (!extension || !typeOk) {
    return { ok: false, message: "Resume must be a PDF, DOC, or DOCX file." };
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { ok: false, message: "Resume must not be empty." };
  }
  if (file.size > MAX_RESUME_BYTES) {
    return { ok: false, message: `Resume must be ${MAX_RESUME_MB} MB or smaller.` };
  }
  return { ok: true };
}

function isValidDateOfBirth(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && value <= new Date().toISOString().slice(0, 10);
}

export function validateApplication(values, file) {
  const errors = {};
  if (!values.fullName?.trim()) errors.fullName = "Full name is required.";
  if (!values.email?.trim()) errors.email = "Email address is required.";
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!values.mobile?.trim()) errors.mobile = "Mobile number is required.";
  else if (!isValidIndianMobile(values.mobile)) errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  if (values.dateOfBirth && !isValidDateOfBirth(values.dateOfBirth)) errors.dateOfBirth = "Enter a valid date of birth that is not in the future.";
  if (values.gender && !["female", "male", "other", "prefer_not_to_say"].includes(values.gender)) errors.gender = "Select a valid gender option.";

  const category = getRecruitmentCategory(values.hiringCategory);
  if (!category || category.id !== values.hiringCategory) errors.hiringCategory = "Please select a hiring category.";
  if (!values.applyingFor?.trim()) errors.applyingFor = "Please select the designation you are applying for.";
  else if (!category?.designations.includes(values.applyingFor)) errors.applyingFor = "Select a designation within your chosen hiring category.";
  if (!values.qualification?.trim()) errors.qualification = "Qualification is required.";
  if (values.totalExperience === "" || values.totalExperience === null || values.totalExperience === undefined) {
    errors.totalExperience = "Total experience is required.";
  } else if (!Number.isFinite(Number(values.totalExperience)) || Number(values.totalExperience) < 0) {
    errors.totalExperience = "Enter a valid number of years.";
  }
  const fileCheck = isValidResumeFile(file);
  if (!fileCheck.ok) errors.resume = fileCheck.message;
  if (!values.confirmed) errors.confirmed = "Please confirm that the information provided is accurate.";
  return errors;
}
