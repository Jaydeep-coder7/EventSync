import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  Flame,
  Sparkles,
  ArrowRight,
  Filter,
  Star,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { EventItem, TicketTier } from "../types";
import { HorizontalEventCard } from "./HorizontalEventCard";

interface HorizontalSellingFastFeedProps {
  events: EventItem[];
  onViewDetails: (event: EventItem) => void;
  onBookNow: (event: EventItem, preTier?: TicketTier) => void;
  favorites: string[];
  onToggleFavorite: (eventId: string) => void;
  onSeeAll?: () => void;
}

export const HorizontalSellingFastFeed: React.FC<HorizontalSellingFastFeedProps> = ({
  events,
  onViewDetails,
  onBookNow,
  favorites,
  onToggleFavorite,
  onSeeAll,
}) => {
  const [quickFilter, setQuickFilter] = useState<"all" | "music" | "tech" | "budget" | "top">(
    "all",
  );
  const [displayLimit, setDisplayLimit] = useState(6);

  // Filter events based on quick pill
  const filteredEvents = useMemo(() => {
    let result = [...events];
    if (quickFilter === "music") {
      result = result.filter((e) => e.category === "Music");
    } else if (quickFilter === "tech") {
      result = result.filter((e) => e.category === "Technology");
    } else if (quickFilter === "budget") {
      result = result.filter((e) => e.price <= 1000);
    } else if (quickFilter === "top") {
      result = result.filter((e) => e.rating >= 4.8);
    }
    return result;
  }, [events, quickFilter]);

  const visibleEvents = filteredEvents.slice(0, displayLimit);

  return (
    <section className="relative w-full py-4 sm:py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300 mb-2.5">
            <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="tracking-wide uppercase">Selling Fast • High Demand</span>
            <span className="relative flex h-2 w-2 ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Featured & Selling Fast
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed break-words">
            Widescreen horizontal events stacked for smooth vertical scrolling. Instant seat
            confirmation with ₹0 convenience fees.
          </p>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap self-start md:self-auto">
          <button
            type="button"
            id="feed-filter-all"
            onClick={() => setQuickFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
              quickFilter === "all"
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            type="button"
            id="feed-filter-music"
            onClick={() => setQuickFilter("music")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
              quickFilter === "music"
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            Music
          </button>
          <button
            type="button"
            id="feed-filter-tech"
            onClick={() => setQuickFilter("tech")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
              quickFilter === "tech"
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            Tech & AI
          </button>
          <button
            type="button"
            id="feed-filter-budget"
            onClick={() => setQuickFilter("budget")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
              quickFilter === "budget"
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            ≤ ₹1,000
          </button>
          <button
            type="button"
            id="feed-filter-top"
            onClick={() => setQuickFilter("top")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
              quickFilter === "top"
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            ⭐ 4.8+
          </button>
        </div>
      </div>

      {/* Event Cards Vertical Stream */}
      <div className="flex flex-col gap-4 sm:gap-6 w-full">
        {visibleEvents.map((event, index) => (
          <HorizontalEventCard
            key={event.id}
            event={event}
            index={index}
            onViewDetails={onViewDetails}
            onBookNow={onBookNow}
            isFavorite={favorites.includes(event.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {/* Footer Controls: Show More or View All */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <span className="text-xs text-slate-400">
          Showing {visibleEvents.length} of {filteredEvents.length} featured events
        </span>

        <div className="flex items-center gap-3">
          {displayLimit < filteredEvents.length && (
            <button
              type="button"
              id="feed-load-more-btn"
              onClick={() => setDisplayLimit((prev) => prev + 4)}
              className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer"
            >
              Load More ({filteredEvents.length - visibleEvents.length} left)
            </button>
          )}

          {onSeeAll && (
            <button
              type="button"
              id="feed-see-all-btn"
              onClick={onSeeAll}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 transition-all cursor-pointer shadow-md"
            >
              <span>Explore All Events</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
