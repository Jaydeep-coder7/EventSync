import React from "react";
import { Ticket, ShieldCheck, Sparkles, MapPin, QrCode } from "lucide-react";
import { EventCategory } from "../types";

interface FooterProps {
  onNavigateCategory: (category: EventCategory) => void;
  onNavigateTab: (tab: "home" | "events" | "bookings") => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateCategory, onNavigateTab }) => {
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-400 pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="space-y-4 md:pr-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-sm">
                <Ticket className="h-5 w-5 rotate-[-10deg]" />
              </div>
              <span className="font-display text-xl font-extrabold text-white tracking-tight">
                Event<span className="text-amber-400">Sync</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curating premier live concerts, technology conferences, comedy showcases, cultural
              galas, and stadium sports across India with instant digital QR passes.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5 text-amber-400/90 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Digital Passes
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <QrCode className="h-3.5 w-3.5" />
                Instant Entry
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigateTab("home")}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab("events")}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Browse All Events
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab("bookings")}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  My Booked Passes
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-white">
              Curated Categories
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              {(
                [
                  "Music",
                  "Technology",
                  "Food & Drink",
                  "Arts & Theatre",
                  "Sports & Fitness",
                  "Business & Networking",
                ] as EventCategory[]
              ).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onNavigateCategory(cat);
                    onNavigateTab("events");
                  }}
                  className="text-left hover:text-amber-400 transition-colors cursor-pointer truncate"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EventSync. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Verified Digital Gate Passes</span>
            <span>•</span>
            <span>Indian Rupee (₹) Pricing</span>
            <span>•</span>
            <span>Zero Booking Fees Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
