import React, { useState } from "react";
import { createPortal } from "react-dom";
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
  Bell,
  BellRing,
  Navigation,
} from "lucide-react";
import { EventItem, TicketTier, UserProfile, Booking, EventReview } from "../types";
import { isEventConcluded } from "../utils/storage";
import {
  isEventReminderSet,
  toggleEventReminder,
  isEventApproaching,
} from "../utils/reminderStorage";
import { playNotificationChime } from "../services/notificationService";
import { EventFeedbackRating } from "./EventFeedbackRating";
import { VenueStaticMap } from "./VenueStaticMap";

interface EventDetailsModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToBook: (event: EventItem, preselectedTier?: TicketTier) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: string) => void;
  currentUser?: UserProfile | null;
  userBookings?: Booking[];
  onReviewSubmitted?: (review: EventReview) => void;
  onAddToast?: (type: "success" | "error" | "info", title: string, message?: string) => void;
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
  currentUser,
  userBookings = [],
  onReviewSubmitted,
  onAddToast,
}) => {
  const eventConcluded = isEventConcluded(event.date);
  const allImages = [event.image, ...(event.gallery || [])];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedTierId, setSelectedTierId] = useState<string>(event.ticketTiers?.[0]?.id || "");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isReminded, setIsReminded] = useState<boolean>(() => isEventReminderSet(event.id));
  const [localToast, setLocalToast] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message?: string;
  } | null>(null);

  const approachInfo = isEventApproaching(event.date);

  const showToastAlert = (type: "success" | "error" | "info", title: string, message?: string) => {
    if (onAddToast) {
      onAddToast(type, title, message);
    }
    // Also display in-modal floating alert for instant visual feedback
    setLocalToast({ type, title, message });
    setTimeout(() => {
      setLocalToast(null);
    }, 4500);
  };

  const handleToggleReminder = () => {
    if (eventConcluded) {
      showToastAlert(
        "info",
        "Event Concluded",
        `This event took place on ${event.displayDate}. Reminders are only available for upcoming events.`,
      );
      return;
    }

    const result = toggleEventReminder(event);
    setIsReminded(result.isSet);

    if (result.isSet) {
      playNotificationChime();
      if (result.isApproaching) {
        showToastAlert(
          "info",
          "Event Approaching Soon! ⏰",
          `Reminder active: "${event.title}" is ${result.label} (${event.displayDate}) at ${event.venue}, ${event.city}. Have your passes ready!`,
        );
      } else {
        showToastAlert(
          "success",
          "Reminder Set! 🔔",
          `We'll send you a toast alert as "${event.title}" approaches on ${event.displayDate}!`,
        );
      }
    } else {
      showToastAlert(
        "info",
        "Reminder Removed",
        `Notification alert has been turned off for "${event.title}".`,
      );
    }
  };

  const handleTestApproachingAlert = () => {
    playNotificationChime();
    showToastAlert(
      "info",
      "Approaching Event Alert ⏰",
      `Upcoming reminder: "${event.title}" is approaching soon (${event.displayDate}) at ${event.venue}, ${event.city}!`,
    );
  };

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

  const modalContent = (
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

            {/* Remind Me Header Toggle */}
            {!eventConcluded && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                id="details-remind-btn"
                onClick={handleToggleReminder}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isReminded
                    ? "border-amber-400/50 bg-amber-500/20 text-amber-300 shadow-sm shadow-amber-500/20"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                title={
                  isReminded
                    ? "Reminder active - Click to disable"
                    : "Remind me when event date approaches"
                }
              >
                {isReminded ? (
                  <BellRing className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                ) : (
                  <Bell className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span className="hidden sm:inline">{isReminded ? "Reminded" : "Remind Me"}</span>
              </motion.button>
            )}

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

        {/* Floating In-Modal Toast Alert */}
        <AnimatePresence>
          {localToast && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.96 }}
              className="mx-5 my-2.5 rounded-2xl border border-amber-400/40 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-xl flex items-start gap-3 z-30"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <BellRing className="h-4 w-4 animate-bounce text-amber-400" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h4 className="text-xs font-bold text-white">{localToast.title}</h4>
                {localToast.message && (
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {localToast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => setLocalToast(null)}
                className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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

            <a
              href="#venue-map-section"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("venue-map-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 border border-white/10 hover:border-amber-400/40 hover:bg-white/10 transition-colors group cursor-pointer"
              title="Click to view venue on map"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 block">Venue</span>
                  <span className="text-[10px] font-semibold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Map ↓
                  </span>
                </div>
                <span className="text-xs font-bold text-white truncate block">
                  {event.venue}, {event.city}
                </span>
              </div>
            </a>
          </div>

          {/* Interactive Remind Me / Notification Banner */}
          {!eventConcluded && (
            <motion.div
              layout
              className={`rounded-2xl border p-4 transition-all ${
                isReminded
                  ? "border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent shadow-lg shadow-amber-500/5"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                      isReminded
                        ? "border-amber-400/50 bg-amber-500/25 text-amber-400 shadow-sm"
                        : "border-white/15 bg-white/5 text-slate-400"
                    }`}
                  >
                    {isReminded ? (
                      <BellRing className="h-5 w-5 animate-pulse text-amber-400" />
                    ) : (
                      <Bell className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {isReminded ? "Event Reminder Active" : "Event Notification Reminder"}
                      </span>
                      {isReminded && (
                        <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                          {approachInfo.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isReminded
                        ? `You'll be alerted with a toast notification as ${event.displayDate} approaches.`
                        : "Get an automatic toast alert when this event date approaches so you never miss out."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  {isReminded && (
                    <button
                      onClick={handleTestApproachingAlert}
                      className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      title="Preview the approaching event toast alert"
                    >
                      Test Alert
                    </button>
                  )}
                  <button
                    id="modal-remind-me-cta"
                    onClick={handleToggleReminder}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      isReminded
                        ? "border border-amber-400/40 bg-amber-500/20 text-amber-300 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300"
                        : "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20"
                    }`}
                  >
                    {isReminded ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-amber-400" />
                        <span>Reminder Active</span>
                      </>
                    ) : (
                      <>
                        <Bell className="h-3.5 w-3.5" />
                        <span>Remind Me</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

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

          {/* Venue & Approximate Location Static Map */}
          <div id="venue-map-section" className="space-y-3 pt-2 border-t border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-400" />
                <h2 className="font-display text-lg font-bold text-white">
                  Venue & Approximate Location
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Approximate venue location in {event.city} with transit access points and
                directions.
              </p>
            </div>

            <VenueStaticMap
              venue={event.venue}
              city={event.city}
              address={event.address}
              category={event.category}
            />
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
                    onClick={() => {
                      if (!eventConcluded) setSelectedTierId(tier.id);
                    }}
                    className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                      eventConcluded
                        ? "opacity-60 cursor-not-allowed border-white/5 bg-white/[0.02]"
                        : isSelected
                          ? "border-amber-400 bg-amber-500/15 shadow-md ring-1 ring-amber-400/30 cursor-pointer"
                          : "border-white/10 bg-white/5 hover:border-white/20 cursor-pointer"
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
                        {eventConcluded
                          ? "Passes Concluded"
                          : `${tier.remaining} tickets available`}
                      </span>
                      <span
                        className={`font-semibold text-xs ${
                          eventConcluded
                            ? "text-slate-500"
                            : isSelected
                              ? "text-amber-300"
                              : "text-slate-500"
                        }`}
                      >
                        {eventConcluded ? "Closed" : isSelected ? "✓ Selected" : "Select"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Star-Rating & Attendee Feedback Component */}
          <div id="event-feedback-section" className="pt-2">
            <EventFeedbackRating
              event={event}
              currentUser={currentUser}
              userBookings={userBookings}
              onReviewSubmitted={onReviewSubmitted}
            />
          </div>
        </div>

        {/* Bottom Booking Action Bar */}
        <div className="border-t border-white/10 bg-slate-950/90 px-5 py-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400">
              {eventConcluded ? "Event Status: " : "Selected: "}
            </span>
            <span className="text-xs font-bold text-white">
              {eventConcluded
                ? `Concluded on ${event.displayDate}`
                : selectedTier?.name || "General Admission"}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-extrabold text-white">
                {eventConcluded
                  ? "Concluded"
                  : selectedTier?.price === 0
                    ? "FREE"
                    : `₹${(selectedTier?.price || event.price).toLocaleString("en-IN")}`}
              </span>
              <span className="text-xs text-slate-400">
                {eventConcluded ? "• Rating & feedback open" : "/ person (₹0 surcharge)"}
              </span>
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
            ) : eventConcluded ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                id="details-feedback-cta"
                onClick={() => {
                  const el = document.getElementById("event-feedback-section");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-md shadow-amber-500/25 hover:brightness-110 transition-all cursor-pointer"
              >
                <Star className="h-4 w-4 fill-slate-950 text-slate-950" />
                <span>Rate & Review Event</span>
              </motion.button>
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

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
};
