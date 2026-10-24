// Explicitly read-only production connectivity/privacy audit. Never logs keys,
// URLs, row identifiers, applicant information, or resume object names.
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const originalFetch = globalThis.fetch;
globalThis.fetch = (input, options = {}) => {
  const url = new URL(typeof input === "string" ? input : input.url);
  const method = String(options.method || "GET").toUpperCase();
  const readOnlyList = method === "POST" && url.pathname === "/storage/v1/object/list/resumes";
  if (!["GET", "HEAD"].includes(method) && !readOnlyList) {
    throw new Error("READ_ONLY_AUDIT_REJECTED_MUTATION");
  }
  const timeout = AbortSignal.timeout(10_000);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
  return originalFetch(input, { ...options, signal });
};

function classifyError(error) {
  const status = Number(error?.status || error?.statusCode) || null;
  if (!status) return { status, outcome: "network_or_configuration_unavailable" };
  if (status === 404) return { status, outcome: "missing" };
  if (status === 401 || status === 403) return { status, outcome: "denied" };
  return { status, outcome: "request_failed" };
}

async function run() {
  const report = { mode: "read_only", mutationsPerformed: false };
  const url = String(process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
  const publicKey = String(process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();
  if (!url || !publicKey || !process.env.SUPABASE_SECRET_KEY) {
    return { ...report, outcome: "configuration_incomplete" };
  }
  const { requireSupabase } = await import("../server/services/supabase.js");
  const client = requireSupabase();
  const checks = await Promise.allSettled([
    (async () => {
      const { data, error } = await client.storage.getBucket("resumes");
      return error ? classifyError(error) : { outcome: "found", private: data.public === false, fileSizeLimitBytes: data.file_size_limit ?? null };
    })(),
    (async () => {
      const { data, error, status } = await client.from("jobs").select("id").limit(1).abortSignal(AbortSignal.timeout(10_000));
      return error ? { ...classifyError({ ...error, status }), table: "jobs" } : { outcome: "table_available", returnedRowCount: data.length };
    })(),
    (async () => {
      // limit=0 checks table/column availability without reading applicant rows.
      const { error, status } = await client.from("applications").select("hiring_category,confirmed").limit(0).abortSignal(AbortSignal.timeout(10_000));
      return error ? { ...classifyError({ ...error, status }), outcome: status === 400 ? "required_columns_unavailable" : classifyError({ ...error, status }).outcome } : { outcome: "required_columns_available", applicantRowsRead: 0 };
    })(),
    (async () => {
      const headers = { apikey: publicKey };
      if (!publicKey.startsWith("sb_publishable_")) headers.Authorization = `Bearer ${publicKey}`;
      const response = await fetch(`${url}/rest/v1/applications?select=id&limit=1`, { headers });
      if (!response.ok) return { status: response.status, outcome: [401, 403].includes(response.status) ? "denied" : response.status === 404 ? "missing_or_unavailable" : "request_failed" };
      const rows = await response.json();
      return { status: response.status, outcome: Array.isArray(rows) && rows.length ? "PUBLIC_APPLICATION_ROWS_EXPOSED" : "empty_response_not_proof_of_denial", returnedRowCount: Array.isArray(rows) ? rows.length : null };
    })(),
    (async () => {
      const headers = { apikey: publicKey, "Content-Type": "application/json" };
      if (!publicKey.startsWith("sb_publishable_")) headers.Authorization = `Bearer ${publicKey}`;
      const response = await fetch(`${url}/storage/v1/object/list/resumes`, { method: "POST", headers, body: JSON.stringify({ prefix: "applications/", limit: 1, offset: 0 }) });
      if (!response.ok) return { status: response.status, outcome: [401, 403].includes(response.status) ? "denied" : "request_failed" };
      const rows = await response.json();
      return { status: response.status, outcome: Array.isArray(rows) && rows.length ? "PUBLIC_RESUME_LISTING_EXPOSED" : "empty_response_not_proof_of_denial", returnedRowCount: Array.isArray(rows) ? rows.length : null };
    })(),
  ]);
  const names = ["resumeBucket", "jobsTable", "applicationSchemaMetadata", "anonymousApplications", "anonymousResumeListing"];
  checks.forEach((result, index) => { report[names[index]] = result.status === "fulfilled" ? result.value : classifyError(result.reason); });
  return report;
}

try {
  console.log(JSON.stringify(await run(), null, 2));
} catch (error) {
  console.log(JSON.stringify({ mode: "read_only", mutationsPerformed: false, ...classifyError(error) }, null, 2));
  process.exitCode = 1;
}
