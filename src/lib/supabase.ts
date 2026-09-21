import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { UserProfile } from "../types";

export const supabaseUrl: string =
  import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
export const supabaseAnonKey: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "placeholder-anon-key";

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
);

/**
 * Shared Supabase Client instance
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Maps a Supabase Auth User instance to the EventSync UserProfile interface.
 */
export function supabaseUserToUserProfile(user: User): UserProfile {
  const metadata = user.user_metadata || {};
  const email = user.email || "";
  const name =
    metadata.name || metadata.full_name || (email ? email.split("@")[0] : "EventSync Member");
  const phone = metadata.phone || user.phone || "";
  const gender = (metadata.gender as "boy" | "girl" | "male" | "female") || "boy";
  const avatar = metadata.avatar || (gender === "girl" ? "girl-animated-svg" : "boy-animated-svg");

  return {
    name,
    email,
    avatar,
    gender,
    phone: phone || undefined,
    loginTime: user.last_sign_in_at || new Date().toISOString(),
  };
}

export interface SupabaseVerificationResult {
  success: boolean;
  message: string;
  url: string;
  authHealth?: {
    status: number;
    ok: boolean;
    version?: string;
  };
  queryTest?: {
    status: number;
    message: string;
    keyAccepted: boolean;
  };
  latencyMs: number;
  error?: string;
}

/**
 * Temporary utility function to verify Supabase connection and credentials.
 * Checks both the Auth service health and queries a dummy table to confirm key acceptance.
 */
export async function verifySupabaseConnection(): Promise<SupabaseVerificationResult> {
  const startTime = Date.now();

  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: "Supabase environment variables (VITE_SUPABASE_URL and key) are missing or empty.",
      url: supabaseUrl,
      latencyMs: 0,
      error: "Missing credentials",
    };
  }

  try {
    // 1. Check Auth health endpoint with the configured API key
    let authHealthInfo: SupabaseVerificationResult["authHealth"];
    try {
      const authRes = await fetch(`${supabaseUrl}/auth/v1/health`, {
        headers: { apikey: supabaseAnonKey },
      });
      const authData = authRes.ok ? await authRes.json() : null;
      authHealthInfo = {
        status: authRes.status,
        ok: authRes.ok,
        version: authData?.version,
      };
    } catch {
      // Handled gracefully
    }

    // 2. Query dummy record / schema cache via Supabase client
    const { error, status } = await supabase.from("_connection_test").select("*").limit(1);

    const latencyMs = Date.now() - startTime;
    const isUnauthorized =
      status === 401 ||
      Boolean(error?.message && error.message.toLowerCase().includes("invalid api key"));

    if (isUnauthorized) {
      return {
        success: false,
        message: "Supabase connection failed: Invalid API key or unauthorized.",
        url: supabaseUrl,
        authHealth: authHealthInfo,
        queryTest: {
          status,
          message: error?.message || "HTTP 401 Unauthorized",
          keyAccepted: false,
        },
        latencyMs,
        error: error?.message || "Unauthorized",
      };
    }

    return {
      success: true,
      message:
        "Supabase connection verified successfully! Project credentials are valid and active.",
      url: supabaseUrl,
      authHealth: authHealthInfo,
      queryTest: {
        status,
        message: error ? error.message : "Dummy query succeeded",
        keyAccepted: true,
      },
      latencyMs,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to connect to Supabase endpoint: ${errorMsg}`,
      url: supabaseUrl,
      latencyMs: Date.now() - startTime,
      error: errorMsg,
    };
  }
}

// Make accessible in browser window for quick console testing
if (typeof window !== "undefined") {
  window.verifySupabaseConnection = verifySupabaseConnection;
}
