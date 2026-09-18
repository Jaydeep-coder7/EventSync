import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  ArrowRight,
  Zap,
  Music,
  Cpu,
  Utensils,
  Palette,
  Trophy,
  Briefcase,
  ShieldCheck,
  Sparkles,
  QrCode,
  Users,
} from 'lucide-react';
import { EventCategory } from '../types';
import stageBackground from '../assets/eventsync-stage-background.jpg';

interface HeroProps {
  onSearchSubmit: (query: string, category: EventCategory) => void;
  onExploreClick: () => void;
  onBookFeaturedClick: () => void;
  stats?: {
    totalEvents: number;
    activeBookingsCount: number;
    totalTicketsSold: number;
    totalAvailableSeats: number;
  } | null;
}

const CATEGORY_CHIPS: { label: EventCategory; icon: any; glowColor: string }[] = [
  { label: 'Music', icon: Music, glowColor: 'hover:border-rose-400/50 hover:bg-rose-500/10' },
  { label: 'Technology', icon: Cpu, glowColor: 'hover:border-blue-400/50 hover:bg-blue-500/10' },
  { label: 'Food & Drink', icon: Utensils, glowColor: 'hover:border-amber-400/50 hover:bg-amber-500/10' },
  { label: 'Arts & Theatre', icon: Palette, glowColor: 'hover:border-purple-400/50 hover:bg-purple-500/10' },
  { label: 'Sports & Fitness', icon: Trophy, glowColor: 'hover:border-emerald-400/50 hover:bg-emerald-500/10' },
  { label: 'Business & Networking', icon: Briefcase, glowColor: 'hover:border-indigo-400/50 hover:bg-indigo-500/10' },
];

export const Hero: React.FC<HeroProps> = ({
  onSearchSubmit,
  onExploreClick,
  onBookFeaturedClick,
  stats,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchInput, selectedCategory);
  };

  const handleCategorySelect = (category: EventCategory) => {
    setSelectedCategory(category);
    onSearchSubmit(searchInput, category);
  };

  return (
    <section className="eventsync-hero relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-white/10">
      <motion.img
        src={stageBackground}
        alt="Golden lights over a live EventSync concert"
        width={1920}
        height={1080}
        initial={{ scale: 1.04, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        className="eventsync-hero-image pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="eventsync-hero-shade pointer-events-none absolute inset-0" />
      <div className="eventsync-hero-grain pointer-events-none absolute inset-0" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Top Pill Announcement with Pulsing Glow */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold text-amber-300 shadow-sm backdrop-blur-xl mb-5 sm:mb-6 max-w-full text-center"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span>Live Sync Engine</span>
            <span className="text-amber-500/60 hidden xs:inline">•</span>
            <span className="text-white font-medium">Digital QR Gate Passes</span>
            <span className="text-amber-500/60 hidden xs:inline">•</span>
            <span className="text-amber-400 font-bold">₹ INR Pricing</span>
          </motion.div>

          {/* Hero Headline with Luxury Gradient Accent */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display max-w-4xl text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight break-words px-1 sm:px-0"
          >
            Don't Just Hear About It.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 inline-block break-words">
              Be There With EventSync.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 sm:mt-5 max-w-2xl text-xs sm:text-base text-slate-300 leading-relaxed break-words px-1 sm:px-0"
          >
            Discover premier music tours, AI tech summits, stadium sports, and culinary festivals across India. 
            Real-time seat synchronisation, instant Gmail authentication, and verified digital passes with zero hidden fees.
          </motion.p>

          {/* Interactive Search & Filter Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 sm:mt-8 w-full max-w-3xl rounded-3xl border border-white/15 bg-slate-900/85 p-3 sm:p-4 shadow-2xl shadow-black/60 backdrop-blur-2xl transition-all hover:border-white/25"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              {/* Keyword Search Input */}
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="hero-search-input"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search events by title, artist, venue, or city..."
                  className="w-full rounded-2xl bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all border border-white/10"
                />
              </div>

              {/* Category Dropdown */}
              <div className="sm:w-52">
                <select
                  id="hero-category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as EventCategory)}
                  aria-label="Select Event Category"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 py-3 px-3.5 text-sm font-medium text-slate-200 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Music">Music & Concerts</option>
                  <option value="Technology">Technology & AI</option>
                  <option value="Food & Drink">Food & Wine</option>
                  <option value="Arts & Theatre">Arts & Theatre</option>
                  <option value="Sports & Fitness">Sports & Fitness</option>
                  <option value="Business & Networking">Business & Startups</option>
                </select>
              </div>

              {/* Search Submit CTA Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                id="hero-search-submit-btn"
                type="submit"
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all cursor-pointer shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </form>

            {/* Quick Category Chips with Motion */}
            <div
              data-lenis-prevent="true"
              className="mt-3.5 flex items-center gap-2 overflow-x-auto pt-2.5 pb-1 text-xs border-t border-white/10 scrollbar-none overscroll-x-contain"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 pl-1 pr-1 shrink-0">
                Popular:
              </span>
              {CATEGORY_CHIPS.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.label;
                return (
                  <motion.button
                    key={cat.label}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    id={`hero-chip-${cat.label.toLowerCase().replace(/[^a-z]/g, '')}`}
                    onClick={() => handleCategorySelect(cat.label)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1 font-medium transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-semibold shadow-xs'
                        : `border-white/10 bg-white/5 text-slate-300 ${cat.glowColor}`
                    }`}
                  >
                    <IconComponent className="h-3 w-3 text-amber-400" />
                    <span>{cat.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              id="hero-cta-explore-events"
              onClick={onExploreClick}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer"
            >
              <span>Explore All Events</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              id="hero-cta-book-featured"
              onClick={onBookFeaturedClick}
              className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-all cursor-pointer backdrop-blur-md"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Book Featured Event</span>
            </motion.button>
          </motion.div>

          {/* Live Trust & Backend Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 border-t border-white/10 pt-8 max-w-4xl w-full"
          >
            <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                {stats ? `${stats.totalEvents} Live` : '9 Active'}
              </span>
              <span className="text-xs font-medium text-slate-400 mt-0.5">
                Curated Events
              </span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                {stats && stats.totalAvailableSeats ? `${stats.totalAvailableSeats.toLocaleString()}+` : '18,500+'}
              </span>
              <span className="text-xs font-medium text-slate-400 mt-0.5">
                Remaining Seats
              </span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-amber-400 flex items-center gap-1">
                4.9 <span className="text-xs">★</span>
              </span>
              <span className="text-xs font-medium text-slate-400 mt-0.5">
                Attendee Rating
              </span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-400 flex items-center gap-1">
                100%
              </span>
              <span className="text-xs font-medium text-slate-400 mt-0.5">
                Digital Pass Entry
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
