import React from "react";
import { motion } from "motion/react";

interface EventCardSkeletonProps {
  count?: number;
}

export const EventCardSkeleton: React.FC = () => {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/30 shimmer-mask">
      {/* Top Banner Image Skeleton */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800/60">
        {/* Floating Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-20 rounded-xl bg-white/10" />
            <div className="h-6 w-16 rounded-xl bg-amber-500/20" />
          </div>
          <div className="h-8 w-8 rounded-xl bg-white/10" />
        </div>

        {/* Bottom Image Overlay Badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="h-6 w-24 rounded-xl bg-slate-950/70" />
          <div className="h-6 w-16 rounded-xl bg-slate-950/70" />
        </div>
      </div>

      {/* Card Body Skeleton */}
      <div className="flex flex-1 flex-col p-5 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 w-4/5 rounded-lg bg-white/15" />
          <div className="h-4 w-3/5 rounded-lg bg-white/10" />
        </div>

        {/* Description */}
        <div className="space-y-1.5 pt-1">
          <div className="h-3 w-full rounded bg-white/10" />
          <div className="h-3 w-5/6 rounded bg-white/5" />
        </div>

        {/* Venue & Time Details */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded bg-amber-400/30 shrink-0" />
            <div className="h-3 w-36 rounded bg-white/10" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded bg-slate-600 shrink-0" />
            <div className="h-3 w-28 rounded bg-white/10" />
          </div>
        </div>

        {/* Seat Availability Bar */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="h-3 w-16 rounded bg-white/10" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-2/3 rounded-full bg-amber-500/30" />
          </div>
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-2.5 w-16 rounded bg-white/10" />
            <div className="h-5 w-20 rounded-lg bg-amber-400/25" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 rounded-xl bg-white/10" />
            <div className="h-8 w-20 rounded-xl bg-gradient-to-r from-amber-500/40 to-yellow-400/40" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const EventGridSkeleton: React.FC<EventCardSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
};
