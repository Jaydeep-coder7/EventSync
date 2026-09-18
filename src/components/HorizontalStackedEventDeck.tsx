import React from "react";
import { EventItem } from "../types";
import { HorizontalEventCard } from "./HorizontalEventCard";

interface HorizontalStackedEventDeckProps {
  events: EventItem[];
  onViewDetails: (event: EventItem) => void;
  onBookNow: (event: EventItem) => void;
  favorites: string[];
  onToggleFavorite: (eventId: string) => void;
}

export const HorizontalStackedEventDeck: React.FC<HorizontalStackedEventDeckProps> = ({
  events,
  onViewDetails,
  onBookNow,
  favorites,
  onToggleFavorite,
}) => {
  return (
    <div className="relative w-full space-y-5 py-2">
      {/* Visual cue banner */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-semibold text-amber-300">Horizontal Event Cards</span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-400">
            Scroll down vertically through landscape event cards
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
          <span>{events.length} Events</span>
        </div>
      </div>

      {/* Cards Container: Pure vertical scroll of horizontal event cards */}
      <div className="flex flex-col gap-4 sm:gap-6 pb-12 w-full">
        {events.map((event, index) => (
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
    </div>
  );
};
