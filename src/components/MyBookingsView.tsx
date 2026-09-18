import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  QrCode,
  Printer,
  X,
  Compass,
  Search,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Booking } from "../types";

interface MyBookingsViewProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
  onExploreEvents: () => void;
  onViewEventDetails?: (eventId: string) => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  onCancelBooking,
  onExploreEvents,
  onViewEventDetails,
}) => {
  const [selectedPass, setSelectedPass] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "confirmed" | "cancelled">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;
  const totalTickets = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((acc, b) => acc + b.ticketQuantity, 0);
  const totalSpent = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((acc, b) => acc + b.totalAmount, 0);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    const matchesSearch =
      b.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.attendeeName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleConfirmCancel = () => {
    if (bookingToCancel) {
      onCancelBooking(bookingToCancel.id);
      setBookingToCancel(null);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 mb-2">
            <Ticket className="h-3.5 w-3.5 text-amber-400" />
            <span>EventSync Pass Portal</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
            My Bookings & Passes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access your confirmed event passes, review digital QR tickets, or manage bookings.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          id="my-bookings-explore-cta"
          onClick={onExploreEvents}
          className="flex items-center gap-2 self-start md:self-auto rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 transition-all cursor-pointer shadow-md shadow-amber-500/20"
        >
          <Compass className="h-4 w-4" />
          <span>Discover More Events</span>
        </motion.button>
      </div>

      {/* Stats Summary Bar */}
      {bookings.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <span className="text-xs font-semibold text-slate-400">Active Bookings</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl font-extrabold text-white">
                {confirmedCount}
              </span>
              <span className="text-xs text-emerald-400 font-bold">Confirmed</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <span className="text-xs font-semibold text-slate-400">Total Tickets</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl font-extrabold text-white">
                {totalTickets}
              </span>
              <span className="text-xs text-slate-400 font-medium">Attendee Passes</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <span className="text-xs font-semibold text-slate-400">Cancelled Passes</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl font-extrabold text-rose-400">
                {cancelledCount}
              </span>
              <span className="text-xs text-rose-300 font-semibold">Refunded</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <span className="text-xs font-semibold text-slate-400">Active Investment</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl font-extrabold text-amber-400">
                ₹{totalSpent.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-400 font-medium">INR</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search within bookings */}
      {bookings.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-white/10 backdrop-blur-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              id="bookings-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by event title, reference ID, or attendee..."
              className="w-full rounded-xl bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 border border-white/10 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Status:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setFilterStatus("all")}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === "all"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                All ({bookings.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("confirmed")}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === "confirmed"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Confirmed ({confirmedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("cancelled")}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === "cancelled"
                    ? "bg-rose-500 text-white font-bold"
                    : "bg-white/5 text-rose-400/90 hover:bg-white/10"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span>Cancelled ({cancelledCount})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List or Empty State */}
      {bookings.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 sm:p-12 text-center backdrop-blur-xl"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 mb-4 border border-amber-500/30">
            <Ticket className="h-8 w-8" />
          </div>
          <h2 className="font-display text-xl font-bold text-white">No Bookings Found Yet</h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-400 leading-relaxed">
            You haven't reserved any tickets yet. Explore our curated events catalog, pick an event
            you love, and your booking passes will appear right here!
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            id="empty-state-browse-btn"
            onClick={onExploreEvents}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all cursor-pointer"
          >
            <Compass className="h-4 w-4" />
            <span>Browse Upcoming Events</span>
          </motion.button>
        </motion.div>
      ) : filteredBookings.length === 0 ? (
        /* Filter Empty State */
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <p className="text-sm font-medium text-slate-300">
            No bookings match your current search or status filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("all");
            }}
            className="mt-3 text-xs font-bold text-amber-400 hover:underline cursor-pointer"
          >
            Reset Bookings Filter
          </button>
        </div>
      ) : (
        /* Bookings Cards Grid */
        <div className="mt-6 space-y-4">
          {filteredBookings.map((booking) => {
            const isCancelled = booking.status === "cancelled";
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                id={`booking-card-${booking.id}`}
                className={`overflow-hidden rounded-2xl border bg-slate-900/80 backdrop-blur-xl transition-all ${
                  isCancelled
                    ? "border-white/5 opacity-60"
                    : "border-white/10 hover:border-amber-400/40 hover:shadow-xl hover:shadow-black/40"
                }`}
              >
                <div className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  {/* Left: Image & Event info */}
                  <div className="flex items-start gap-4">
                    <div
                      onClick={() => onViewEventDetails?.(booking.eventId)}
                      className="cursor-pointer group/img shrink-0"
                      title="Click to view fresh event details link"
                    >
                      <img
                        src={booking.eventImage}
                        alt={booking.eventTitle}
                        className="h-20 w-24 sm:h-24 sm:w-32 rounded-xl object-cover border border-white/10 group-hover/img:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {booking.id}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            isCancelled
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {isCancelled ? (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span>Cancelled</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Confirmed</span>
                            </>
                          )}
                        </span>
                      </div>

                      <h3
                        onClick={() => onViewEventDetails?.(booking.eventId)}
                        className="font-display text-base sm:text-lg font-bold text-white line-clamp-1 cursor-pointer hover:text-amber-400 transition-colors"
                        title="Click to open detailed fresh event link"
                      >
                        {booking.eventTitle}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{booking.eventDate}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{booking.eventTime}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate max-w-[200px]">{booking.venue}</span>
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-slate-400">
                        Booked by <strong className="text-white">{booking.attendeeName}</strong> (
                        {booking.attendeeEmail}) • {booking.ticketQuantity} ×{" "}
                        {booking.ticketTierName}
                      </div>

                      {/* Selected Seats */}
                      {booking.selectedSeats && booking.selectedSeats.length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-semibold text-slate-400">Seats:</span>
                          {booking.selectedSeats.map((seat) => (
                            <span
                              key={seat}
                              className="rounded-md bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-300"
                            >
                              {seat}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Detailed Cancellation Info Banner */}
                      {isCancelled && (
                        <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-rose-200">
                            <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                            <span>Cancelled on {booking.cancelledAt || "Recently"}</span>
                          </div>
                          <p className="text-[11px] text-rose-300/80 leading-relaxed">
                            <strong>Reason:</strong>{" "}
                            {booking.cancellationReason || "Cancelled by attendee request."}
                          </p>
                          <p className="text-[11px] text-rose-300/80">
                            <strong>Refund:</strong>{" "}
                            {booking.refundStatus ||
                              "100% Refund credited to original payment method."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Pricing and Action Buttons */}
                  <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-white/10 gap-3 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        Total Amount
                      </span>
                      <span className="font-display text-lg sm:text-xl font-extrabold text-white">
                        {booking.totalAmount === 0
                          ? "FREE"
                          : `₹${booking.totalAmount.toLocaleString("en-IN")}`}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Booked: {booking.bookingDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCancelled && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            id={`view-pass-btn-${booking.id}`}
                            onClick={() => setSelectedPass(booking)}
                            className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
                          >
                            <QrCode className="h-3.5 w-3.5 text-amber-400" />
                            <span>Digital Pass</span>
                          </motion.button>

                          <button
                            id={`cancel-btn-${booking.id}`}
                            onClick={() => setBookingToCancel(booking)}
                            className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {isCancelled && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-rose-400 italic">Cancelled</span>
                          {onViewEventDetails && (
                            <button
                              id={`view-cancelled-event-${booking.id}`}
                              onClick={() => onViewEventDetails(booking.eventId)}
                              className="rounded-xl border border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/25 px-3 py-2 text-xs font-bold text-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Compass className="h-3.5 w-3.5 text-rose-300" />
                              <span>View Event Details</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Digital Pass Modal */}
      <AnimatePresence>
        {selectedPass && (
          <div
            data-lenis-prevent="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xl bg-slate-950/80 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-slate-900 border border-white/15 shadow-2xl text-white my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-amber-400" />
                  <h3 className="font-display text-sm font-bold text-white">
                    EventSync Digital Pass
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPass(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="relative rounded-2xl border-2 border-dashed border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 p-5 space-y-4 text-center">
                  {/* Perforation Notches */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-900 border-r-2 border-dashed border-amber-400/40" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-900 border-l-2 border-dashed border-amber-400/40" />

                  <div>
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      {selectedPass.id}
                    </span>
                    <h4 className="font-display text-lg font-extrabold text-white mt-3">
                      {selectedPass.eventTitle}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedPass.eventDate} • {selectedPass.eventTime}
                    </p>
                    <p className="text-xs text-slate-400">{selectedPass.venue}</p>
                  </div>

                  <div className="mx-auto my-2 flex h-40 w-40 items-center justify-center rounded-2xl bg-white p-3 shadow-inner">
                    <QrCode className="h-32 w-32 text-slate-950" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3 text-left">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-medium">
                        Attendee
                      </span>
                      <span className="font-bold text-white">{selectedPass.attendeeName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-medium">
                        Seats
                      </span>
                      <span className="font-bold text-white">
                        {selectedPass.ticketQuantity}x {selectedPass.ticketTierName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Ticket</span>
                  </button>
                  <button
                    onClick={() => setSelectedPass(null)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancellation Confirmation Dialog */}
      <AnimatePresence>
        {bookingToCancel && (
          <div
            data-lenis-prevent="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl text-center space-y-4 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-white">Cancel This Booking?</h3>
                <p className="text-xs text-slate-400">
                  Are you sure you want to cancel your reservation for{" "}
                  <strong className="text-white">{bookingToCancel.eventTitle}</strong> (
                  {bookingToCancel.id})? This will release your {bookingToCancel.ticketQuantity}{" "}
                  seat(s).
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  id="cancel-dialog-keep-btn"
                  onClick={() => setBookingToCancel(null)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  Keep Booking
                </button>
                <button
                  id="cancel-dialog-confirm-btn"
                  onClick={handleConfirmCancel}
                  className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-md shadow-rose-600/25 cursor-pointer"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};
