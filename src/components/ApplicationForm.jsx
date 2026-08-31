import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, Upload } from "lucide-react";
import siteContent from "../config/siteContent";
import Button from "./Button";
import FadeIn from "./FadeIn";
import { submitApplication } from "../services/api";
import { validateApplication } from "../utils/validation";

const EMPTY = {
  fullName: "",
  email: "",
  mobile: "",
  dateOfBirth: "",
  gender: "",
  applyingFor: "",
  jobId: "",
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

function Field({ id, label, required, error, children }) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy">
        {label}
        {required && (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-navy outline-none transition-colors placeholder:text-slate-400 focus:border-navy";

export default function ApplicationForm({ jobs, selectedJob, onConsumedSelection, prefill }) {
  const formId = useId();
  const fileInputRef = useRef(null);
  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!prefill) return;
    setValues((prev) => ({
      ...prev,
      fullName: prefill.fullName || prev.fullName,
      email: prefill.email || prev.email,
      mobile: prefill.mobile || prev.mobile,
      applyingFor: prefill.applyingFor || prev.applyingFor,
      jobId: prefill.jobId || prev.jobId,
      department: prefill.department || prev.department,
    }));
    setErrors((prev) => ({
      ...prev,
      fullName: undefined,
      email: undefined,
      mobile: undefined,
      applyingFor: undefined,
      department: undefined,
    }));
  }, [prefill]);

  useEffect(() => {
    if (!selectedJob) return;
    setValues((prev) => ({
      ...prev,
      applyingFor: selectedJob.title,
      jobId: selectedJob.id,
      department: selectedJob.department || prev.department,
    }));
    setErrors((prev) => ({ ...prev, applyingFor: undefined, department: undefined }));
    onConsumedSelection?.();
  }, [selectedJob, onConsumedSelection]);

  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleApplyingFor(value) {
    const job = jobs.find((j) => j.id === value);
    if (job) {
      setValues((prev) => ({
        ...prev,
        applyingFor: job.title,
        jobId: job.id,
        department: job.department || prev.department,
      }));
    } else {
      setValues((prev) => ({
        ...prev,
        applyingFor: value === "general" ? "General Application" : value,
        jobId: "",
      }));
    }
    setErrors((prev) => ({ ...prev, applyingFor: undefined }));
  }

  function handleFile(next) {
    setFile(next);
    setErrors((prev) => ({ ...prev, resume: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === "submitting") return;

    const nextErrors = validateApplication(values, file);
    setErrors(nextErrors);
    setServerError("");
    if (Object.keys(nextErrors).length > 0) return;

    const formData = new FormData();
    formData.append("full_name", values.fullName.trim());
    formData.append("email", values.email.trim());
    formData.append("mobile", values.mobile.trim());
    formData.append("date_of_birth", values.dateOfBirth);
    formData.append("gender", values.gender);
    formData.append("applying_for", values.applyingFor);
    if (values.jobId) formData.append("job_id", values.jobId);
    formData.append("department", values.department);
    formData.append("qualification", values.qualification.trim());
    formData.append("specialization", values.specialization.trim());
    formData.append("total_experience", values.totalExperience);
    formData.append("current_organization", values.currentOrganization.trim());
    formData.append("current_designation", values.currentDesignation.trim());
    formData.append("current_location", values.currentLocation.trim());
    formData.append("expected_salary", values.expectedSalary.trim());
    formData.append("notice_period", values.noticePeriod.trim());
    formData.append("confirmed", "true");
    formData.append("resume", file);

    setStatus("submitting");
    try {
      await submitApplication(formData);
      setStatus("success");
      setValues(EMPTY);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setStatus("error");
      setServerError(
        err.message ||
          "We couldn't submit your application right now. Please try again.",
      );
      if (err.fields) setErrors((prev) => ({ ...prev, ...err.fields }));
    }
  }

  const applyingValue = values.jobId || (values.applyingFor === "General Application" ? "general" : "");

  return (
    <section id="apply" className="scroll-mt-28 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <FadeIn>
          <h2 className="text-center text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-3xl">
            Join Our Team
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[15px] text-body">
            Take the next step in your career with Acharya Purushottam Hospital &
            Medical College.
          </p>
        </FadeIn>

        <FadeIn delay={60}>
          <div className="mt-10 rounded-xl border border-slate-100 bg-wash p-5 shadow-[0_8px_30px_rgba(0,45,98,0.06)] sm:p-8">
            {status === "success" ? (
              <div className="px-2 py-8 text-center" role="status">
                <CheckCircle2 className="mx-auto text-accent" size={44} aria-hidden="true" />
                <h3 className="mt-4 text-xl font-bold text-navy">
                  Application Submitted Successfully
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-body">
                  Thank you for your interest in joining Acharya Purushottam Hospital
                  & Medical College. Our team will review your application and get in
                  touch if your profile matches an opportunity.
                </p>
                <Button
                  type="button"
                  className="mt-8"
                  onClick={() => setStatus("idle")}
                >
                  Submit another application
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <fieldset className="space-y-4">
                  <legend className="mb-4 text-sm font-bold uppercase tracking-wide text-navy">
                    Personal Information
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      id={`${formId}-name`}
                      label="Full Name"
                      required
                      error={errors.fullName}
                    >
                      <input
                        id={`${formId}-name`}
                        className={inputClass}
                        autoComplete="name"
                        value={values.fullName}
                        onChange={(e) => setField("fullName", e.target.value)}
                        aria-invalid={Boolean(errors.fullName)}
                        aria-describedby={errors.fullName ? `${formId}-name-error` : undefined}
                        required
                      />
                    </Field>
                    <Field
                      id={`${formId}-email`}
                      label="Email Address"
                      required
                      error={errors.email}
                    >
                      <input
                        id={`${formId}-email`}
                        type="email"
                        className={inputClass}
                        autoComplete="email"
                        value={values.email}
                        onChange={(e) => setField("email", e.target.value)}
                        aria-invalid={Boolean(errors.email)}
                      />
                    </Field>
                    <Field
                      id={`${formId}-mobile`}
                      label="Mobile Number"
                      required
                      error={errors.mobile}
                    >
                      <input
                        id={`${formId}-mobile`}
                        type="tel"
                        className={inputClass}
                        autoComplete="tel"
                        inputMode="numeric"
                        placeholder="10-digit mobile number"
                        value={values.mobile}
                        onChange={(e) => setField("mobile", e.target.value)}
                        aria-invalid={Boolean(errors.mobile)}
                      />
                    </Field>
                    <Field id={`${formId}-dob`} label="Date of Birth">
                      <input
                        id={`${formId}-dob`}
                        type="date"
                        className={inputClass}
                        value={values.dateOfBirth}
                        onChange={(e) => setField("dateOfBirth", e.target.value)}
                      />
                    </Field>
                    <Field id={`${formId}-gender`} label="Gender">
                      <select
                        id={`${formId}-gender`}
                        className={inputClass}
                        value={values.gender}
                        onChange={(e) => setField("gender", e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </Field>
                  </div>
                </fieldset>

                <fieldset className="mt-8 space-y-4">
                  <legend className="mb-4 text-sm font-bold uppercase tracking-wide text-navy">
                    Professional Information
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      id={`${formId}-role`}
                      label="Applying For"
                      required
                      error={errors.applyingFor}
                    >
                      <select
                        id={`${formId}-role`}
                        className={inputClass}
                        value={applyingValue}
                        onChange={(e) => handleApplyingFor(e.target.value)}
                        aria-invalid={Boolean(errors.applyingFor)}
                      >
                        <option value="">Select a role</option>
                        <option value="general">General Application</option>
                        {jobs.map((job) => (
                          <option key={job.id} value={job.id}>
                            {job.title}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field
                      id={`${formId}-dept`}
                      label="Department"
                      required
                      error={errors.department}
                    >
                      <select
                        id={`${formId}-dept`}
                        className={inputClass}
                        value={values.department}
                        onChange={(e) => setField("department", e.target.value)}
                      >
                        <option value="">Select department</option>
                        {siteContent.departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field
                      id={`${formId}-qual`}
                      label="Qualification"
                      required
                      error={errors.qualification}
                    >
                      <input
                        id={`${formId}-qual`}
                        className={inputClass}
                        value={values.qualification}
                        onChange={(e) => setField("qualification", e.target.value)}
                      />
                    </Field>
                    <Field id={`${formId}-spec`} label="Specialization">
                      <input
                        id={`${formId}-spec`}
                        className={inputClass}
                        value={values.specialization}
                        onChange={(e) => setField("specialization", e.target.value)}
                      />
                    </Field>
                    <Field
                      id={`${formId}-exp`}
                      label="Total Experience (years)"
                      required
                      error={errors.totalExperience}
                    >
                      <input
                        id={`${formId}-exp`}
                        type="number"
                        min="0"
                        step="0.5"
                        className={inputClass}
                        value={values.totalExperience}
                        onChange={(e) => setField("totalExperience", e.target.value)}
                      />
                    </Field>
                    <Field id={`${formId}-org`} label="Current Organization">
                      <input
                        id={`${formId}-org`}
                        className={inputClass}
                        value={values.currentOrganization}
                        onChange={(e) => setField("currentOrganization", e.target.value)}
                      />
                    </Field>
                    <Field id={`${formId}-desig`} label="Current Designation">
                      <input
                        id={`${formId}-desig`}
                        className={inputClass}
                        value={values.currentDesignation}
                        onChange={(e) => setField("currentDesignation", e.target.value)}
                      />
                    </Field>
                  </div>
                </fieldset>

                <fieldset className="mt-8 space-y-4">
                  <legend className="mb-4 text-sm font-bold uppercase tracking-wide text-navy">
                    Additional Information
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id={`${formId}-loc`} label="Current Location">
                      <input
                        id={`${formId}-loc`}
                        className={inputClass}
                        value={values.currentLocation}
                        onChange={(e) => setField("currentLocation", e.target.value)}
                      />
                    </Field>
                    <Field id={`${formId}-sal`} label="Expected Salary">
                      <input
                        id={`${formId}-sal`}
                        className={inputClass}
                        value={values.expectedSalary}
                        onChange={(e) => setField("expectedSalary", e.target.value)}
                      />
                    </Field>
                    <Field id={`${formId}-notice`} label="Notice Period">
                      <input
                        id={`${formId}-notice`}
                        className={inputClass}
                        placeholder="e.g. 30 days"
                        value={values.noticePeriod}
                        onChange={(e) => setField("noticePeriod", e.target.value)}
                      />
                    </Field>
                  </div>
                </fieldset>

                <fieldset className="mt-8">
                  <legend className="mb-4 text-sm font-bold uppercase tracking-wide text-navy">
                    Resume
                  </legend>
                  <Field
                    id={`${formId}-resume`}
                    label="Upload Resume / CV"
                    required
                    error={errors.resume}
                  >
                    <label
                      htmlFor={`${formId}-resume`}
                      className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-4 py-8 text-center hover:border-navy"
                    >
                      <Upload className="text-navy" size={22} aria-hidden="true" />
                      <span className="mt-2 text-sm font-medium text-navy">
                        {file ? file.name : "Choose PDF, DOC, or DOCX"}
                      </span>
                      <span className="mt-1 text-xs text-muted">Maximum 5 MB</span>
                    </label>
                    <input
                      ref={fileInputRef}
                      id={`${formId}-resume`}
                      type="file"
                      className="sr-only"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => handleFile(e.target.files?.[0] || null)}
                    />
                  </Field>
                </fieldset>

                <div className="mt-6">
                  <label className="flex items-start gap-3 text-sm text-body">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-navy"
                      checked={values.confirmed}
                      onChange={(e) => setField("confirmed", e.target.checked)}
                    />
                    <span>
                      I confirm that the information provided by me is accurate.
                      <span className="text-red-600" aria-hidden="true">
                        {" "}
                        *
                      </span>
                    </span>
                  </label>
                  {errors.confirmed && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.confirmed}
                    </p>
                  )}
                </div>

                {status === "error" && (
                  <div
                    className="mt-6 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800"
                    role="alert"
                  >
                    <p className="font-semibold">Something went wrong</p>
                    <p className="mt-1">
                      {serverError ||
                        "We couldn't submit your application right now. Please try again."}
                    </p>
                    <button
                      type="button"
                      className="mt-3 text-sm font-semibold text-navy underline underline-offset-2"
                      onClick={() => setStatus("idle")}
                    >
                      Try again
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="mt-8 w-full"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? (
                    <>
                      <LoaderCircle className="animate-spin" size={16} aria-hidden="true" />
                      Submitting Application...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </form>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
