/**
 * EventSync - Supabase Authentication Service (Pure ES6+ JavaScript)
 *
 * Provides production-ready Supabase Auth for EventSync:
 * - Session persistence & automatic restoration on refresh
 * - Email & password signup with profile metadata
 * - Email & password signin
 * - Secure logout
 * - Real-time auth state changes
 * - Protected page routing guards
 * - Friendly user-facing error messages
 * - Graceful Google OAuth handling
 */

import { createClient } from "@supabase/supabase-js";

// Supabase Project Configuration (Browser-Safe Anon / Publishable Key only)
export const SUPABASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  "https://mmlhkcqukfabeppzdjte.supabase.co";

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  "sb_publishable_9H7B2qfRFQFW-doAIVQ7qA_yYTOQSFk";

let supabaseClient = null;
let currentCachedUser = null;
let sessionRestored = false;

/**
 * Initializes and returns the singleton Supabase client
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function initializeAuth() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Ensure createClient is available either from npm package or CDN global
  const clientFactory =
    createClient ||
    (typeof window !== "undefined" && window.supabase && window.supabase.createClient);

  if (!clientFactory) {
    console.error("[EventSync Auth] Supabase client factory is not available.");
    throw new Error("Supabase client library could not be loaded.");
  }

  supabaseClient = clientFactory(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });

  return supabaseClient;
}

/**
 * Returns the Supabase client instance, initializing if needed
 */
export function getSupabase() {
  if (!supabaseClient) {
    return initializeAuth();
  }
  return supabaseClient;
}

/**
 * Normalizes Supabase User object into an app-friendly user profile
 * @param {Object} user
 * @returns {Object|null}
 */
export function formatUserProfile(user) {
  if (!user) return null;

  const metadata = user.user_metadata || {};
  const fullName =
    metadata.full_name ||
    metadata.name ||
    (user.email ? user.email.split("@")[0] : "EventSync Member");
  const firstName = fullName.trim().split(" ")[0] || "Member";
  const phone = metadata.phone || "";
  const avatar =
    metadata.avatar_url ||
    metadata.picture ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=f59e0b,10b981,6366f1&textColor=ffffff`;

  return {
    id: user.id,
    email: user.email,
    name: fullName,
    firstName: firstName,
    phone: phone,
    avatar: avatar,
    createdAt: user.created_at,
    raw: user,
  };
}

/**
 * Returns the currently signed-in user profile, or null
 * @returns {Object|null}
 */
export function getCurrentUser() {
  return currentCachedUser;
}

/**
 * Restores session from Supabase on application/page load
 * @returns {Promise<{session: Object|null, user: Object|null}>}
 */
export async function restoreSession() {
  const client = getSupabase();

  try {
    const { data, error } = await client.auth.getSession();

    if (error) {
      console.warn("[EventSync Auth] Error restoring Supabase session:", error);
      currentCachedUser = null;
      sessionRestored = true;
      dispatchAuthChange(null);
      return { session: null, user: null };
    }

    if (data && data.session && data.session.user) {
      currentCachedUser = formatUserProfile(data.session.user);
    } else {
      currentCachedUser = null;
    }

    sessionRestored = true;
    dispatchAuthChange(currentCachedUser);
    return {
      session: data ? data.session : null,
      user: currentCachedUser,
    };
  } catch (err) {
    console.error("[EventSync Auth] Exception while restoring session:", err);
    currentCachedUser = null;
    sessionRestored = true;
    dispatchAuthChange(null);
    return { session: null, user: null };
  }
}

/**
 * Listens for Supabase authentication state changes
 * @param {Function} callback (event, session, formattedUser) => void
 * @returns {{ data: { subscription: Object } }}
 */
export function listenForAuthChanges(callback) {
  const client = getSupabase();

  return client.auth.onAuthStateChange((event, session) => {
    if (session && session.user) {
      currentCachedUser = formatUserProfile(session.user);
    } else {
      currentCachedUser = null;
    }

    dispatchAuthChange(currentCachedUser);

    if (typeof callback === "function") {
      callback(event, session, currentCachedUser);
    }
  });
}

/**
 * Dispatches a DOM event for components listening to auth updates
 * @param {Object|null} user
 */
function dispatchAuthChange(user) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("eventsync:auth-changed", {
        detail: { user },
      }),
    );
  }
}

/**
 * Signs up a new user with Supabase Auth
 * @param {string} email
 * @param {string} password
 * @param {{ fullName: string, phone?: string }} profile
 * @returns {Promise<{ user: Object|null, session: Object|null, error: Object|null, friendlyError: string|null }>}
 */
export async function signUp(email, password, { fullName, phone = "" } = {}) {
  const client = getSupabase();

  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (fullName || "").trim();
    const cleanPhone = (phone || "").trim();

    const { data, error } = await client.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          full_name: cleanName,
          name: cleanName,
          phone: cleanPhone,
        },
      },
    });

    if (error) {
      console.error("[EventSync Auth Signup Technical Error]", error);
      return {
        user: null,
        session: null,
        error: error,
        friendlyError: getFriendlyErrorMessage(error, "signup"),
      };
    }

    if (data.user) {
      currentCachedUser = formatUserProfile(data.user);
      dispatchAuthChange(currentCachedUser);
    }

    return {
      user: currentCachedUser,
      session: data.session,
      error: null,
      friendlyError: null,
    };
  } catch (err) {
    console.error("[EventSync Auth Signup Exception]", err);
    return {
      user: null,
      session: null,
      error: err,
      friendlyError: getFriendlyErrorMessage(err, "signup"),
    };
  }
}

/**
 * Signs in an existing user with Supabase Auth
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object|null, session: Object|null, error: Object|null, friendlyError: string|null }>}
 */
export async function signIn(email, password) {
  const client = getSupabase();

  try {
    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (error) {
      console.error("[EventSync Auth SignIn Technical Error]", error);
      return {
        user: null,
        session: null,
        error: error,
        friendlyError: getFriendlyErrorMessage(error, "login"),
      };
    }

    if (data && data.user) {
      currentCachedUser = formatUserProfile(data.user);
      dispatchAuthChange(currentCachedUser);
    }

    return {
      user: currentCachedUser,
      session: data.session,
      error: null,
      friendlyError: null,
    };
  } catch (err) {
    console.error("[EventSync Auth SignIn Exception]", err);
    return {
      user: null,
      session: null,
      error: err,
      friendlyError: getFriendlyErrorMessage(err, "login"),
    };
  }
}

/**
 * Signs out the currently authenticated user from Supabase
 * @returns {Promise<{ success: boolean, error: Object|null }>}
 */
export async function signOut() {
  const client = getSupabase();

  try {
    const { error } = await client.auth.signOut();
    currentCachedUser = null;
    dispatchAuthChange(null);

    if (error) {
      console.error("[EventSync Auth SignOut Error]", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("[EventSync Auth SignOut Exception]", err);
    currentCachedUser = null;
    dispatchAuthChange(null);
    return { success: false, error: err };
  }
}

/**
 * Initiates Google OAuth with Supabase Auth
 * Handles gracefully if Google provider is not yet enabled
 */
export async function signInWithGoogle() {
  const client = getSupabase();

  try {
    const redirectUrl =
      typeof window !== "undefined" ? `${window.location.origin}/index.html` : undefined;

    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("[EventSync Auth Google Sign-in Error]", error);
      return {
        data: null,
        error,
        friendlyError:
          "Google sign-in is not yet enabled in your Supabase project. Please use email and password.",
      };
    }

    return { data, error: null, friendlyError: null };
  } catch (err) {
    console.error("[EventSync Auth Google Exception]", err);
    return {
      data: null,
      error: err,
      friendlyError:
        "Google sign-in is currently unavailable. Please sign in with email and password.",
    };
  }
}

/**
 * Route protection guard for private pages (index.html, events.html, event-details.html, my-bookings.html)
 * Redirects unauthenticated visitors to auth.html
 * @returns {Promise<Object|null>} The authenticated user profile
 */
export async function requireAuth() {
  if (typeof window === "undefined") return null;

  const { user } = await restoreSession();

  if (!user) {
    const pathname = window.location.pathname || "";
    const fileName = pathname.split("/").pop() || "";
    const search = window.location.search || "";

    // If opening root "/" or plain "index.html" with no query params
    if ((!fileName || fileName === "index.html") && !search) {
      window.location.replace("auth.html");
      return null;
    }

    // Direct access to specific pages or query targets
    const target = (fileName || "index.html") + search;
    if (target === "index.html") {
      window.location.replace("auth.html");
    } else {
      window.location.replace(`auth.html?redirect=${encodeURIComponent(target)}`);
    }
    return null;
  }

  return user;
}

/**
 * Route guard for auth.html
 * If the user is already authenticated, redirects them to index.html or target URL
 */
export async function redirectIfAuthenticated() {
  if (typeof window === "undefined") return;

  const { user } = await restoreSession();

  if (user) {
    const params = new URLSearchParams(window.location.search);
    const redirectParam = params.get("redirect");
    let target = "index.html";

    if (redirectParam) {
      const decoded = decodeURIComponent(redirectParam).trim();
      if (
        decoded &&
        decoded !== "/" &&
        decoded !== "auth.html" &&
        !decoded.startsWith("auth.html")
      ) {
        target = decoded;
      }
    }

    window.location.replace(target);
  }
}

/**
 * Translates technical Supabase errors into human-friendly messages
 * @param {Object} error
 * @param {'login'|'signup'|'general'} context
 * @returns {string}
 */
export function getFriendlyErrorMessage(error, context = "general") {
  if (!error) return "An unexpected error occurred. Please try again.";

  const message = (error.message || "").toLowerCase();
  const code = (error.code || error.status || "").toString().toLowerCase();

  // Invalid login credentials
  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid grant") ||
    message.includes("invalid_credentials") ||
    message.includes("user not found") ||
    message.includes("wrong password")
  ) {
    return "Email or password is incorrect.";
  }

  // Already registered email
  if (
    message.includes("user already registered") ||
    message.includes("already exists") ||
    message.includes("email already registered") ||
    message.includes("duplicate")
  ) {
    return "An account with this email already exists. Try logging in.";
  }

  // Email confirmation required
  if (message.includes("email not confirmed") || message.includes("not confirmed")) {
    return "Please confirm your email address before signing in.";
  }

  // Rate limiting / too many attempts
  if (
    code === "429" ||
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("over_email_send_rate_limit")
  ) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  // Password length
  if (
    message.includes("password should be at least") ||
    message.includes("password is too short")
  ) {
    return "Password must be at least 8 characters long.";
  }

  // Network or connectivity issues
  if (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network") ||
    code === "502" ||
    code === "503" ||
    code === "504"
  ) {
    return "Unable to connect right now. Please check your connection and try again.";
  }

  // Fallback friendly message based on context
  if (context === "login") {
    return "Unable to sign in. Please verify your credentials and try again.";
  }
  if (context === "signup") {
    return "Unable to create your account right now. Please try again.";
  }

  return error.message || "An unexpected error occurred. Please try again.";
}

// Auto-initialize singleton on module load
try {
  initializeAuth();
} catch (e) {
  console.warn("[EventSync Auth] Auto-initialization deferred:", e.message);
}
