import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import {
  X,
  User,
  Mail,
  Phone,
  AtSign,
  Sun,
  Moon,
  Share2,
  Check,
  LogOut,
  Sparkles,
  Ticket,
  Heart,
  Save,
  ShieldCheck,
} from "lucide-react";
import { UserProfile } from "../types";
import { AnimatedCharacterAvatar } from "./AnimatedCharacterAvatar";

interface UserProfileModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onExit: () => void;
  bookingCount: number;
  favoriteCount: number;
  currentTheme: "dark" | "light";
  onToggleTheme: (theme: "dark" | "light") => void;
  onShareApp: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = (props) => {
  if (!props.isOpen || !props.user) return null;
  return <UserProfileModalContent {...props} user={props.user} />;
};

const UserProfileModalContent: React.FC<UserProfileModalProps & { user: UserProfile }> = ({
  user,
  onClose,
  onUpdateProfile,
  onExit,
  bookingCount,
  favoriteCount,
  currentTheme,
  onToggleTheme,
  onShareApp,
}) => {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(
    user.username || (user.email ? user.email.split("@")[0] : "member"),
  );
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "");

  // Gender-aware avatar system: checks user.gender, or defaults to 'boy'
  const [selectedGender, setSelectedGender] = useState<"boy" | "girl">(() => {
    if (user.gender === "girl" || user.gender === "female") return "girl";
    return "boy";
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleGenderSwitch = (gender: "boy" | "girl") => {
    setSelectedGender(gender);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name: name.trim(),
      username: username.trim().replace(/^@/, ""),
      email: email.trim(),
      phone: phone.trim(),
      gender: selectedGender,
      avatar: selectedGender === "girl" ? "girl-animated-svg" : "boy-animated-svg",
      themePreference: currentTheme,
    };
    onUpdateProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleShareClick = () => {
    onShareApp();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const lenis = (window as unknown as { __LENIS__?: { stop: () => void; start: () => void } })
      .__LENIS__;
    if (lenis?.stop) lenis.stop();

    return () => {
      document.body.style.overflow = prev;
      if (lenis?.start) lenis.start();
    };
  }, []);

  const modalContent = (
    <div
      data-lenis-prevent="true"
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-3 sm:p-4 md:p-6 backdrop-blur-xl bg-slate-950/80 cursor-pointer"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border border-white/10 shadow-2xl transition-all my-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-white">
                Member Profile & Settings
              </h2>
              <span className="text-[10px] text-amber-300/80 font-medium">
                Gender-aware animated avatar, contact details & theme
              </span>
            </div>
          </div>

          <button
            id="profile-modal-close-btn"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          data-lenis-prevent
          onSubmit={handleSave}
          className="max-h-[75vh] overflow-y-auto p-6 space-y-5"
        >
          {/* Gender-Aware Animated Character Avatar Banner */}
          <div className="rounded-2xl bg-white/5 p-4 sm:p-5 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* High-quality animated SVG character with eye blinking and float */}
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/30 via-pink-500/20 to-purple-500/30 blur-sm" />
                <AnimatedCharacterAvatar
                  gender={selectedGender}
                  size="xl"
                  interactive
                  showOnlineBadge
                  className="border-2 border-amber-400/60 shadow-xl shadow-amber-500/20"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <span className="font-display font-bold text-white text-base">{name}</span>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-xs text-amber-400/90 font-mono">@{username}</span>
                <p className="text-[11px] text-slate-300 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                  <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                  <span>
                    Active Avatar:{" "}
                    <strong className="text-amber-300 capitalize">
                      {selectedGender} Animated Character
                    </strong>
                  </span>
                </p>
              </div>
            </div>

            {/* Gender Switcher (Auto-updates animated character illustration) */}
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200">Profile Gender Identity:</span>
                <span className="text-[10px] text-slate-400">
                  Select to update character animation
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="avatar-boy-btn"
                  onClick={() => handleGenderSwitch("boy")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === "boy"
                      ? "border-2 border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/30 shadow-md shadow-amber-500/15"
                      : "border border-white/10 bg-white/5 text-slate-400 hover:border-white/25 hover:text-slate-200"
                  }`}
                >
                  <span className="text-lg">👦</span>
                  <span>Boy / Male</span>
                  {selectedGender === "boy" && (
                    <Check className="h-3.5 w-3.5 text-amber-400 ml-1" />
                  )}
                </button>

                <button
                  type="button"
                  id="avatar-girl-btn"
                  onClick={() => handleGenderSwitch("girl")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === "girl"
                      ? "border-2 border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/30 shadow-md shadow-amber-500/15"
                      : "border border-white/10 bg-white/5 text-slate-400 hover:border-white/25 hover:text-slate-200"
                  }`}
                >
                  <span className="text-lg">👧</span>
                  <span>Girl / Female</span>
                  {selectedGender === "girl" && (
                    <Check className="h-3.5 w-3.5 text-amber-400 ml-1" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                <Ticket className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Bookings
                </span>
                <span className="font-display text-sm font-bold text-white">
                  {bookingCount} Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
                <Heart className="h-4 w-4 fill-current" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Saved Events
                </span>
                <span className="font-display text-sm font-bold text-white">
                  {favoriteCount} Favorites
                </span>
              </div>
            </div>
          </div>

          {/* Theme Switcher (Light vs Dark) */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-white block">Website Theme</label>
                <span className="text-[11px] text-slate-400">
                  Switch between Dark Obsidian and Crisp Light aesthetic
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                id="profile-theme-dark-btn"
                onClick={() => onToggleTheme("dark")}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition-all cursor-pointer ${
                  currentTheme === "dark"
                    ? "border border-amber-400 bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                }`}
              >
                <Moon className="h-4 w-4 text-amber-400" />
                <span>Dark Luxury</span>
              </button>

              <button
                type="button"
                id="profile-theme-light-btn"
                onClick={() => onToggleTheme("light")}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition-all cursor-pointer ${
                  currentTheme === "light"
                    ? "border border-amber-400 bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                }`}
              >
                <Sun className="h-4 w-4 text-amber-400" />
                <span>Light Clean</span>
              </button>
            </div>
          </div>

          {/* Editable Fields: Username, Full Name, Email, Phone */}
          <div className="space-y-3.5">
            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <AtSign className="h-3.5 w-3.5 text-amber-400" />
                <span>Username *</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
                  placeholder="username"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-amber-400" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jaydeep Sharma"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-amber-400" />
                <span>Email Account</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-amber-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Share App & Events Feature */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white block">
                Share EventSync with Friends
              </span>
              <span className="text-[11px] text-slate-400">
                Invite friends or share live event passes directly
              </span>
            </div>
            <button
              type="button"
              onClick={handleShareClick}
              className="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition-all cursor-pointer shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share Event</span>
                </>
              )}
            </button>
          </div>

          {/* Feedback message */}
          {saveSuccess && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-2.5 text-xs font-bold text-emerald-300">
              <Check className="h-4 w-4" />
              <span>Profile changes saved successfully!</span>
            </div>
          )}

          {/* Footer Save & Exit Actions */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onExit}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out & Exit</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
};
