// The approved recruitment catalogue. Category cards, form controls and the API
// import this file so they cannot silently offer different roles.
export const MAX_RESUME_MB = 4;
export const MAX_RESUME_BYTES = MAX_RESUME_MB * 1024 * 1024;

export const RECRUITMENT_CATEGORIES = [
  {
    id: "medical",
    title: "Medical Faculty & Clinical Professionals",
    icon: "stethoscope",
    designations: [
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Senior Resident",
      "Junior Resident",
      "Consultants and Medical Specialists",
      "Faculty across Pre-clinical, Para-clinical, and Clinical departments",
    ],
  },
  {
    id: "nursing",
    title: "Nursing Professionals",
    icon: "heart-pulse",
    designations: [
      "Nursing Superintendent",
      "Deputy Nursing Superintendent",
      "Nursing Supervisors",
      "Staff Nurses",
      "ICU Nurses",
      "NICU Nurses",
      "PICU Nurses",
      "Emergency Nurses",
      "OT Nurses",
      "Nursing Faculty",
      "Clinical Instructors",
    ],
  },
  {
    id: "allied",
    title: "Allied Healthcare Professionals",
    icon: "microscope",
    designations: [
      "Medical Laboratory Technologists and Technicians",
      "Radiology, CT, and MRI Technologists",
      "OT, Anaesthesia, and Dialysis Technicians",
      "Physiotherapists and Rehabilitation Professionals",
      "Pharmacists",
      "ECG/EEG Technicians",
      "Other Allied Healthcare Professionals",
    ],
  },
  {
    id: "administration",
    title: "Hospital Administration & Support Services",
    icon: "building-2",
    designations: [
      "Medical Superintendent and Hospital Administrators",
      "Hospital Operations and Quality Professionals",
      "HR, Finance, Accounts, and Procurement",
      "Medical Records and Healthcare IT Professionals",
      "Patient Relations, Front Office, and Public Relations",
      "Other essential hospital support and operational staff",
    ],
  },
];

export const ELIGIBILITY_TEXT =
  "Relevant qualifications, experience, and professional registration as applicable to the position and prevailing regulatory norms.";

function key(value) {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, " ") : "";
}

const CATEGORY_ALIASES = {
  medical: "medical",
  "medical faculty": "medical",
  "medical & clinical": "medical",
  "clinical professionals": "medical",
  nursing: "nursing",
  "nursing professional": "nursing",
  "allied healthcare": "allied",
  "allied health": "allied",
  "administration & support": "administration",
  "administration and support": "administration",
  "hospital administration": "administration",
};

export function getRecruitmentCategory(value) {
  const normalized = key(value);
  const id = Object.hasOwn(CATEGORY_ALIASES, normalized) ? CATEGORY_ALIASES[normalized] : normalized;
  return RECRUITMENT_CATEGORIES.find((category) => category.id === id || key(category.title) === normalized) || null;
}

// Explicit compatibility with historical job titles; these map an existing
// opening to a published designation and never create an opening themselves.
const DESIGNATION_ALIASES = {
  medical: {
    consultant: "Consultants and Medical Specialists",
    "medical specialist": "Consultants and Medical Specialists",
  },
  nursing: {
    "nursing supervisor": "Nursing Supervisors",
    "staff nurse": "Staff Nurses",
    "icu nurse": "ICU Nurses",
    "nicu nurse": "NICU Nurses",
    "picu nurse": "PICU Nurses",
    "emergency nurse": "Emergency Nurses",
    "ot nurse": "OT Nurses",
    "clinical instructor": "Clinical Instructors",
  },
  allied: {
    "lab technician": "Medical Laboratory Technologists and Technicians",
    "medical laboratory technician": "Medical Laboratory Technologists and Technicians",
    "medical laboratory technologist": "Medical Laboratory Technologists and Technicians",
    "radiology technologist": "Radiology, CT, and MRI Technologists",
    "ct technologist": "Radiology, CT, and MRI Technologists",
    "mri technologist": "Radiology, CT, and MRI Technologists",
    "ot technician": "OT, Anaesthesia, and Dialysis Technicians",
    "anaesthesia technician": "OT, Anaesthesia, and Dialysis Technicians",
    "dialysis technician": "OT, Anaesthesia, and Dialysis Technicians",
    physiotherapist: "Physiotherapists and Rehabilitation Professionals",
    pharmacist: "Pharmacists",
    "ecg technician": "ECG/EEG Technicians",
    "eeg technician": "ECG/EEG Technicians",
  },
  administration: {
    "medical superintendent": "Medical Superintendent and Hospital Administrators",
    "hospital administrator": "Medical Superintendent and Hospital Administrators",
    "hr executive": "HR, Finance, Accounts, and Procurement",
  },
};

export function getRecruitmentDesignation(categoryValue, value) {
  const category = getRecruitmentCategory(categoryValue);
  if (!category) return null;
  const normalized = key(value);
  const aliases = DESIGNATION_ALIASES[category.id] || {};
  return category.designations.find((designation) => key(designation) === normalized)
    || (Object.hasOwn(aliases, normalized) ? aliases[normalized] : null)
    || null;
}

export function isValidCategoryDesignation(categoryValue, value) {
  return Boolean(getRecruitmentDesignation(categoryValue, value));
}

export function normalizeRecruitmentJob(job) {
  const category = getRecruitmentCategory(job?.category);
  const designation = getRecruitmentDesignation(category?.id, job?.title);
  if (!category || !designation || job?.is_active === false) return null;
  return { ...job, category: category.title, category_id: category.id, designation };
}
