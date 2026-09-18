import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Ticket,
  Search,
  Menu,
  X,
  Compass,
  Sparkles,
  LogOut,
  User,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../types';
import { AnimatedCharacterAvatar } from './AnimatedCharacterAvatar';

interface NavbarProps {
  activeTab: 'home' | 'events' | 'bookings';
  onNavigate: (tab: 'home' | 'events' | 'bookings') => void;
  bookingCount: number;
  user: UserProfile | null;
  onExit: () => void;
  onOpenLogin: () => void;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  bookingCount,
  user,
  onExit,
  onOpenLogin,
  onOpenProfile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: 'home' | 'events' | 'bookings'; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'events', label: 'Explore Events', icon: Compass },
    { id: 'bookings', label: 'My Bookings', icon: Ticket },
  ];

  const handleNavClick = (tab: 'home' | 'events' | 'bookings') => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/85 backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <button
          id="nav-brand-logo-btn"
          onClick={() => handleNavClick('home')}
          className="group flex items-center gap-3 text-left focus:outline-none cursor-pointer"
        >
          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/25 transition-transform"
          >
            <Ticket className="h-5 w-5 sm:h-6 sm:w-6 rotate-[-10deg]" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Event<span className="text-amber-400">Sync</span>
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 -mt-1 hidden sm:block">
              Curated Live Experiences & Passes
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links with animated indicator */}
        <nav className="hidden items-center gap-1.5 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'text-amber-300'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 shadow-xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'bookings' && bookingCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-slate-950 shadow-xs"
                    >
                      {bookingCount}
                    </motion.span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User Profile, Mobile Menu, Find Events & Top-Right Exit Button */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {user ? (
            /* Clickable User badge opening UserProfileModal */
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="btn-nav-user-profile"
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 sm:gap-2 rounded-2xl border border-white/10 bg-white/5 hover:border-amber-400/40 hover:bg-white/10 px-1.5 sm:px-2.5 py-1 text-left transition-all cursor-pointer group shrink-0"
              title="Open Profile & Settings"
            >
              <div className="relative">
                <AnimatedCharacterAvatar
                  gender={user.gender || 'boy'}
                  size="xs"
                  className="border border-amber-400/40 shadow-xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-slate-950" />
              </div>
              <div className="min-w-0 max-w-[75px] sm:max-w-[125px] hidden md:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white block truncate leading-tight group-hover:text-amber-300">
                    {user.name}
                  </span>
                  <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                </div>
                <span className="text-[10px] text-amber-300/80 block truncate font-mono">
                  @{user.username || user.email.split('@')[0]}
                </span>
              </div>
              <Settings className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-400 transition-colors ml-0.5 hidden sm:block" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              id="btn-nav-login"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-950 hover:brightness-110 transition-all cursor-pointer shadow-md shadow-amber-500/20 shrink-0"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Login with Gmail</span>
              <span className="xs:hidden">Login</span>
            </motion.button>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            id="nav-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 md:hidden focus:outline-none cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>

          {/* Find Events / Search Area Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            id="nav-cta-explore-btn"
            onClick={() => handleNavClick('events')}
            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl bg-white/10 border border-white/10 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-white hover:bg-white/15 transition-all cursor-pointer shrink-0"
          >
            <Search className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Find Events</span>
            <span className="sm:hidden text-[11px]">Events</span>
          </motion.button>

          {/* Exit (Logout) Button: EXTREME TOP RIGHT CORNER adjacent to search/find event area */}
          {user && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              id="btn-user-exit"
              onClick={onExit}
              className="group flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-rose-300 hover:bg-rose-600 hover:text-white hover:border-rose-500 hover:shadow-md hover:shadow-rose-600/30 transition-all duration-200 cursor-pointer shrink-0"
              title="Log out and exit application"
            >
              <LogOut className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 text-rose-400 group-hover:text-white" />
              <span className="hidden xs:inline">Exit</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-white/10 bg-slate-950/95 px-4 pt-3 pb-5 shadow-2xl md:hidden"
          >
            <div className="flex flex-col gap-2">
              {/* Mobile User Details & Profile Trigger */}
              {user && (
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 mb-1">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenProfile?.();
                    }}
                    className="flex items-center gap-3 text-left flex-1"
                  >
                    <AnimatedCharacterAvatar
                      gender={user.gender || 'boy'}
                      size="sm"
                      className="border border-amber-400/40"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white block">
                          {user.name}
                        </span>
                        <Settings className="h-3 w-3 text-amber-400" />
                      </div>
                      <span className="text-[11px] text-amber-300/80 block font-mono">
                        @{user.username || user.email.split('@')[0]}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onExit();
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-600 hover:text-white hover:border-rose-500 transition-all cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Exit</span>
                  </button>
                </div>
              )}

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-amber-400" />
                      <span>{item.label}</span>
                    </div>
                    {item.id === 'bookings' && bookingCount > 0 && (
                      <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-slate-950">
                        {bookingCount}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="mt-2 pt-3 border-t border-white/10 space-y-2">
                {user && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenProfile?.();
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-amber-400" />
                    <span>Edit Profile & Theme Settings</span>
                  </button>
                )}

                <button
                  id="mobile-nav-quick-explore"
                  onClick={() => handleNavClick('events')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-3 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  <span>Browse All Live Events</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
