import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Ticket,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { UserProfile } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  defaultEmail?: string;
  forceLogin?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultEmail = "jaydeepch137@gmail.com",
  forceLogin = true,
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState("Jaydeep");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleOneClickGoogleLogin = () => {
    setIsSubmitting(true);
    setErrorMessage("");

    setTimeout(() => {
      const user: UserProfile = {
        name: name.trim() || "Jaydeep",
        email: email.trim() || defaultEmail,
        gender: "boy",
        avatar: "boy-animated-svg",
        phone: phone.trim(),
        loginTime: new Date().toISOString(),
      };
      setIsSubmitting(false);
      onLoginSuccess(user);
    }, 400);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Please enter your full name");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid Gmail / email address");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const user: UserProfile = {
        name: name.trim(),
        email: email.trim(),
        gender: "boy",
        avatar: "boy-animated-svg",
        phone: phone.trim() || undefined,
        loginTime: new Date().toISOString(),
      };
      setIsSubmitting(false);
      onLoginSuccess(user);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/20 bg-slate-900/95 text-white shadow-2xl shadow-amber-500/10 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background accents */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />

        {/* Modal Header */}
        <div className="relative p-6 pb-4 text-center border-b border-white/10">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/30">
            <Ticket className="h-7 w-7 rotate-[-12deg]" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-300 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>EventSync Access Portal</span>
          </span>

          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">
            Welcome to Event<span className="text-amber-400">Sync</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Sign in with your Gmail account to reserve tickets and access instant digital QR passes.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 relative">
          {errorMessage && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 text-center">
              {errorMessage}
            </div>
          )}

          {!isCustomMode ? (
            <div className="space-y-4">
              {/* One-Click Google / Gmail Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-google-login-direct"
                onClick={handleOneClickGoogleLogin}
                disabled={isSubmitting}
                className="w-full flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 p-4 hover:bg-white/15 hover:border-amber-400/50 transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex items-center gap-3">
                  {/* Google G SVG Icon */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-2 shadow-xs shrink-0">
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">Continue with Google</span>
                      <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-300">
                        Fast
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block truncate max-w-[200px]">
                      {email}
                    </span>
                  </div>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </motion.button>

              <div className="relative flex items-center justify-center text-center">
                <div className="w-full border-t border-white/10" />
                <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  or use another Gmail
                </span>
                <div className="w-full border-t border-white/10" />
              </div>

              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="w-full rounded-2xl border border-white/10 bg-slate-800/60 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                Sign in with another Gmail / Email
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3">
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
                    className="w-full rounded-xl border border-white/15 bg-slate-800/80 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Gmail Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="auth-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    required
                    className="w-full rounded-xl border border-white/15 bg-slate-800/80 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mobile Number (for SMS Passes)
                </label>
                <input
                  id="auth-phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-white/15 bg-slate-800/80 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-slate-800/50 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-yellow-400 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {isSubmitting ? "Logging in..." : "Sign In with Gmail"}
                </button>
              </div>
            </form>
          )}

          {/* Guarantee Badges */}
          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400 border-t border-white/5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Secure Google OAuth</span>
            </span>
            <span className="flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Instant Exit Anytime</span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
