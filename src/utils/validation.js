export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ALLOWED_RESUME_EXTS = [".pdf", ".doc", ".docx"];
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

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
  const extOk = ALLOWED_RESUME_EXTS.some((ext) => name.endsWith(ext));
  const typeOk = !file.type || ALLOWED_RESUME_TYPES.includes(file.type);
  if (!extOk && !typeOk) {
    return { ok: false, message: "Resume must be a PDF, DOC, or DOCX file." };
  }
  if (file.size > MAX_RESUME_BYTES) {
    return { ok: false, message: "Resume must be 5 MB or smaller." };
  }
  return { ok: true };
}

export function validateApplication(values, file) {
  const errors = {};

  if (!values.fullName?.trim()) errors.fullName = "Full name is required.";
  if (!values.email?.trim()) errors.email = "Email address is required.";
  else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.mobile?.trim()) errors.mobile = "Mobile number is required.";
  else if (!isValidIndianMobile(values.mobile)) {
    errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  }

  if (!values.applyingFor?.trim()) {
    errors.applyingFor = "Please select the role you are applying for.";
  }
  if (!values.department?.trim()) errors.department = "Department is required.";
  if (!values.qualification?.trim()) {
    errors.qualification = "Qualification is required.";
  }
  if (
    values.totalExperience === "" ||
    values.totalExperience === null ||
    values.totalExperience === undefined
  ) {
    errors.totalExperience = "Total experience is required.";
  } else if (Number.isNaN(Number(values.totalExperience)) || Number(values.totalExperience) < 0) {
    errors.totalExperience = "Enter a valid number of years.";
  }

  const fileCheck = isValidResumeFile(file);
  if (!fileCheck.ok) errors.resume = fileCheck.message;

  if (!values.confirmed) {
    errors.confirmed = "Please confirm that the information provided is accurate.";
  }

  return errors;
}
