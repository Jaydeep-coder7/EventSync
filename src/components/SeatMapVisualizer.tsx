import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Sparkles,
  Info,
  RotateCcw,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { TicketTier } from '../types';

export interface SeatInfo {
  id: string; // e.g. "A-3"
  label: string; // e.g. "A3"
  row: string; // "A", "B", "C", "D", "E"
  number: number;
  tierId: string;
  tierName: string;
  isVip: boolean;
  price: number;
  isBooked: boolean;
}

interface SeatMapVisualizerProps {
  eventId: string;
  eventName: string;
  totalSeats: number;
  bookedSeats: number;
  currentTier: TicketTier;
  selectedSeats: string[]; // array of seat IDs like ["A-3", "A-4"]
  onSeatToggle: (seatId: string, seatLabel: string) => void;
  onClearSeats?: () => void;
  onSelectBestAvailable?: (count: number) => void;
  maxSeatsAllowed?: number;
}

const ROWS = [
  { row: 'A', name: 'Row A (VIP / Front Row)', isVip: true, seatsCount: 8 },
  { row: 'B', name: 'Row B (Premium Central)', isVip: false, isPremium: true, seatsCount: 8 },
  { row: 'C', name: 'Row C (Executive)', isVip: false, seatsCount: 8 },
  { row: 'D', name: 'Row D (Standard)', isVip: false, seatsCount: 8 },
  { row: 'E', name: 'Row E (Balcony / Terrace)', isVip: false, seatsCount: 8 },
];

export const SeatMapVisualizer: React.FC<SeatMapVisualizerProps> = ({
  eventId,
  eventName,
  totalSeats,
  bookedSeats,
  currentTier,
  selectedSeats,
  onSeatToggle,
  onClearSeats,
  onSelectBestAvailable,
  maxSeatsAllowed = 8,
}) => {
  // Compute deterministic layout of seats so occupied seats stay consistent per event
  const layout = useMemo(() => {
    // Generate deterministic seed from eventId string
    let hash = 0;
    for (let i = 0; i < eventId.length; i++) {
      hash = (hash << 5) - hash + eventId.charCodeAt(i);
      hash |= 0;
    }

    const rowsData: {
      row: string;
      name: string;
      isVip: boolean;
      isPremium?: boolean;
      seats: SeatInfo[];
    }[] = [];

    ROWS.forEach((r, rIdx) => {
      const seats: SeatInfo[] = [];
      for (let sNum = 1; sNum <= r.seatsCount; sNum++) {
        const id = `${r.row}-${sNum}`;
        const label = `${r.row}${sNum}`;

        // Deterministic pseudo-random booking ratio based on bookedSeats/totalSeats
        const bookingProbability = Math.min(0.65, Math.max(0.2, bookedSeats / Math.max(1, totalSeats)));
        const seatHash = Math.abs(Math.sin(hash + rIdx * 17 + sNum * 23));
        // Reserve some seats to look natural
        const isBooked = seatHash < bookingProbability && !(r.row === 'A' && (sNum === 3 || sNum === 4 || sNum === 5));

        seats.push({
          id,
          label,
          row: r.row,
          number: sNum,
          tierId: currentTier.id,
          tierName: r.isVip ? 'VIP Front Row' : r.isPremium ? 'Premium Tier' : 'Standard Tier',
          isVip: r.isVip,
          price: r.isVip ? Math.round(currentTier.price * 1.3) : currentTier.price,
          isBooked,
        });
      }
      rowsData.push({
        ...r,
        seats,
      });
    });

    return rowsData;
  }, [eventId, bookedSeats, totalSeats, currentTier]);

  // Flatten all available unbooked seats
  const availableSeats = useMemo(() => {
    const list: SeatInfo[] = [];
    layout.forEach((r) => {
      r.seats.forEach((s) => {
        if (!s.isBooked) list.push(s);
      });
    });
    return list;
  }, [layout]);

  // Quick auto-pick helper
  const handleAutoPick = (count: number) => {
    if (onSelectBestAvailable) {
      onSelectBestAvailable(count);
      return;
    }
    // Default fallback: pick first N available seats
    const toPick = availableSeats.slice(0, count);
    toPick.forEach((seat) => {
      if (!selectedSeats.includes(seat.id)) {
        onSeatToggle(seat.id, seat.label);
      }
    });
  };

  return (
    <div className="w-full space-y-4 rounded-3xl border border-white/10 bg-slate-950/80 p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
      {/* Header with Title and Quick Pick */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h4 className="font-display text-sm font-bold text-white tracking-wide uppercase">
              Interactive Auditorium Seat Map
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click available chairs to reserve your exact row and seat numbers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedSeats.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={onClearSeats}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
            </motion.button>
          )}

          <div className="flex items-center gap-1 rounded-xl bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-300">
            <Users className="h-3 w-3 text-amber-400" />
            <span>
              {selectedSeats.length} of {maxSeatsAllowed} Selected
            </span>
          </div>
        </div>
      </div>

      {/* Stage / Performance Screen Graphic Arc */}
      <div className="relative py-2 text-center">
        {/* Curved luminous stage banner */}
        <div className="relative mx-auto h-9 w-4/5 max-w-md overflow-hidden rounded-t-[100px] border-t-2 border-x-2 border-amber-400/60 bg-gradient-to-b from-amber-400/20 via-amber-400/5 to-transparent shadow-[0_-8px_25px_rgba(245,158,11,0.2)]">
          <div className="flex h-full items-center justify-center">
            <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-amber-300 drop-shadow">
              STAGE / SCREEN AREA
            </span>
          </div>
        </div>
        <p className="mt-1 text-[10px] font-medium text-slate-400">
          All eyes facing front stage • Immersive surround sound zone
        </p>
      </div>

      {/* Seating Layout Grid */}
      <div className="overflow-x-auto py-2 px-1 no-scrollbar">
        <div className="min-w-[420px] max-w-lg mx-auto space-y-3">
          {layout.map((rowItem) => (
            <div key={rowItem.row} className="flex items-center gap-3">
              {/* Row Label Left */}
              <div className="w-8 shrink-0 text-center">
                <span
                  className={`inline-block rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                    rowItem.isVip
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {rowItem.row}
                </span>
              </div>

              {/* Seats Row with Aisle in the middle */}
              <div className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2">
                {/* First half (Seats 1 to 4) */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {rowItem.seats.slice(0, 4).map((seat) => {
                    const isSelected = selectedSeats.includes(seat.id);
                    return (
                      <SeatButton
                        key={seat.id}
                        seat={seat}
                        isSelected={isSelected}
                        onToggle={() => onSeatToggle(seat.id, seat.label)}
                        disabled={seat.isBooked}
                      />
                    );
                  })}
                </div>

                {/* Central Walking Aisle */}
                <div className="w-5 sm:w-7 text-center">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600 select-none">
                    •
                  </span>
                </div>

                {/* Second half (Seats 5 to 8) */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {rowItem.seats.slice(4, 8).map((seat) => {
                    const isSelected = selectedSeats.includes(seat.id);
                    return (
                      <SeatButton
                        key={seat.id}
                        seat={seat}
                        isSelected={isSelected}
                        onToggle={() => onSeatToggle(seat.id, seat.label)}
                        disabled={seat.isBooked}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Row Label Right */}
              <div className="w-8 shrink-0 text-center">
                <span
                  className={`inline-block rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                    rowItem.isVip
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {rowItem.row}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-white/10 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-md border border-white/20 bg-white/10" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-md border border-amber-400 bg-gradient-to-br from-amber-400 to-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <span className="text-amber-300 font-semibold">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-md border border-white/5 bg-slate-900/60 text-slate-600 flex items-center justify-center text-[10px]">
            ✕
          </div>
          <span>Reserved / Sold</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-md border-2 border-amber-400/60 bg-amber-500/20" />
          <span className="text-amber-400">VIP Row A</span>
        </div>
      </div>

      {/* Selected Seats Chips Bar */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Chosen Seats ({selectedSeats.length})
            </span>
            {selectedSeats.length === 0 ? (
              <span className="text-xs text-amber-400/80 font-medium">
                Tap on any available chair above to choose your seats
              </span>
            ) : (
              <div className="flex flex-wrap gap-1.5 mt-1">
                <AnimatePresence>
                  {selectedSeats.map((sId) => {
                    const cleanLabel = sId.replace('-', '');
                    return (
                      <motion.span
                        key={sId}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-400/20 border border-amber-400/50 px-2 py-0.5 text-xs font-mono font-bold text-amber-300"
                      >
                        <span>{cleanLabel}</span>
                        <button
                          type="button"
                          onClick={() => onSeatToggle(sId, cleanLabel)}
                          className="hover:text-white transition-colors cursor-pointer"
                          title="Remove seat"
                        >
                          ×
                        </button>
                      </motion.span>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Quick 2-Seat or 4-Seat Selection */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="text-[10px] text-slate-400">Quick pick:</span>
            <button
              type="button"
              onClick={() => handleAutoPick(1)}
              className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold text-slate-200 hover:bg-white/20 transition-all cursor-pointer"
            >
              1 Seat
            </button>
            <button
              type="button"
              onClick={() => handleAutoPick(2)}
              className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold text-slate-200 hover:bg-white/20 transition-all cursor-pointer"
            >
              2 Seats
            </button>
            <button
              type="button"
              onClick={() => handleAutoPick(4)}
              className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold text-slate-200 hover:bg-white/20 transition-all cursor-pointer"
            >
              4 Seats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Seat Button Subcomponent with Chair Aesthetic
interface SeatButtonProps {
  seat: SeatInfo;
  isSelected: boolean;
  onToggle: () => void;
  disabled: boolean;
}

const SeatButton: React.FC<SeatButtonProps> = ({
  seat,
  isSelected,
  onToggle,
  disabled,
}) => {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.15, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      type="button"
      id={`seat-btn-${seat.id}`}
      onClick={onToggle}
      disabled={disabled}
      title={
        disabled
          ? `Seat ${seat.label} is already reserved`
          : `Select Seat ${seat.label} (${seat.isVip ? 'VIP' : 'Standard'})`
      }
      className={`relative flex flex-col items-center justify-center rounded-lg transition-all duration-150 select-none cursor-pointer ${
        disabled
          ? 'h-8 w-7 sm:h-9 sm:w-8 bg-slate-900/60 border border-white/5 text-slate-600 cursor-not-allowed opacity-50'
          : isSelected
          ? 'h-8 w-7 sm:h-9 sm:w-8 bg-gradient-to-b from-amber-400 to-yellow-500 border border-amber-300 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.6)] z-10'
          : seat.isVip
          ? 'h-8 w-7 sm:h-9 sm:w-8 bg-amber-500/10 border border-amber-400/40 text-amber-200 hover:bg-amber-500/20 hover:border-amber-400'
          : 'h-8 w-7 sm:h-9 sm:w-8 bg-white/5 border border-white/15 text-slate-300 hover:bg-white/15 hover:border-white/30'
      }`}
    >
      {/* Top Headrest cushion outline */}
      <span
        className={`absolute -top-1 h-1.5 w-4 sm:w-5 rounded-t-sm ${
          disabled
            ? 'bg-slate-800'
            : isSelected
            ? 'bg-amber-200'
            : seat.isVip
            ? 'bg-amber-400/60'
            : 'bg-white/20'
        }`}
      />

      {/* Seat Number or Status Icon */}
      {disabled ? (
        <span className="text-[9px] font-mono">✕</span>
      ) : isSelected ? (
        <Check className="h-3.5 w-3.5 stroke-[3]" />
      ) : (
        <span className="text-[10px] font-mono font-bold leading-none">
          {seat.number}
        </span>
      )}
    </motion.button>
  );
};
