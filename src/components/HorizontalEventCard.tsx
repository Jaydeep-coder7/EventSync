import React from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  Star,
  Heart,
  Users,
  Flame,
  Zap,
  Ban,
  ArrowRight,
} from 'lucide-react';
import { EventItem, TicketTier } from '../types';

interface HorizontalEventCardProps {
  event: EventItem;
  onViewDetails: (event: EventItem) => void;
  onBookNow: (event: EventItem, preTier?: TicketTier) => void;
  isFavorite: boolean;
  onToggleFavorite: (eventId: string) => void;
  index?: number;
}

const CATEGORY_COLORS: Record<string, { badge: string; border: string }> = {
  Music: { badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', border: 'border-rose-500/30' },
  Technology: { badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', border: 'border-blue-500/30' },
  'Food & Drink': { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', border: 'border-amber-500/30' },
  'Arts & Theatre': { badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', border: 'border-purple-500/30' },
  'Sports & Fitness': { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', border: 'border-emerald-500/30' },
  'Business & Networking': { badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', border: 'border-indigo-500/30' },
};

export const HorizontalEventCard: React.FC<HorizontalEventCardProps> = ({
  event,
  onViewDetails,
  onBookNow,
  isFavorite,
  onToggleFavorite,
  index = 0,
}) => {
  const percentageBooked = Math.round((event.bookedSeats / event.totalSeats) * 100);
  const seatsRemaining = Math.max(0, event.totalSeats - event.bookedSeats);
  const isHighDemand = percentageBooked >= 80 || seatsRemaining < 50;

  const categoryStyle = CATEGORY_COLORS[event.category] || {
    badge: 'bg-white/10 text-slate-300 border-white/20',
    border: 'border-white/10',
  };

  const dateObj = new Date(event.date);
  const monthDay = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      id={`horizontal-card-${event.id}`}
      onClick={() => onViewDetails(event)}
      className={`group relative flex flex-col sm:flex-row w-full overflow-hidden rounded-2xl sm:rounded-3xl border bg-slate-900/90 shadow-xl transition-all duration-300 hover:shadow-2xl cursor-pointer min-w-0 ${
        event.isCancelled
          ? 'border-rose-500/30 shadow-rose-950/10 hover:border-rose-500/50'
          : 'border-white/10 hover:border-amber-400/40 shadow-black/40 hover:shadow-amber-500/10'
      }`}
    >
      {/* LEFT COLUMN: Landscape Image Banner (Horizontal on all screens sm+) */}
      <div className="relative h-44 sm:h-auto sm:w-5/12 md:w-4/12 lg:w-80 xl:w-96 shrink-0 overflow-hidden bg-slate-950">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-slate-950/20 sm:to-slate-900" />

        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[calc(100%-48px)]">
          <span
            className={`rounded-xl border px-2.5 py-1 text-[11px] font-bold backdrop-blur-md ${categoryStyle.badge}`}
          >
            {event.category}
          </span>
          {event.tag && (
            <span className="rounded-xl border border-amber-500/40 bg-amber-500/90 px-2 py-0.5 text-[10px] font-extrabold text-slate-950 backdrop-blur-md shadow-xs">
              {event.tag}
            </span>
          )}
          {isHighDemand && (
            <span className="flex items-center gap-1 rounded-xl border border-rose-500/40 bg-rose-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              <Flame className="h-3 w-3 fill-current" />
              <span>{percentageBooked}% Sold</span>
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          id={`fav-btn-${event.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(event.id);
          }}
          className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-xl backdrop-blur-md transition-all cursor-pointer ${
            isFavorite
              ? 'bg-rose-500/30 text-rose-400 border border-rose-500/50 shadow-md'
              : 'bg-black/50 text-slate-300 border border-white/15 hover:bg-black/70 hover:text-white'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Save event'}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
        </motion.button>

        {/* Bottom Metadata on Image: Date & Rating */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-semibold text-white">
          <div className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/60 px-2.5 py-1 backdrop-blur-md">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span>{event.displayDate || monthDay}</span>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-black/60 px-2.5 py-1 text-amber-300 backdrop-blur-md">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{event.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400 font-normal">({event.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Full Details, Live Status & Action CTAs */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 lg:p-6 min-w-0 space-y-3">
        <div className="space-y-2.5 min-w-0">
          {/* Top urgency & city tracker */}
          <div className="flex items-center justify-between text-[11px] gap-2">
            <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{event.city}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-normal truncate">{event.venue}</span>
            </span>

            <span className="flex items-center gap-1 font-mono text-slate-300 shrink-0 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
              <Clock className="h-3 w-3 text-slate-400" />
              <span>{event.time}</span>
            </span>
          </div>

          {/* Event Title with full break-words and no cutting */}
          <h3 className="font-display text-base sm:text-lg md:text-xl font-bold text-white leading-snug group-hover:text-amber-300 transition-colors break-words">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed break-words">
            {event.shortDescription}
          </p>

          {/* Cancellation Alert if applicable */}
          {event.isCancelled && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300 flex items-start gap-2">
              <Ban className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="break-words font-semibold">
                Event Cancelled: {event.cancellationReason || 'Cancelled by organizers. 100% instant refund guarantee.'}
              </span>
            </div>
          )}

          {/* Live Capacity Bar */}
          <div className="rounded-xl bg-white/5 p-2.5 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium truncate">
                <Users className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>{seatsRemaining} Seats Remaining</span>
              </span>
              <span className="font-mono font-bold text-amber-400 shrink-0">
                {percentageBooked}% Booked
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentageBooked >= 85
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(percentageBooked, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Transparent Price + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 min-w-0">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Starting from</span>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-display text-lg sm:text-xl font-black text-white">
                {event.price === 0 ? 'FREE' : `₹${event.price.toLocaleString('en-IN')}`}
              </span>
              {event.originalPrice && event.originalPrice > event.price && (
                <span className="text-xs text-slate-500 line-through">
                  ₹{event.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold block">
              ₹0 Convenience Fee • Digital QR Pass
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id={`horizontal-card-details-${event.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(event);
              }}
              className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              Details
            </button>

            {event.isCancelled ? (
              <button
                type="button"
                id={`horizontal-card-cancelled-${event.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(event);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/20 px-3.5 py-2 text-xs font-bold text-rose-300 cursor-pointer"
              >
                <Ban className="h-3.5 w-3.5 text-rose-400" />
                <span>Cancelled</span>
              </button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                id={`horizontal-card-book-${event.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookNow(event);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer"
              >
                <Ticket className="h-3.5 w-3.5" />
                <span>Book Tickets</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};
