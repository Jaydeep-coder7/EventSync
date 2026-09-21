import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  Ticket,
  Lock,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Phone,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { UserProfile } from "../types";
import { supabase, supabaseUserToUserProfile } from "../lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: UserProfile, isNewAccount?: boolean) => void;
  defaultEmail?: string;
  forceLogin?: boolean;
}

/**
 * Translates Supabase authentication errors into clean, friendly user-facing messages.
 * Normal user validation failures (e.g. wrong password or typo) are logged with console.warn.
 */
function getFriendlyAuthErrorMessage(error: unknown, mode: "signin" | "signup"): string {
  console.warn(`[Supabase Auth ${mode}] Notice:`, error);

  if (!error) return "An error occurred during authentication. Please try again.";

  const err = error as { code?: string; message?: string; status?: number; name?: string };
  const code = (err.code || "").toLowerCase();
  const msg = (err.message || "").toLowerCase();
  const status = err.status;

  // 1. Invalid credentials
  if (
    code === "invalid_credentials" ||
    code === "invalid_grant" ||
    msg.includes("invalid login credentials") ||
    msg.includes("invalid credentials") ||
    msg.includes("invalid password") ||
    (mode === "signin" && msg.includes("user not found"))
  ) {
    return "Incorrect email or password. If you don't have an account yet, click 'Create one now' below.";
  }

  // 2. Email not confirmed
  if (
    code === "email_not_confirmed" ||
    msg.includes("email not confirmed") ||
    msg.includes("not confirmed")
  ) {
    return "Your email address has not been confirmed yet. Please check your inbox for the confirmation link.";
  }

  // 3. Rate limiting
  if (
    code === "over_email_send_rate_limit" ||
    msg.includes("email rate limit") ||
    msg.includes("email send rate limit")
  ) {
    return "Supabase email rate limit reached (free tier allows ~3 confirmation emails per hour). You can enter immediately below without waiting.";
  }

  if (
    code === "over_request_rate_limit" ||
    status === 429 ||
    msg.includes("rate limit") ||
    msg.includes("too many requests")
  ) {
    return "Too many requests. Please wait a few moments and try again.";
  }

  // 4. Network failure
  if (
    err.name === "TypeError" ||
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("connection") ||
    msg.includes("offline")
  ) {
    return "Unable to connect to the authentication service. Please check your internet connection.";
  }

  // 5. User already exists (sign up)
  if (
    code === "user_already_exists" ||
    msg.includes("already registered") ||
    msg.includes("already exists") ||
    msg.includes("user already exists")
  ) {
    return "An account with this email already exists. Please sign in.";
  }

  // 6. Password requirement
  if (msg.includes("password should be at least") || msg.includes("weak_password")) {
    return "Password must be at least 6 characters.";
  }

  return "An error occurred during authentication. Please try again.";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultEmail = "",
  forceLogin = false,
}) => {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState(defaultEmail || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [hasCredentialError, setHasCredentialError] = useState(false);
  const [isEmailRateLimited, setIsEmailRateLimited] = useState(false);
  const [rateLimitCandidate, setRateLimitCandidate] = useState<{
    name: string;
    email: string;
    phone?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const canClose = !forceLogin && Boolean(onClose);

  // Lock background body scroll and stop Lenis while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Pause Lenis smooth scrolling so backdrop stays firmly anchored to current view
    const lenis = (window as unknown as { __LENIS__?: { stop: () => void; start: () => void } })
      .__LENIS__;
    if (lenis?.stop) {
      lenis.stop();
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      if (lenis?.start) {
        lenis.start();
      }
    };
  }, [isOpen]);

  // Handle Escape key (only allowed if canClose is true)
  useEffect(() => {
    if (!isOpen || !canClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, canClose, onClose]);

  // Update email if defaultEmail prop changes
  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  if (!isOpen) return null;

  // Resend verification email
  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail || isResendingEmail) return;
    setIsResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: unconfirmedEmail,
      });
      if (error) {
        setErrorMessage(getFriendlyAuthErrorMessage(error, "signup"));
      } else {
        setSuccessMessage(
          `Verification email resent to ${unconfirmedEmail}! Please check your inbox.`,
        );
      }
    } catch {
      setErrorMessage("Failed to resend confirmation email. Please try again.");
    } finally {
      setIsResendingEmail(false);
    }
  };

  // Send password reset email
  const handleForgotPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setErrorMessage(
        "Please enter your email address in the field above to receive password reset instructions.",
      );
      return;
    }
    setIsResettingPassword(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}${window.location.pathname}`
          : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: redirectUrl,
      });
      if (error) {
        if (
          error.status === 429 ||
          error.code === "over_email_send_rate_limit" ||
          error.message?.toLowerCase().includes("rate limit")
        ) {
          setErrorMessage(
            "Password reset email limit reached. Please check your inbox or wait a few minutes before trying again.",
          );
        } else {
          setErrorMessage(getFriendlyAuthErrorMessage(error, "signin"));
        }
      } else {
        setSuccessMessage(
          `Password reset link sent to ${normalizedEmail}! Please check your email inbox to choose a new password.`,
        );
      }
    } catch {
      setErrorMessage("Unable to send reset email. Please try again.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Sign In with Password via Supabase Auth
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage("");
    setSuccessMessage("");
    setUnconfirmedEmail(null);
    setHasCredentialError(false);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      if (error) {
        const errCode = (error.code || "").toLowerCase();
        const errMsg = (error.message || "").toLowerCase();

        if (
          errCode === "email_not_confirmed" ||
          errMsg.includes("email not confirmed") ||
          errMsg.includes("not confirmed")
        ) {
          setUnconfirmedEmail(normalizedEmail);
          setErrorMessage(
            "Your email address has not been confirmed yet. Please check your inbox for the confirmation link.",
          );
          return;
        }

        if (
          errCode === "invalid_credentials" ||
          errCode === "invalid_grant" ||
          errMsg.includes("invalid login credentials") ||
          errMsg.includes("invalid credentials")
        ) {
          setHasCredentialError(true);
        }

        setErrorMessage(getFriendlyAuthErrorMessage(error, "signin"));
        return;
      }

      if (data?.user) {
        const userProfile = supabaseUserToUserProfile(data.user);
        onLoginSuccess(userProfile, false);
        if (onClose && !forceLogin) onClose();
      } else {
        setHasCredentialError(true);
        setErrorMessage("Incorrect email or password.");
      }
    } catch (err: unknown) {
      setErrorMessage(getFriendlyAuthErrorMessage(err, "signin"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign Up with Email and Password via Supabase Auth
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage("");
    setSuccessMessage("");
    setUnconfirmedEmail(null);
    setIsEmailRateLimited(false);
    setRateLimitCandidate(null);

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setErrorMessage("Please enter a valid email address (e.g. yourname@gmail.com).");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Attempt Supabase Auth account creation
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          data: {
            name: trimmedName,
            full_name: trimmedName,
            phone: trimmedPhone || undefined,
            avatar: "boy-animated-svg",
            gender: "boy",
          },
        },
      });

      // 2. Handle user already registered seamlessly
      const isAlreadyRegistered =
        (error &&
          (error.code === "user_already_exists" ||
            error.message?.toLowerCase().includes("already registered") ||
            error.message?.toLowerCase().includes("already exists"))) ||
        Boolean(data?.user?.identities && data.user.identities.length === 0);

      if (isAlreadyRegistered) {
        // Automatically sign them in with the provided password
        const signInRes = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        });

        if (signInRes.data?.user) {
          const userProfile = supabaseUserToUserProfile(signInRes.data.user);
          onLoginSuccess(userProfile, false);
          if (onClose && !forceLogin) onClose();
          return;
        }

        if (
          signInRes.error?.code === "email_not_confirmed" ||
          signInRes.error?.message?.toLowerCase().includes("email not confirmed")
        ) {
          setUnconfirmedEmail(normalizedEmail);
          setErrorMessage(
            "An account with this email already exists, but its email is not confirmed yet. Please check your inbox.",
          );
          setAuthMode("signin");
          return;
        }

        // If credentials mismatch, direct them to sign in
        setErrorMessage(
          "An account with this email already exists. Please sign in with your password.",
        );
        setAuthMode("signin");
        return;
      }

      if (error) {
        const isRateLimit =
          error.code === "over_email_send_rate_limit" ||
          error.status === 429 ||
          error.message?.toLowerCase().includes("rate limit") ||
          error.message?.toLowerCase().includes("email rate limit");

        if (isRateLimit) {
          setIsEmailRateLimited(true);
          setRateLimitCandidate({
            name: trimmedName,
            email: normalizedEmail,
            phone: trimmedPhone || undefined,
          });
          setErrorMessage(
            "Supabase free tier rate limit: Only ~3 confirmation emails can be sent per hour. You can click 'Instant Entry' below to enter right now with this account.",
          );
          return;
        }

        setErrorMessage(getFriendlyAuthErrorMessage(error, "signup"));
        return;
      }

      // 3. If session is directly returned (email confirmation disabled in Supabase)
      if (data?.session?.user) {
        const userProfile = supabaseUserToUserProfile(data.session.user);
        onLoginSuccess(userProfile, true);
        if (onClose && !forceLogin) onClose();
        return;
      }

      // 4. If user was created, try immediate sign in
      if (data?.user) {
        const signInRes = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        });

        if (signInRes.data?.user) {
          const userProfile = supabaseUserToUserProfile(signInRes.data.user);
          onLoginSuccess(userProfile, true);
          if (onClose && !forceLogin) onClose();
          return;
        }

        // If email confirmation is required by project settings
        if (
          signInRes.error?.code === "email_not_confirmed" ||
          signInRes.error?.message?.toLowerCase().includes("email not confirmed")
        ) {
          setUnconfirmedEmail(normalizedEmail);
          setSuccessMessage(
            `Account created! A confirmation link has been sent to ${normalizedEmail}. Please check your inbox to sign in.`,
          );
          setAuthMode("signin");
          return;
        }

        const userProfile = supabaseUserToUserProfile(data.user);
        onLoginSuccess(userProfile, true);
        if (onClose && !forceLogin) onClose();
        return;
      }

      setErrorMessage("Unable to complete sign up. Please try again.");
    } catch (err: unknown) {
      setErrorMessage(getFriendlyAuthErrorMessage(err, "signup"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      data-lenis-prevent="true"
      onClick={canClose ? onClose : undefined}
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-slate-950/85 overflow-y-auto ${
        canClose ? "cursor-pointer" : "cursor-default"
      }`}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/25 bg-slate-900/98 text-white shadow-2xl shadow-amber-500/10 backdrop-blur-2xl cursor-default my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button ONLY if closing is allowed */}
        {canClose && (
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
            aria-label="Close login modal"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-yellow-500/10 blur-3xl" />

        {/* Modal Header */}
        <div className="relative p-5 pb-3 text-center border-b border-white/10">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/30">
            <Ticket className="h-6 w-6 rotate-[-12deg]" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-[11px] font-semibold text-amber-300 mb-1.5">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>EventSync Portal</span>
          </span>

          <h2 className="font-display text-xl font-bold tracking-tight text-white">
            {authMode === "signin" ? "Sign In to Event" : "Create Your Event"}
            <span className="text-amber-400">Sync</span> Account
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {authMode === "signin"
              ? "Access your digital passes, bookings, and instant reservations."
              : "Register once to save your tickets, profile, and digital entry passes."}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-3.5 relative">
          {/* Sign In vs Sign Up Tab Toggle */}
          <div className="flex rounded-xl bg-slate-800/90 p-1 border border-white/10 text-xs font-semibold">
            <button
              type="button"
              id="tab-auth-signin"
              onClick={() => {
                setAuthMode("signin");
                setErrorMessage("");
                setSuccessMessage("");
                setUnconfirmedEmail(null);
                setHasCredentialError(false);
                setIsEmailRateLimited(false);
                setRateLimitCandidate(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                authMode === "signin"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              id="tab-auth-signup"
              onClick={() => {
                setAuthMode("signup");
                setErrorMessage("");
                setSuccessMessage("");
                setUnconfirmedEmail(null);
                setHasCredentialError(false);
                setIsEmailRateLimited(false);
                setRateLimitCandidate(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                authMode === "signup"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Status Banners */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-start gap-2.5"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold block text-emerald-200">Success</span>
                  <span className="text-[11px] leading-relaxed text-emerald-300/90 block">
                    {successMessage}
                  </span>
                </div>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">
                    <span>{errorMessage}</span>
                    {unconfirmedEmail && (
                      <div className="mt-2 pt-2 border-t border-rose-500/20">
                        <button
                          type="button"
                          onClick={handleResendConfirmation}
                          disabled={isResendingEmail}
                          className="inline-flex items-center gap-1.5 font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer disabled:opacity-50"
                        >
                          {isResendingEmail && <Loader2 className="h-3 w-3 animate-spin" />}
                          <span>Resend verification email to {unconfirmedEmail}</span>
                        </button>
                      </div>
                    )}
                    {hasCredentialError && authMode === "signin" && (
                      <div className="mt-2 pt-2 border-t border-rose-500/20 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("signup");
                            setErrorMessage("");
                            setHasCredentialError(false);
                          }}
                          className="font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                        >
                          Need an account? Click here to register
                        </button>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={isResettingPassword}
                          className="text-slate-300 hover:text-white underline cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {isResettingPassword && <Loader2 className="h-3 w-3 animate-spin" />}
                          <span>Reset password</span>
                        </button>
                      </div>
                    )}
                    {isEmailRateLimited && authMode === "signup" && (
                      <div className="mt-2.5 pt-2.5 border-t border-rose-500/20 space-y-2">
                        <button
                          type="button"
                          id="btn-rate-limit-instant-entry"
                          onClick={() => {
                            const instantUser: UserProfile = {
                              name: rateLimitCandidate?.name || name.trim() || "Event Attendee",
                              email:
                                rateLimitCandidate?.email ||
                                email.trim().toLowerCase() ||
                                "guest@eventsync.app",
                              avatar: "boy-animated-svg",
                              gender: "boy",
                              phone: rateLimitCandidate?.phone || phone.trim() || undefined,
                              loginTime: new Date().toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              }),
                            };
                            onLoginSuccess(instantUser, true);
                            if (onClose && !forceLogin) onClose();
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-yellow-400 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-950" />
                          <span>
                            Instant Access: Enter as{" "}
                            {rateLimitCandidate?.name || name.trim() || "Attendee"}
                          </span>
                        </button>
                        <p className="text-[11px] text-amber-200/90 leading-tight">
                          ⚡ <strong>Tip:</strong> In Supabase Dashboard → <em>Authentication</em> →{" "}
                          <em>Providers</em> → <em>Email</em>, turn OFF{" "}
                          <em>&quot;Confirm email&quot;</em> to enable unlimited instant signups for
                          all Gmail accounts.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email / Password Form */}
          <form
            onSubmit={authMode === "signin" ? handleSignIn : handleSignUp}
            className="space-y-3"
          >
            {authMode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="auth-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full rounded-xl border border-white/15 bg-slate-800/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="auth-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (hasCredentialError) setHasCredentialError(false);
                  }}
                  placeholder="name@example.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck="false"
                  required
                  className="w-full rounded-xl border border-white/15 bg-slate-800/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                {authMode === "signin" ? (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isResettingPassword || isSubmitting}
                    className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {isResettingPassword ? "Sending reset..." : "Forgot password?"}
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400">Min. 6 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="auth-password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authMode === "signup" ? "Create a password" : "Enter your password"}
                  autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-white/15 bg-slate-800/80 py-2 pl-9 pr-10 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {authMode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="auth-phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0100"
                    autoComplete="tel"
                    className="w-full rounded-xl border border-white/15 bg-slate-800/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              id="auth-submit-btn"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 px-4 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-yellow-400 shadow-md shadow-amber-500/20 cursor-pointer transition-all disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{authMode === "signin" ? "Signing In..." : "Creating Account..."}</span>
                </>
              ) : (
                <span>{authMode === "signin" ? "Sign In" : "Create Account"}</span>
              )}
            </button>
          </form>

          {/* Toggle between Sign In & Create Account */}
          <div className="text-center pt-2">
            {authMode === "signin" ? (
              <p className="text-xs text-slate-400">
                Don&apos;t have an account yet?{" "}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setAuthMode("signup");
                    setErrorMessage("");
                    setSuccessMessage("");
                    setUnconfirmedEmail(null);
                  }}
                  className="font-semibold text-amber-400 hover:underline cursor-pointer disabled:opacity-50"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Already registered?{" "}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setAuthMode("signin");
                    setErrorMessage("");
                    setSuccessMessage("");
                    setUnconfirmedEmail(null);
                  }}
                  className="font-semibold text-amber-400 hover:underline cursor-pointer disabled:opacity-50"
                >
                  Sign In here
                </button>
              </p>
            )}
          </div>

          {/* Guest Access Option */}
          <div className="text-center pt-1">
            <button
              type="button"
              id="auth-guest-btn"
              onClick={() => {
                const guestUser: UserProfile = {
                  name: "Guest Explorer",
                  email: "guest@eventsync.app",
                  avatar: "boy-animated-svg",
                  gender: "boy",
                  loginTime: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                };
                onLoginSuccess(guestUser, false);
                if (onClose && !forceLogin) onClose();
              }}
              className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors cursor-pointer inline-flex items-center gap-1 font-medium"
            >
              <span>Or explore preview as</span>
              <span className="text-amber-400 font-semibold underline">Guest Explorer</span>
            </button>
          </div>

          {/* Trust Footnote */}
          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400 border-t border-white/5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Secure Verification</span>
            </span>
            <span className="flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Encrypted Session</span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
};
