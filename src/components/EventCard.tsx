import React from 'react';
import { motion, type Variants } from 'motion/react';
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  Star,
  Heart,
  Users,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import { EventItem } from '../types';

interface EventCardProps {
  event: EventItem;
  onViewDetails: (event: EventItem) => void;
  onBookNow: (event: EventItem) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: string) => void;
}

const CATEGORY_COLORS: Record<string, { badge: string; border: string }> = {
  Music: { badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', border: 'border-rose-500/20' },
  Technology: { badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', border: 'border-blue-500/20' },
  'Food & Drink': { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', border: 'border-amber-500/20' },
  'Arts & Theatre': { badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', border: 'border-purple-500/20' },
  'Sports & Fitness': { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', border: 'border-emerald-500/20' },
  'Business & Networking': { badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', border: 'border-indigo-500/20' },
};

// Movie-like Cinematic Staggered Entrance Variants
export const cardGridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const cardItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.94,
    filter: 'blur(5px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 240,
      damping: 22,
      mass: 0.75,
    },
  },
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onViewDetails,
  onBookNow,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const categoryStyle = CATEGORY_COLORS[event.category] || {
    badge: 'bg-white/10 text-slate-300 border-white/20',
    border: 'border-white/10',
  };

  const percentageBooked = Math.round((event.bookedSeats / event.totalSeats) * 100);
  const seatsRemaining = Math.max(0, event.totalSeats - event.bookedSeats);

  const dateParts = event.displayDate.split(',');
  const monthDay = dateParts.length > 1 ? dateParts[1].trim() : event.displayDate;

  return (
    <motion.div
      variants={cardItemVariants}
      whileHover={{ y: -8, scale: 1.015, transition: { duration: 0.25, ease: 'easeOut' } }}
      id={`event-card-${event.id}`}
      onClick={() => onViewDetails(event)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/40 transition-colors duration-300 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer"
    >
      {/* Top Banner Image with Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

        {/* Top Badges Row */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap max-w-[calc(100%-42px)]">
            {event.isCancelled ? (
              <span className="rounded-xl border border-rose-500/50 bg-rose-600/30 px-2.5 py-1 text-xs font-black tracking-wide text-rose-200 backdrop-blur-md shadow-md flex items-center gap-1">
                <Ban className="h-3.5 w-3.5 text-rose-300 shrink-0" />
                <span>CANCELLED</span>
              </span>
            ) : null}
            <span
              className={`rounded-xl border px-2.5 py-1 text-xs font-bold backdrop-blur-md ${categoryStyle.badge}`}
            >
              {event.category}
            </span>
            {event.tag && (
              <span className="rounded-xl border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-300 backdrop-blur-md">
                {event.tag}
              </span>
            )}
          </div>

          {/* Favorite heart button */}
          {onToggleFavorite && (
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              id={`fav-btn-${event.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(event.id);
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-xl backdrop-blur-md transition-all cursor-pointer shrink-0 ${
                isFavorite
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                  : 'bg-black/40 text-slate-300 border border-white/10 hover:bg-black/60 hover:text-white'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Save event'}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
            </motion.button>
          )}
        </div>

        {/* Floating Date Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md shadow-xs">
          <Calendar className="h-3.5 w-3.5 text-amber-400" />
          <span>{monthDay}</span>
        </div>

        {/* Rating chip */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-xl border border-white/15 bg-black/60 px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md shadow-xs">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>{event.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4 min-w-0">
        <div className="space-y-2 min-w-0">
          <h3 className="font-display text-base font-bold text-white leading-snug group-hover:text-amber-300 transition-colors line-clamp-2 break-words">
            {event.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed break-words">
            {event.shortDescription}
          </p>

          {/* Cancellation Notice Banner */}
          {event.isCancelled && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-bold block text-rose-200">Event Officially Cancelled</span>
                <span className="text-[11px] text-rose-300/80 leading-tight block mt-0.5 break-words">
                  {event.cancellationReason || 'Event cancelled by festival organizers. 100% full refund guarantee.'}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1.5 pt-1 text-xs text-slate-300">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="truncate break-words">{event.venue}, {event.city}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px] min-w-0">
              <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{event.time}</span>
            </div>
          </div>
        </div>

        {/* Live Capacity Bar */}
        <div className="space-y-1.5 rounded-2xl bg-white/5 p-3 border border-white/5">
          <div className="flex items-center justify-between text-[11px] gap-2">
            <span className="text-slate-400 flex items-center gap-1 truncate">
              <Users className="h-3 w-3 text-amber-400 shrink-0" />
              <span className="truncate">{seatsRemaining} seats left</span>
            </span>
            <span className="font-semibold text-amber-400 shrink-0">{percentageBooked}% booked</span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentageBooked > 85 ? 'bg-amber-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(percentageBooked, 100)}%` }}
            />
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Starting from</span>
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="font-display text-base sm:text-lg font-black text-white">
                {event.price === 0 ? 'FREE' : `₹${event.price.toLocaleString('en-IN')}`}
              </span>
              {event.originalPrice && event.originalPrice > event.price && (
                <span className="text-[11px] text-slate-500 line-through">
                  ₹{event.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id={`details-btn-${event.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(event);
              }}
              className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              Details
            </button>

            {event.isCancelled ? (
              <button
                type="button"
                id={`cancelled-btn-${event.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(event);
                }}
                className="flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/20 px-2.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer"
              >
                <Ban className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                <span>Cancelled</span>
              </button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                id={`book-btn-${event.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookNow(event);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-3 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer"
              >
                <Ticket className="h-3.5 w-3.5 shrink-0" />
                <span>Book</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
