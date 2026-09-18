import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Star,
  Users,
  CheckCircle2,
  Share2,
  Heart,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Award,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  Ban,
} from "lucide-react";
import { EventItem, TicketTier } from "../types";

interface EventDetailsModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToBook: (event: EventItem, preselectedTier?: TicketTier) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = (props) => {
  if (!props.isOpen || !props.event) return null;
  return <EventDetailsModalContent {...props} event={props.event} />;
};

const EventDetailsModalContent: React.FC<EventDetailsModalProps & { event: EventItem }> = ({
  event,
  isOpen,
  onClose,
  onProceedToBook,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const allImages = [event.image, ...(event.gallery || [])];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedTierId, setSelectedTierId] = useState<string>(event.ticketTiers?.[0]?.id || "");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const selectedTier =
    event.ticketTiers.find((t) => t.id === selectedTierId) || event.ticketTiers[0];

  // Web Share API Handler with graceful social links fallback
  const handleShareClick = async () => {
    const shareData = {
      title: `${event.title} | EventSync`,
      text: `Check out ${event.title} happening on ${event.displayDate} in ${event.city}! Reserve your pass on EventSync:`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== "AbortError") {
          setShareMenuOpen(true);
        }
      }
    } else {
      // Toggle social share drawer/sheet
      setShareMenuOpen((prev) => !prev);
    }
  };

  const copyEventLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const percentageBooked = Math.round((event.bookedSeats / event.totalSeats) * 100);
  const seatsRemaining = event.totalSeats - event.bookedSeats;

  // Social Share URLs
  const encodedUrl = encodeURIComponent(window.location.href);
  const encodedText = encodeURIComponent(
    `Join me at ${event.title} on ${event.displayDate} at ${event.venue}, ${event.city}!`,
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;

  return (
    <div
      data-lenis-prevent="true"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain p-3 sm:p-4 md:p-6 backdrop-blur-md bg-slate-950/80 transition-opacity min-h-screen"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-white/10 shadow-2xl transition-all my-4 sm:my-8 text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header / Close Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-5 py-3.5 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Events</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-amber-400">{event.category}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 hidden sm:inline" />
            <span className="text-slate-200 truncate max-w-[200px] hidden sm:inline">
              {event.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Social Web Share Button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                id="details-share-btn"
                onClick={handleShareClick}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-white/10 transition-colors cursor-pointer"
                title="Share event with friends"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </motion.button>

              {/* Social Share Menu Dropdown */}
              <AnimatePresence>
                {shareMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-white/15 bg-slate-950 p-3 shadow-2xl z-30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/10 px-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Share Event
                      </span>
                      <button
                        onClick={() => setShareMenuOpen(false)}
                        className="text-slate-500 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-400" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-white hover:bg-sky-500/20 hover:text-sky-400 transition-colors"
                    >
                      <Share2 className="h-4 w-4 text-sky-400" />
                      <span>X (Twitter)</span>
                    </a>

                    <a
                      href={telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-white hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-blue-400" />
                      <span>Telegram</span>
                    </a>

                    <button
                      onClick={copyEventLink}
                      className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-white hover:bg-amber-500/20 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        {copySuccess ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-amber-400" />
                        )}
                        <span>{copySuccess ? "Link Copied!" : "Copy Event Link"}</span>
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {onToggleFavorite && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                id="details-favorite-btn"
                onClick={() => onToggleFavorite(event.id)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                  isFavorite
                    ? "border-rose-500/40 bg-rose-500/20 text-rose-400"
                    : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
                title={isFavorite ? "Saved in favorites" : "Add to favorites"}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-rose-500" : ""}`} />
              </motion.button>
            )}

            <button
              id="details-close-btn"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {copySuccess && (
          <div className="bg-gradient-to-r from-amber-500 to-yellow-400 py-1 text-center text-xs font-bold text-slate-950 transition-all">
            Event URL copied to clipboard! Share with your friends.
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* Cancellation Notice for Cancelled Events */}
          {event.isCancelled && (
            <div className="rounded-3xl border border-rose-500/40 bg-rose-500/15 p-5 text-rose-200 space-y-2 backdrop-blur-xl shadow-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <h3 className="font-display font-bold text-base text-white">
                  Event Officially Cancelled
                </h3>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {event.cancellationReason ||
                  "This event has been cancelled by the organizers. If you have already booked tickets, a 100% full refund has been automatically credited to your original payment method."}
              </p>
              <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between text-[11px] font-semibold text-rose-300">
                <span>Refund Policy: 100% Guaranteed</span>
                <span>Ticket Sales: Closed</span>
              </div>
            </div>
          )}

          {/* Gallery View */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-950 shadow-inner border border-white/10">
              <img
                src={allImages[activeImageIndex] || event.image}
                alt={event.title}
                className="h-full w-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

              {/* Badges on Hero Image */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="inline-block rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-slate-950 shadow-md">
                    {event.category}
                  </span>
                  <h1 className="font-display text-xl sm:text-3xl font-extrabold text-white mt-1.5 drop-shadow-md">
                    {event.title}
                  </h1>
                </div>

                <div className="flex items-center gap-1.5 rounded-xl bg-slate-950/80 border border-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{event.rating}</span>
                  <span className="text-slate-400">({event.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Thumbnail Row */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-amber-400 ring-2 ring-amber-500/20 shadow"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 border border-white/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Date</span>
                <span className="text-xs font-bold text-white">{event.displayDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 border border-white/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Time</span>
                <span className="text-xs font-bold text-white">{event.time}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 border border-white/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-slate-400 block">Venue</span>
                <span className="text-xs font-bold text-white truncate block">
                  {event.venue}, {event.city}
                </span>
              </div>
            </div>
          </div>

          {/* Seat Capacity Progress */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-400" />
                <span className="font-semibold text-slate-300">Live Seat Availability</span>
              </div>
              <span className="font-bold text-white">
                {seatsRemaining} of {event.totalSeats} seats remaining ({percentageBooked}% booked)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentageBooked > 85 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(percentageBooked, 100)}%` }}
              />
            </div>
          </div>

          {/* Description and Highlights */}
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold text-white">About This Event</h2>
            <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-line">
              {event.fullDescription}
            </p>

            {/* Highlights bullet points */}
            {event.highlights && event.highlights.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Experience Highlights
                </h3>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {event.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Organizer Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={event.organizer.avatar}
                alt={event.organizer.name}
                className="h-11 w-11 rounded-xl object-cover border border-amber-400/40"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white">{event.organizer.name}</span>
                  {event.organizer.verified && <ShieldCheck className="h-4 w-4 text-emerald-400" />}
                </div>
                <span className="text-xs text-slate-400">{event.organizer.role}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-amber-400">
                {event.organizer.eventsOrganized} Events Hosted
              </span>
              <span className="text-[10px] text-slate-400 block">Verified Host</span>
            </div>
          </div>

          {/* Ticket Tier Selection Section */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-white">Select Ticket Option</h2>
                <p className="text-xs text-slate-400">
                  Zero convenience fees. Choose your pass type before booking.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {event.ticketTiers.map((tier) => {
                const isSelected = selectedTierId === tier.id;
                return (
                  <div
                    key={tier.id}
                    id={`ticket-tier-option-${tier.id}`}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all cursor-pointer ${
                      isSelected
                        ? "border-amber-400 bg-amber-500/15 shadow-md ring-1 ring-amber-400/30"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-display font-bold text-white text-sm">
                          {tier.name}
                        </span>
                        <span className="font-display text-base font-extrabold text-amber-400">
                          {tier.price === 0 ? "FREE" : `₹${tier.price.toLocaleString("en-IN")}`}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                        {tier.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <span className="text-slate-400 text-[11px]">
                        {tier.remaining} tickets available
                      </span>
                      <span
                        className={`font-semibold text-xs ${
                          isSelected ? "text-amber-300" : "text-slate-500"
                        }`}
                      >
                        {isSelected ? "✓ Selected" : "Select"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Booking Action Bar */}
        <div className="border-t border-white/10 bg-slate-950/90 px-5 py-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400">Selected: </span>
            <span className="text-xs font-bold text-white">
              {selectedTier?.name || "General Admission"}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-extrabold text-white">
                {selectedTier?.price === 0
                  ? "FREE"
                  : `₹${(selectedTier?.price || event.price).toLocaleString("en-IN")}`}
              </span>
              <span className="text-xs text-slate-400">/ person (₹0 surcharge)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="details-cancel-btn"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Close
            </button>

            {event.isCancelled ? (
              <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/20 px-6 py-3 text-sm font-bold text-rose-300">
                <Ban className="h-4 w-4 text-rose-400" />
                <span>Event Cancelled</span>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                id="details-book-now-cta"
                onClick={() => onProceedToBook(event, selectedTier)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-md shadow-amber-500/25 hover:brightness-110 transition-all cursor-pointer"
              >
                <Ticket className="h-4 w-4" />
                <span>Book Tickets Now</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
