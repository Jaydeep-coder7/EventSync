import React, { useState } from "react";
import {
  X,
  BookOpen,
  CheckCircle2,
  Code2,
  Layers,
  Database,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Award,
} from "lucide-react";

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyReadmeSnippet = () => {
    const text = `# EventSync — Event Booking & Management Platform
Built for Infobharat Interns Web Development Task.

## 🚀 Features
- 🏠 Engaging Homepage with dynamic featured events and live search bar
- 🎫 Events Listing Page with multi-criteria filtering (Category, Date, Price) and Sorting
- 📄 Interactive Event Details with high-res image gallery and verified organizer profiles
- 📝 Robust Booking Module with real-time JavaScript validation and digital QR passes
- 👤 My Bookings Management with cancellation and LocalStorage persistence
- 🌐 Simulated API with loading skeletons and network error handling`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm bg-slate-900/60 overflow-y-auto">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl transition-all my-8 max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Project Documentation & Evaluation Guide
              </h2>
              <p className="text-[11px] text-slate-500">
                EventSync Event Booking & Management System — Infobharat Interns
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Overview */}
          <div className="rounded-2xl bg-amber-50/50 p-4 border border-amber-200/80">
            <h3 className="font-display font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-600" />
              <span>Project Summary & Objectives</span>
            </h3>
            <p className="text-slate-600">
              <strong>EventSync</strong> is an interactive, responsive web application designed for
              users to discover, search, inspect, and book tickets for live events. Built with clean
              semantic HTML5, modern CSS3 (Tailwind utility system), ES6+ TypeScript, DOM
              manipulation, and dynamic Fetch API integration with LocalStorage persistence.
            </p>
          </div>

          {/* Checklist of implemented requirements */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-slate-900 text-sm">
              Requirements Implementation Matrix
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>🏠 Home Page</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Logo, search banner by keyword/category, dynamically loaded featured events, and
                  explore/book CTAs.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>🎫 Events Listing</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Card grid with image, date, venue, category, price, seat bars. Live search,
                  category pills, date filter, price filter, and sorting.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>📄 Event Details</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Full descriptions, verified organizer, venue specs, interactive image gallery
                  thumbnails, ticket tier options, and direct booking trigger.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>📝 Booking Module</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Name, Email, Phone, and Ticket steppers. Strict JS validation (regex email &
                  10-digit phone), summary calculation, and digital QR ticket pass.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>👤 My Bookings</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  LocalStorage persistence, cancel reservation with confirmation, digital pass
                  view/print, and empty state CTA.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>🌐 API Integration</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Dynamic loading from{" "}
                  <code className="font-mono bg-white px-1">/data/events.json</code> via browser
                  Fetch API with simulated latency, skeletons, and error retry state.
                </p>
              </div>
            </div>
          </div>

          {/* Submission notes */}
          <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
            <h4 className="font-bold text-slate-900">Task Submission & Demonstration Checklist</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
              <li>
                <strong>GitHub Repository:</strong> Export files and commit complete project
                structure with README.md.
              </li>
              <li>
                <strong>Video Demonstration:</strong> Showcase Homepage, Events search & filters,
                Event Details, Booking flow with validation errors & confirmation, My Bookings
                cancel action, and mobile view.
              </li>
              <li>
                <strong>LinkedIn Post:</strong> Share learnings, screenshots, project highlights,
                tag <strong>Infobharat Interns</strong>.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={copyReadmeSnippet}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>{copied ? "Copied Readme!" : "Copy Summary"}</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
