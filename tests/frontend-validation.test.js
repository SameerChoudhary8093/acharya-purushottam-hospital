import test from "node:test";
import assert from "node:assert/strict";
import { MAX_RESUME_BYTES, isValidResumeFile, validateApplication } from "../src/utils/validation.js";
import { RECRUITMENT_CATEGORIES } from "../shared/recruitment.js";

const resume = { name: "resume.pdf", type: "application/pdf", size: 100 };
const validValues = {
  fullName: "Test applicant",
  email: "applicant@example.invalid",
  mobile: "+91 98765 43210",
  hiringCategory: "medical",
  applyingFor: "Professor",
  qualification: "Qualification provided by applicant",
  totalExperience: "0",
  confirmed: true,
};

test("all four approved category/designation combinations are accepted", () => {
  assert.equal(RECRUITMENT_CATEGORIES.length, 4);
  for (const category of RECRUITMENT_CATEGORIES) {
    for (const designation of category.designations) {
      assert.deepEqual(validateApplication({ ...validValues, hiringCategory: category.id, applyingFor: designation }, resume), {});
    }
  }
});

test("unrelated categories and cross-category designations are rejected", () => {
  assert.ok(validateApplication({ ...validValues, hiringCategory: "general" }, resume).hiringCategory);
  assert.ok(validateApplication({ ...validValues, hiringCategory: "nursing", applyingFor: "Professor" }, resume).applyingFor);
  assert.ok(validateApplication({ ...validValues, applyingFor: "Invented role" }, resume).applyingFor);
});

test("optional fields including department may be omitted", () => {
  assert.deepEqual(validateApplication(validValues, resume), {});
});

test("resume extension and reported MIME must both be allowed", () => {
  assert.equal(MAX_RESUME_BYTES, 4 * 1024 * 1024);
  assert.equal(isValidResumeFile({ ...resume, name: "resume.exe" }).ok, false);
  assert.equal(isValidResumeFile({ ...resume, type: "text/plain" }).ok, false);
  assert.equal(isValidResumeFile({ ...resume, type: "" }).ok, true);
  assert.equal(isValidResumeFile({ ...resume, size: 0 }).ok, false);
  assert.equal(isValidResumeFile({ ...resume, size: MAX_RESUME_BYTES }).ok, true);
  assert.equal(isValidResumeFile({ ...resume, size: MAX_RESUME_BYTES + 1 }).ok, false);
});

test("resume MIME must match its extension when the browser provides a type", () => {
  assert.equal(isValidResumeFile({ ...resume, name: "resume.docx" }).ok, false);
  assert.equal(isValidResumeFile({ ...resume, type: "application/msword" }).ok, false);
  assert.equal(isValidResumeFile({ ...resume, name: "resume.doc", type: "application/msword" }).ok, true);
  assert.equal(isValidResumeFile({ ...resume, name: "resume.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }).ok, true);
  assert.equal(isValidResumeFile({ ...resume, name: "resume.docx", type: "" }).ok, true);
});

test("invalid email, mobile, experience, consent and optional birth date are rejected", () => {
  const errors = validateApplication({ ...validValues, email: "invalid", mobile: "123", totalExperience: "Infinity", confirmed: false, dateOfBirth: "2025-02-30" }, resume);
  for (const field of ["email", "mobile", "totalExperience", "confirmed", "dateOfBirth"]) assert.ok(errors[field]);
  assert.ok(validateApplication({ ...validValues, totalExperience: "-1" }, resume).totalExperience);
  assert.ok(validateApplication({ ...validValues, dateOfBirth: "2999-01-01" }, resume).dateOfBirth);
});
