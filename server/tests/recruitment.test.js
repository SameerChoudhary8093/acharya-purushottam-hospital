import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";
import { once } from "node:events";
import { RECRUITMENT_CATEGORIES } from "../../shared/recruitment.js";
import { validateResumeContent, MAX_RESUME_BYTES } from "../middleware/upload.js";
import { validateApplicationPayload } from "../middleware/validation.js";

// These tests never load .env and cannot contact the configured production DB.
// All Supabase requests are intercepted; only our ephemeral localhost API uses
// a real socket. This covers the actual Express/multipart/Supabase client flow.
process.env.VERCEL = "1";
process.env.SUPABASE_URL = "https://recruitment-test.supabase.co";
process.env.SUPABASE_SECRET_KEY = "sb_secret_test_only_not_a_real_key";
process.env.CLIENT_ORIGIN = "https://careers.example.test";
const realFetch = globalThis.fetch;
const jobId = "11111111-1111-4111-8111-111111111111";
const hiddenJobId = "22222222-2222-4222-8222-222222222222";
const jobs = [
  { id: jobId, title: "Staff Nurse", category: "Nursing", department: "Existing verified department", is_active: true },
  { id: hiddenJobId, title: "Medical Officer", category: "Medical", department: "Clinical", is_active: true },
  { id: "33333333-3333-4333-8333-333333333333", title: "Staff Nurse", category: "Nursing", department: "Nursing", is_active: false },
  { id: "44444444-4444-4444-8444-444444444444", title: "Unapproved role", category: "Unapproved category", department: "Other", is_active: true },
];
const state = { requests: [], uploads: [], inserts: [], removals: [], insertFailure: false, uploadFailure: false, jobsFailure: false };

function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });
}

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  if (url.hostname === "127.0.0.1") return realFetch(input, init);
  assert.equal(url.hostname, "recruitment-test.supabase.co", "Unexpected outbound request blocked");
  const method = init.method || "GET";
  state.requests.push({ path: url.pathname, method });
  if (url.pathname === "/rest/v1/jobs") {
    if (state.jobsFailure) return json({ message: "private database detail" }, 500);
    let matching = [...jobs];
    if (url.searchParams.get("is_active") === "eq.true") matching = matching.filter((job) => job.is_active);
    if (url.searchParams.has("id")) matching = matching.filter((job) => `eq.${job.id}` === url.searchParams.get("id"));
    return json(matching);
  }
  if (url.pathname.startsWith("/storage/v1/object/resumes/") && method === "POST") {
    if (state.uploadFailure) return json({ message: "private storage detail" }, 500);
    state.uploads.push({ path: url.pathname.slice("/storage/v1/object/resumes/".length), body: init.body });
    return json({ Key: url.pathname.slice("/storage/v1/object/".length) });
  }
  if (url.pathname === "/storage/v1/object/resumes" && method === "DELETE") {
    state.removals.push(...JSON.parse(init.body).prefixes);
    return json([]);
  }
  if (url.pathname === "/rest/v1/applications" && method === "POST") {
    const application = JSON.parse(init.body);
    state.inserts.push(application);
    if (state.insertFailure) return json({ message: "private database detail" }, 500);
    return json({ id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", created_at: "2026-10-23T00:00:00Z" }, 201);
  }
  throw new Error(`Unexpected fake service route ${method} ${url.pathname}`);
};

const { default: app } = await import("../app.js");
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const base = `http://127.0.0.1:${server.address().port}`;
let requestNumber = 0;

after(async () => {
  globalThis.fetch = realFetch;
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  state.requests.length = 0;
  state.uploads.length = 0;
  state.inserts.length = 0;
  state.removals.length = 0;
  state.insertFailure = false;
  state.uploadFailure = false;
  state.jobsFailure = false;
});

function application(overrides = {}, file = new Blob(["%PDF-1.4\nTest resume\n%%EOF"], { type: "application/pdf" }), name = "test-resume.pdf") {
  const form = new FormData();
  const values = {
    full_name: "Local Test Candidate", email: "candidate@example.test", mobile: "+91 9876543210",
    hiring_category: "nursing", applying_for: "Staff Nurses", qualification: "Test qualification",
    total_experience: "2.5", confirmed: "true", ...overrides,
  };
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  if (file) form.set("resume", file, name);
  return form;
}

function submit(form) {
  requestNumber += 1;
  return fetch(`${base}/api/applications`, { method: "POST", body: form, headers: { "x-forwarded-for": `192.0.2.${requestNumber}` } });
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function docxFixture() {
  const localFiles = [];
  const directory = [];
  let offset = 0;
  for (const [filename, contents] of [
    ["[Content_Types].xml", '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
    ["word/document.xml", '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Test resume</w:t></w:r></w:p></w:body></w:document>'],
  ]) {
    const name = Buffer.from(filename);
    const data = Buffer.from(contents);
    const checksum = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    localFiles.push(local, name, data);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    directory.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const centralDirectory = Buffer.concat(directory);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(2, 8);
  end.writeUInt16LE(2, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localFiles, centralDirectory, end]);
}

test("health initializes, approved real jobs are normalized, and invalid IDs are rejected before DB access", async () => {
  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).supabase, true);
  const response = await fetch(`${base}/api/jobs`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.categories.length, 4);
  assert.equal(data.jobs.length, 1);
  assert.equal(data.jobs[0].category_id, "nursing");
  assert.equal(data.jobs[0].designation, "Staff Nurses");
  assert.equal(data.jobs[0].title, "Staff Nurse");
  assert.equal((await fetch(`${base}/api/jobs/${jobId}`)).status, 200);
  assert.equal((await fetch(`${base}/api/jobs/${hiddenJobId}`)).status, 404);
  const requestsBefore = state.requests.length;
  assert.equal((await fetch(`${base}/api/jobs/not-a-uuid`)).status, 400);
  assert.equal(state.requests.length, requestsBefore);
});

test("private application and bare API reads have no public endpoint; CORS accepts only configured deployments", async () => {
  for (const path of ["/api", "/api/applications", "/api/applications/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "/api/unknown"]) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 404);
    assert.match(response.headers.get("content-type"), /application\/json/);
  }
  const allowed = await fetch(`${base}/api/health`, { headers: { origin: "https://careers.example.test" } });
  assert.equal(allowed.headers.get("access-control-allow-origin"), "https://careers.example.test");
  const unrelated = await fetch(`${base}/api/health`, { headers: { origin: "https://unrelated.vercel.app" } });
  assert.equal(unrelated.headers.get("access-control-allow-origin"), null);
});

test("required fields, invalid dates, invalid mobile, category-role mismatch and missing consent fail before upload", async () => {
  const response = await submit(application({ email: "invalid", mobile: "1234567890", hiring_category: "medical", applying_for: "Staff Nurses", date_of_birth: "2025-02-31", confirmed: "false" }));
  assert.equal(response.status, 400);
  const data = await response.json();
  for (const field of ["email", "mobile", "applyingFor", "dateOfBirth", "confirmed"]) assert.ok(data.fields[field]);
  assert.equal(state.uploads.length, 0);
  const noFile = await submit(application({}, null));
  assert.equal(noFile.status, 400);
  assert.ok((await noFile.json()).fields.resume);
});

test("every category saves its canonical category/designation, consent, private resume path and optional details", async () => {
  for (const category of RECRUITMENT_CATEGORIES) {
    const response = await submit(application({
      hiring_category: category.id, applying_for: category.designations[0], date_of_birth: "1990-01-01",
      gender: "prefer_not_to_say", specialization: "Test specialization", current_organization: "Test organization",
      current_designation: "Test designation", current_location: "Test location", expected_salary: "", notice_period: "",
    }));
    assert.equal(response.status, 201);
    assert.equal((await response.json()).success, true);
    const inserted = state.inserts.at(-1);
    assert.equal(inserted.hiring_category, category.title);
    assert.equal(inserted.applying_for, category.designations[0]);
    assert.equal(inserted.confirmed, true);
    assert.equal(inserted.department, null);
    assert.equal(inserted.job_id, null);
    assert.equal(inserted.total_experience, 2.5);
    assert.equal(inserted.current_location, "Test location");
    assert.equal(inserted.expected_salary, null);
    assert.equal(inserted.notice_period, null);
    assert.equal(inserted.resume_path, state.uploads.at(-1).path);
    assert.match(inserted.resume_path, /^applications\/[0-9a-f-]{36}-test-resume\.pdf$/);
    assert.equal(Object.hasOwn(inserted, "resume_url"), false);
  }
});

test("job relationships must match approved category, designation and existing department", async () => {
  const wrong = await submit(application({ job_id: jobId, department: "Wrong department" }));
  assert.equal(wrong.status, 400);
  assert.equal(state.uploads.length, 0);
  const hidden = await submit(application({ job_id: hiddenJobId }));
  assert.equal(hidden.status, 400);
  const valid = await submit(application({ job_id: jobId, department: jobs[0].department }));
  assert.equal(valid.status, 201);
  assert.equal(state.inserts[0].job_id, jobId);
  assert.equal(state.inserts[0].department, jobs[0].department);
});

test("renamed files, MIME mismatches, empty files, oversized resumes and unexpected files are rejected", async () => {
  for (const [blob, name] of [
    [new Blob(["MZ executable"], { type: "application/pdf" }), "fake.pdf"],
    [new Blob(["%PDF-1.4"], { type: "text/plain" }), "fake.pdf"],
    [new Blob(["%PDF-1.4"], { type: "application/pdf" }), "fake.exe"],
    [new Blob([], { type: "application/pdf" }), "empty.pdf"],
    [new Blob([new Uint8Array(MAX_RESUME_BYTES + 1)], { type: "application/pdf" }), "large.pdf"],
  ]) {
    const response = await submit(application({}, blob, name));
    assert.equal(response.status, 400);
    assert.ok((await response.json()).message);
  }
  assert.equal(state.uploads.length, 0);
});

test("Word signatures are checked, real DOCX is accepted, and fake DOCX archives are rejected", async () => {
  const doc = Buffer.concat([Buffer.from("d0cf11e0a1b11ae1", "hex"), Buffer.from("WordDocument", "utf16le")]);
  assert.doesNotThrow(() => validateResumeContent({ originalname: "resume.doc", mimetype: "application/msword", buffer: doc }));
  assert.throws(() => validateResumeContent({ originalname: "resume.doc", mimetype: "application/msword", buffer: Buffer.from("renamed document") }));
  assert.throws(() => validateResumeContent({ originalname: "resume.docx", mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", buffer: Buffer.from("PK\x03\x04arbitrary zip") }));
  const docx = docxFixture();
  const docxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  assert.doesNotThrow(() => validateResumeContent({ originalname: "resume.docx", mimetype: docxMime, buffer: docx }));
  for (const [buffer, mime, name] of [[doc, "application/msword", "resume.doc"], [docx, docxMime, "resume.docx"]]) {
    const response = await submit(application({}, new Blob([buffer], { type: mime }), name));
    assert.equal(response.status, 201);
    assert.ok(state.inserts.at(-1).resume_path.endsWith(name));
  }
  const boundary = Buffer.alloc(MAX_RESUME_BYTES);
  boundary.write("%PDF-1.4");
  assert.doesNotThrow(() => validateResumeContent({ originalname: "boundary.pdf", mimetype: "application/pdf", buffer: boundary }));
});

test("optional field lengths match the form, decimal experience is preserved and unknown gender/designation is rejected", () => {
  const body = {
    full_name: "Test", email: "candidate@example.test", mobile: "9876543210", hiring_category: "nursing",
    applying_for: "Staff Nurses", qualification: "Q".repeat(500), total_experience: "2.12345", confirmed: "true",
    current_organization: "O".repeat(300), current_designation: "D".repeat(300), current_location: "L".repeat(300),
    expected_salary: "S".repeat(200), notice_period: "N".repeat(200), gender: "prefer_not_to_say",
  };
  const file = { originalname: "resume.pdf", mimetype: "application/pdf", buffer: Buffer.from("%PDF-1.4") };
  assert.equal(validateApplicationPayload(body, file).total_experience, 2.12345);
  assert.throws(() => validateApplicationPayload({ ...body, gender: "invented" }, file), (error) => Boolean(error.fields.gender));
  assert.throws(() => validateApplicationPayload({ ...body, applying_for: "__proto__" }, file), (error) => Boolean(error.fields.applyingFor));
});

test("failed DB inserts remove the uploaded resume once and do not expose internal errors", async () => {
  state.insertFailure = true;
  const response = await submit(application());
  assert.equal(response.status, 500);
  assert.equal(state.uploads.length, 1);
  assert.deepEqual(state.removals, [state.uploads[0].path]);
  assert.doesNotMatch(JSON.stringify(await response.json()), /private database detail/);
});

test("failed storage uploads cannot insert applications and return a recoverable generic error", async () => {
  state.uploadFailure = true;
  const response = await submit(application());
  assert.equal(response.status, 500);
  assert.equal(state.inserts.length, 0);
  assert.equal(state.removals.length, 0);
  assert.doesNotMatch(JSON.stringify(await response.json()), /private storage detail/);
});
