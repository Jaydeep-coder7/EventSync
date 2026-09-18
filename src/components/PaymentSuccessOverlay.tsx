import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface PaymentSuccessOverlayProps {
  amount: number;
  currencySymbol?: string;
  eventName: string;
  ticketCount: number;
  onComplete: () => void;
}

export const PaymentSuccessOverlay: React.FC<PaymentSuccessOverlayProps> = ({
  amount,
  currencySymbol = '₹',
  eventName,
  ticketCount,
  onComplete,
}) => {
  // Automatically trigger completion to show the QR pass after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative flex flex-col items-center justify-center p-6 sm:p-10 text-center text-white min-h-[420px]">
      {/* Background radial glow */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.8, 1.2, 1], opacity: [0.2, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"
      />

      {/* Ripple Rings */}
      <div className="relative mb-6 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ scale: [1, 1.6, 2], opacity: [0.8, 0.3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          className="absolute h-28 w-28 rounded-full border-2 border-emerald-400/40 pointer-events-none"
        />
        <motion.div
          initial={{ scale: 0.5, opacity: 0.6 }}
          animate={{ scale: [1, 1.4, 1.8], opacity: [0.6, 0.2, 0] }}
          transition={{ duration: 1.8, delay: 0.4, repeat: Infinity, ease: 'easeOut' }}
          className="absolute h-28 w-28 rounded-full border border-teal-300/30 pointer-events-none"
        />

        {/* Animated Checkmark Circle */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl shadow-emerald-500/30"
        >
          <svg className="h-12 w-12 text-slate-950" viewBox="0 0 52 52" fill="none">
            <motion.circle
              cx="26"
              cy="26"
              r="23"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
            <motion.path
              d="M15 27 L23 35 L37 19"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Payment Verified Title */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45 }}
        className="space-y-1.5"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Payment Authenticated & Approved</span>
        </div>

        <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {amount === 0 ? 'Pass Claimed Successfully!' : `${currencySymbol}${amount.toLocaleString('en-IN')} Paid!`}
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
          Reserved <span className="font-bold text-white">{ticketCount} {ticketCount > 1 ? 'tickets' : 'ticket'}</span> for{' '}
          <span className="font-bold text-amber-300">{eventName}</span>.
        </p>
      </motion.div>

      {/* Step Transition Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="mt-6 flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
        </motion.div>
        <span>Generating encrypted digital QR pass...</span>
      </motion.div>

      {/* Immediate Skip / Proceed Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onComplete}
        className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer"
      >
        <span>View Digital Pass Now</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </motion.button>
    </div>
  );
};
