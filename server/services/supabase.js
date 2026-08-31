import { createClient } from "@supabase/supabase-js";

function env(name) {
  return String(process.env[name] || "").trim();
}

function normalizeSupabaseUrl(raw) {
  const value = (raw || "").trim();
  if (!value || value.includes("YOUR_PROJECT_ID") || value.includes("YOUR_PROJECT")) {
    return "";
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    if (!host.endsWith(".supabase.co") && !host.endsWith(".supabase.in")) {
      return "";
    }
    return `${parsed.protocol}//${host}`;
  } catch {
    return "";
  }
}

let cached = null;

function getConfig() {
  const rawUrl = env("SUPABASE_URL");
  const secretKey = env("SUPABASE_SECRET_KEY");
  const publishableKey = env("SUPABASE_PUBLISHABLE_KEY");
  const url = normalizeSupabaseUrl(rawUrl);
  const configured = Boolean(url && secretKey);
  return { rawUrl, secretKey, publishableKey, url, configured };
}

export function getSupabaseStatus() {
  const { rawUrl, secretKey, url, configured } = getConfig();
  return {
    configured,
    hasUrl: Boolean(rawUrl),
    hasSecret: Boolean(secretKey),
    urlOk: Boolean(url),
  };
}

export function isSupabaseConfigured() {
  return getConfig().configured;
}

function createSupabase() {
  const { url, secretKey, configured } = getConfig();
  if (!configured) return null;

  function secretFetch(input, init) {
    const headers = new Headers(init?.headers);
    headers.set("apikey", secretKey);
    const authorization = headers.get("Authorization") || "";
    if (
      authorization.startsWith("Bearer sb_secret_") ||
      authorization.startsWith("Bearer sb_publishable_")
    ) {
      headers.delete("Authorization");
    }
    return fetch(input, { ...init, headers });
  }

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: secretFetch },
  });
}

export function requireSupabase() {
  const { configured } = getConfig();
  if (!configured) {
    const error = new Error("SUPABASE_NOT_CONFIGURED");
    error.status = 503;
    throw error;
  }
  if (!cached) cached = createSupabase();
  if (!cached) {
    const error = new Error("SUPABASE_NOT_CONFIGURED");
    error.status = 503;
    throw error;
  }
  return cached;
}

if (!process.env.VERCEL) {
  const { configured, rawUrl } = getConfig();
  console.log("[Supabase Config]");
  console.log("URL present:", Boolean(rawUrl));
  console.log("Client will initialize:", configured);
  if (!configured) {
    console.warn(
      "Supabase is not fully configured. SUPABASE_URL should look like https://<project-ref>.supabase.co",
    );
  }
}
