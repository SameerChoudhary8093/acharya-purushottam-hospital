import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { MAX_RESUME_MB, RECRUITMENT_CATEGORIES, getRecruitmentCategory } from "../../shared/recruitment.js";
import Button from "./Button";
import { submitApplication } from "../services/api";
import { validateApplication } from "../utils/validation";

const EMPTY = {
  fullName: "",
  email: "",
  mobile: "",
  dateOfBirth: "",
  gender: "",
  hiringCategory: "",
  applyingFor: "",
  department: "",
  qualification: "",
  specialization: "",
  totalExperience: "",
  currentOrganization: "",
  currentDesignation: "",
  currentLocation: "",
  expectedSalary: "",
  noticePeriod: "",
  confirmed: false,
};

const inputClass =
  "min-h-11 min-w-0 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-navy outline-none transition-colors placeholder:text-slate-400 focus:border-navy focus:ring-2 focus:ring-navy/15 disabled:cursor-not-allowed disabled:bg-slate-100";

function Field({ id, label, required, error, help, children }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy">
        {label}
        {required && <span className="text-red-600" aria-hidden="true"> *</span>}
      </label>
      {children}
      {help && <p id={`${id}-help`} className="mt-1.5 text-xs leading-relaxed text-muted">{help}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-red-700" role="alert">{error}</p>}
    </div>
  );
}

function getMatchingJobs(jobs, categoryId, designation) {
  return jobs.filter((job) =>
    job.category_id === categoryId &&
    (job.designation || job.title) === designation &&
    job.is_active !== false,
  );
}

export default function ApplicationForm({
  jobs = [],
  selectedCategory,
  onConsumedSelection,
  catalogError = "",
  loading = false,
  onRetry,
}) {
  const formId = useId();
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const designationRef = useRef(null);
  const successRef = useRef(null);
  const submittingRef = useRef(false);
  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");
  const category = getRecruitmentCategory(values.hiringCategory);
  const matchingJobs = getMatchingJobs(jobs, values.hiringCategory, values.applyingFor);
  const departments = [...new Set(matchingJobs.map((job) => job.department).filter(Boolean))];

  useEffect(() => {
    const next = getRecruitmentCategory(typeof selectedCategory === "string" ? selectedCategory : selectedCategory?.id);
    if (!next) return;
    setValues((previous) => ({
      ...previous,
      hiringCategory: next.id,
      applyingFor: next.id === previous.hiringCategory ? previous.applyingFor : "",
      department: next.id === previous.hiringCategory ? previous.department : "",
    }));
    setErrors((previous) => ({ ...previous, hiringCategory: undefined, applyingFor: undefined, department: undefined }));
    setStatus((previous) => previous === "success" ? "idle" : previous);
    onConsumedSelection?.();
    requestAnimationFrame(() => designationRef.current?.focus({ preventScroll: true }));
  }, [selectedCategory, onConsumedSelection]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus({ preventScroll: true });
  }, [status]);

  function setField(name, value) {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }

  function changeCategory(value) {
    setValues((previous) => ({ ...previous, hiringCategory: value, applyingFor: "", department: "" }));
    setErrors((previous) => ({ ...previous, hiringCategory: undefined, applyingFor: undefined, department: undefined }));
  }

  function changeDesignation(value) {
    setValues((previous) => ({ ...previous, applyingFor: value, department: "" }));
    setErrors((previous) => ({ ...previous, applyingFor: undefined, department: undefined }));
  }

  function focusFirstError(nextErrors) {
    const field = Object.keys(nextErrors).find((name) => nextErrors[name]);
    requestAnimationFrame(() => formRef.current?.elements.namedItem(field)?.focus());
  }

  function control(name, { help = false, ...props } = {}) {
    return {
      id: `${formId}-${name}`,
      name,
      className: inputClass,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": [help && `${formId}-${name}-help`, errors[name] && `${formId}-${name}-error`].filter(Boolean).join(" ") || undefined,
      ...props,
    };
  }

  function field(name, label, input, { required = false, help } = {}) {
    return <Field id={`${formId}-${name}`} label={label} required={required} error={errors[name]} help={help}>{input}</Field>;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submittingRef.current) return;
    const nextErrors = validateApplication(values, file);
    if (values.department && !departments.includes(values.department)) {
      nextErrors.department = "Please select an available department or leave this optional field blank.";
    }
    setErrors(nextErrors);
    setServerError("");
    if (Object.keys(nextErrors).length) {
      focusFirstError(nextErrors);
      return;
    }

    submittingRef.current = true;
    setStatus("submitting");
    const formData = new FormData();
    const fields = {
      full_name: values.fullName.trim(),
      email: values.email.trim(),
      mobile: values.mobile.trim(),
      date_of_birth: values.dateOfBirth,
      gender: values.gender,
      hiring_category: values.hiringCategory,
      applying_for: values.applyingFor,
      department: values.department,
      qualification: values.qualification.trim(),
      specialization: values.specialization.trim(),
      total_experience: values.totalExperience,
      current_organization: values.currentOrganization.trim(),
      current_designation: values.currentDesignation.trim(),
      current_location: values.currentLocation.trim(),
      expected_salary: values.expectedSalary.trim(),
      notice_period: values.noticePeriod.trim(),
      confirmed: "true",
    };
    Object.entries(fields).forEach(([name, value]) => formData.append(name, value));
    // Preserve an existing opening relationship only when it is unambiguous.
    const linkedJobs = matchingJobs.filter((job) => (job.department || "") === values.department);
    if (linkedJobs.length === 1) formData.append("job_id", linkedJobs[0].id);
    formData.append("resume", file);

    try {
      await submitApplication(formData);
      setStatus("success");
      setValues(EMPTY);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setStatus("error");
      setServerError(error.message || "We couldn't submit your application right now. Please try again.");
      if (error.fields) {
        setErrors(error.fields);
        focusFirstError(error.fields);
      }
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <section id="apply" aria-labelledby={`${formId}-heading`} className="application-section scroll-mt-24 bg-white py-7 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Careers at Acharya Purushottam</p>
          <h2 id={`${formId}-heading`} className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">Apply to join our team</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-body">Complete your application and upload your current CV.</p>
        </div>
        <div className="mt-5 rounded-xl border border-slate-200 bg-wash p-4 shadow-[0_8px_30px_rgba(0,45,98,0.05)] sm:p-6">
          {status === "success" ? (
            <div ref={successRef} tabIndex={-1} className="px-2 py-8 text-center outline-none" role="status">
              <CheckCircle2 className="mx-auto text-accent" size={44} aria-hidden="true" />
              <h3 className="mt-4 text-xl font-bold text-navy">Application submitted successfully</h3>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-body">Thank you for your interest. Your application has been received for review.</p>
              <Button type="button" className="mt-6" onClick={() => setStatus("idle")}>Submit another application</Button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={status === "submitting"}>
              <p className="mb-4 text-xs leading-relaxed text-muted">Fields marked <span className="text-red-600">*</span> are required.</p>
              <fieldset disabled={status === "submitting"} className="min-w-0">
                <legend className="sr-only">Recruitment application</legend>
                <div className="grid min-w-0 gap-3.5 md:grid-cols-3">
                  {field("fullName", "Full Name", <input {...control("fullName")} autoComplete="name" placeholder="Your full name" maxLength={200} required />, { required: true })}
                  {field("email", "Email Address", <input {...control("email")} type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required />, { required: true })}
                  {field("mobile", "Mobile Number", <input {...control("mobile")} type="tel" autoComplete="tel" inputMode="tel" placeholder="10-digit mobile number" maxLength={20} required />, { required: true })}
                </div>

                <div className="mt-3.5 grid min-w-0 gap-3.5 md:grid-cols-2">
                    <div className="min-w-0">
                      {field("hiringCategory", "Hiring Category", <select {...control("hiringCategory", { onChange: (event) => changeCategory(event.target.value) })} required><option value="">Select a hiring category</option>{RECRUITMENT_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>, { required: true })}
                      {category && <p className="mt-1.5 break-words text-xs leading-relaxed text-muted lg:hidden" aria-hidden="true">{category.title}</p>}
                    </div>
                    <div className="min-w-0">
                      {field("applyingFor", "Applying For / Designation", <select ref={designationRef} {...control("applyingFor", { onChange: (event) => changeDesignation(event.target.value) })} disabled={!category} required><option value="">{category ? "Select a designation" : "Select a hiring category first"}</option>{category?.designations.map((designation) => <option key={designation} value={designation}>{designation}</option>)}</select>, { required: true })}
                      {values.applyingFor && <p className={`mt-1.5 break-words text-xs leading-relaxed text-muted ${values.applyingFor.length > 58 ? "" : "md:hidden"}`} aria-hidden="true">{values.applyingFor}</p>}
                    </div>
                </div>
                <div className={`mt-3.5 grid min-w-0 gap-3.5 ${departments.length ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                  {field("qualification", "Qualification", <input {...control("qualification")} placeholder="Your relevant qualification" maxLength={500} required />, { required: true })}
                  {field("totalExperience", "Total Experience in Years", <input {...control("totalExperience")} type="number" min="0" step="any" inputMode="decimal" placeholder="Enter 0 if you are a fresher" required />, { required: true })}
                  {departments.length > 0 && field("department", "Department (optional)", <select {...control("department")}><option value="">Select department (optional)</option>{departments.map((department) => <option key={department} value={department}>{department}</option>)}</select>)}
                </div>
                {loading && <p className="mt-3 text-xs text-muted" role="status">Loading available departments…</p>}
                {catalogError && <div className="mt-3 text-xs leading-relaxed text-body" role="status"><p>Department choices are temporarily unavailable. You can still select a hiring category and designation.</p>{onRetry && <button type="button" className="mt-1 font-semibold text-navy underline underline-offset-2" onClick={onRetry}>Retry loading departments</button>}</div>}

                <div className="mt-3.5">
                  {field("resume", "Upload Resume / CV", <><input ref={fileInputRef} id={`${formId}-resume`} name="resume" type="file" className="block min-h-11 w-full min-w-0 rounded-md border border-slate-300 bg-white p-1 text-sm text-body file:mr-3 file:min-h-9 file:rounded file:border-0 file:bg-navy file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white focus:outline-2 focus:outline-offset-2 focus:outline-navy" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" aria-invalid={Boolean(errors.resume)} aria-describedby={`${formId}-resume-help${errors.resume ? ` ${formId}-resume-error` : ""}`} onChange={(event) => { setFile(event.target.files?.[0] || null); setErrors((previous) => ({ ...previous, resume: undefined })); }} required />{file && <p className="mt-1.5 break-all text-xs text-muted">Selected: {file.name}</p>}</>, { required: true, help: `PDF, DOC or DOCX · maximum ${MAX_RESUME_MB} MB. Uploaded securely with your application.` })}
                </div>

                <div className="mt-4 flex flex-col gap-4 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                  <label htmlFor={`${formId}-confirmed`} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm leading-relaxed text-body">
                    <input id={`${formId}-confirmed`} name="confirmed" type="checkbox" className="h-4 w-4 shrink-0 accent-navy" checked={values.confirmed} onChange={(event) => setField("confirmed", event.target.checked)} aria-invalid={Boolean(errors.confirmed)} aria-describedby={errors.confirmed ? `${formId}-confirmed-error` : undefined} required />
                    <span>I confirm that the information provided by me is accurate. <span className="text-red-600" aria-hidden="true">*</span></span>
                  </label>
                  {errors.confirmed && <p id={`${formId}-confirmed-error`} className="mt-1 text-sm text-red-700" role="alert">{errors.confirmed}</p>}
                  </div>
                  <Button type="submit" className="min-h-11 w-full shrink-0 md:w-auto" disabled={status === "submitting"}>{status === "submitting" ? <><LoaderCircle className="animate-spin" size={16} aria-hidden="true" />Submitting application…</> : "Submit Application"}</Button>
                </div>
                {Object.keys(errors).some((key) => errors[key]) && <p className="mt-4 text-sm text-red-700" role="alert">Please check the highlighted fields before submitting.</p>}
                {status === "error" && <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800" role="alert"><p className="font-semibold">Your application could not be submitted.</p><p className="mt-1">{serverError}</p><p className="mt-2">Your details and resume are still here. Please try submitting again.</p></div>}
              </fieldset>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
