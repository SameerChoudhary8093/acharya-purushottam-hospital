import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

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

const rawUrl = process.env.SUPABASE_URL || "";
const secretKey = (process.env.SUPABASE_SECRET_KEY || "").trim();
const publishableKey = (process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();
const url = normalizeSupabaseUrl(rawUrl);

export const isSupabaseConfigured = Boolean(url && secretKey);

console.log("[Supabase Config]");
console.log("URL present:", Boolean(rawUrl.trim()));
console.log("Publishable key present:", Boolean(publishableKey));
console.log("Secret key present:", Boolean(secretKey));
console.log("URL normalized:", Boolean(url));
console.log("Client will initialize:", isSupabaseConfigured);

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase is not fully configured. SUPABASE_URL should look like https://<project-ref>.supabase.co (the /rest/v1 path is optional and will be stripped).",
  );
}

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

export const supabase = isSupabaseConfigured
  ? createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: secretFetch },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    const error = new Error("SUPABASE_NOT_CONFIGURED");
    error.status = 503;
    throw error;
  }
  return supabase;
}
