/**
 * EventSync - Authentication Service (Vanilla JS ES6+)
 * Supports both local guest profiles and optional Supabase Auth integration
 */

const USER_STORAGE_KEY = "eventsync_user";

/**
 * Gets currently signed-in user profile from LocalStorage
 * @returns {Object|null}
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Sets current user profile in LocalStorage
 * @param {Object} user
 */
export function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
  } else {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new CustomEvent("eventsync:auth-changed", { detail: user }));
}

/**
 * Signs out current user
 */
export function signOutUser() {
  setCurrentUser(null);
}

/**
 * Signs in or creates a guest profile for the demo
 * @param {string} name
 * @param {string} email
 * @param {string} phone
 * @returns {Object}
 */
export function signInGuest(name, email, phone = "") {
  const user = {
    id: "usr-" + Math.floor(100000 + Math.random() * 900000),
    name: name || "EventSync Member",
    email: email || "member@eventsync.app",
    phone: phone,
    isGuest: true,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    createdAt: new Date().toISOString(),
  };
  setCurrentUser(user);
  return user;
}
