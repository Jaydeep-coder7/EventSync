import React from "react";
import { motion } from "motion/react";
import {
  QrCode,
  Printer,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  Download,
  Share2,
} from "lucide-react";
import { Booking } from "../types";

interface ScanAtEntryPassProps {
  booking: Booking;
  onPrint?: () => void;
  onShare?: () => void;
}

export const ScanAtEntryPass: React.FC<ScanAtEntryPassProps> = ({ booking, onPrint, onShare }) => {
  return (
    <div className="w-full space-y-4">
      {/* Physical Ticket Pass Container with Perforations */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border-2 border-dashed border-amber-400/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-5 sm:p-6 shadow-2xl shadow-black/80 text-white"
      >
        {/* Left & Right Perforation Notches */}
        <div className="pointer-events-none absolute -left-3.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-950 border-r-2 border-dashed border-amber-400/40" />
        <div className="pointer-events-none absolute -right-3.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-950 border-l-2 border-dashed border-amber-400/40" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Pass Activated
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-[11px] font-mono font-bold text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>{booking.id}</span>
          </div>
        </div>

        {/* Event Title & Details */}
        <div className="mt-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            {booking.eventCategory} Pass
          </span>
          <h3 className="font-display text-lg sm:text-xl font-extrabold text-white mt-0.5 line-clamp-1">
            {booking.eventTitle}
          </h3>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-amber-400" />
              <span>{booking.eventDate}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-400" />
              <span>{booking.eventTime}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1 mt-1">
            <MapPin className="h-3 w-3 text-slate-500" />
            <span className="truncate max-w-xs">
              {booking.venue}, {booking.city}
            </span>
          </p>
        </div>

        {/* QR Code with Scanner Reticle & 'Scan at Entry' Aesthetic */}
        <div className="my-5 relative flex flex-col items-center justify-center">
          {/* Outer Scanner Reticle Box */}
          <div className="relative p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            {/* Reticle Corner Marks */}
            <div className="absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-amber-400" />
            <div className="absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-amber-400" />
            <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-amber-400" />
            <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-amber-400" />

            {/* High Contrast QR Code Canvas */}
            <div className="relative flex h-36 w-36 sm:h-40 sm:w-40 items-center justify-center rounded-2xl bg-white p-3 shadow-inner">
              <QrCode className="h-32 w-32 sm:h-36 sm:w-36 text-slate-950" />

              {/* Animated Laser Scan Beam */}
              <motion.div
                animate={{ y: [0, 110, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-3 right-3 h-[2.5px] bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 shadow-[0_0_8px_#f59e0b] opacity-80 pointer-events-none"
              />
            </div>
          </div>

          {/* 'SCAN AT VENUE ENTRY' Pill */}
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-3.5 py-1 text-[11px] font-bold tracking-wider text-amber-300 shadow-sm uppercase"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span>Scan at Entry Gate</span>
          </motion.div>
        </div>

        {/* Perforated Divider Line with Scissors / Tear Graphic */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-dashed border-white/20" />
          <span className="absolute bg-slate-950 px-2 font-mono text-[9px] uppercase tracking-widest text-slate-500">
            Admission Stub
          </span>
        </div>

        {/* Attendee & Pass Specifications */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-3.5 rounded-2xl border border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Attendee
            </span>
            <span className="font-bold text-white block truncate mt-0.5">
              {booking.attendeeName}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {booking.attendeeEmail}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Pass Type
            </span>
            <span className="font-bold text-amber-300 block truncate mt-0.5">
              {booking.ticketQuantity}x {booking.ticketTierName}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold block">
              Total:{" "}
              {booking.totalAmount === 0
                ? "FREE PASS"
                : `₹${booking.totalAmount.toLocaleString("en-IN")}`}
            </span>
          </div>
        </div>

        {/* Admitted Member Passes */}
        {booking.selectedSeats && booking.selectedSeats.length > 0 && (
          <div className="mt-2.5 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs">
            <span className="text-amber-200/90 font-medium text-[11px] uppercase tracking-wider shrink-0">
              Admitted Member Passes ({booking.ticketQuantity})
            </span>
            <span className="font-mono font-bold text-amber-300 break-words text-left sm:text-right">
              {booking.selectedSeats.join(" • ")}
            </span>
          </div>
        )}

        {/* Zero Charges Transparency Stamp */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>₹0 Convenience & Verification Fee</span>
          </span>
          <span className="font-mono text-[10px] text-slate-500">EventSync Verified</span>
        </div>
      </motion.div>

      {/* Ticket Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrint || (() => window.print())}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Printer className="h-3.5 w-3.5 text-amber-400" />
          <span>Print Gate Pass</span>
        </button>

        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Share Pass"
          >
            <Share2 className="h-3.5 w-3.5 text-amber-400" />
            <span>Share</span>
          </button>
        )}
      </div>
    </div>
  );
};
