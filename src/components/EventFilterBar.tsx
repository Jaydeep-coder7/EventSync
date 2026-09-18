import React from "react";
import { motion } from "motion/react";
import { Search, X, RotateCcw, Calendar, ArrowUpDown } from "lucide-react";
import {
  DateFilterOption,
  EventCategory,
  FilterState,
  PriceFilterOption,
  SortOption,
} from "../types";

interface EventFilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

const CATEGORIES: EventCategory[] = [
  "All",
  "Music",
  "Technology",
  "Food & Drink",
  "Arts & Theatre",
  "Sports & Fitness",
  "Business & Networking",
];

export const EventFilterBar: React.FC<EventFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const isFiltered =
    filters.searchQuery.trim() !== "" ||
    filters.category !== "All" ||
    filters.dateFilter !== "all" ||
    filters.priceFilter !== "all" ||
    filters.sortBy !== "featured" ||
    (filters.statusFilter && filters.statusFilter !== "all");

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-4 shadow-xl shadow-black/40 sm:p-5">
      {/* Top Row: Search Input and Sort Dropdown */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Live Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="filter-live-search"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search events by title, description, or venue..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-slate-400 focus:border-amber-400/60 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
          />
          {filters.searchQuery && (
            <button
              id="clear-search-btn"
              onClick={() => onFilterChange({ searchQuery: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="sort-events-select"
            className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 shrink-0"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-amber-400" />
            <span>Sort by:</span>
          </label>
          <select
            id="sort-events-select"
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as SortOption })}
            className="rounded-xl border border-white/10 bg-slate-900 py-2.5 px-3 text-xs font-semibold text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all cursor-pointer"
          >
            <option value="featured">Featured / Recommended</option>
            <option value="date-asc">Date: Soonest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Title: Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div
        data-lenis-prevent="true"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar overscroll-x-contain"
      >
        {CATEGORIES.map((cat) => {
          const isActive = filters.category === cat;
          return (
            <motion.button
              key={cat}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
              id={`filter-category-${cat.toLowerCase().replace(/[^a-z]/g, "")}`}
              onClick={() => onFilterChange({ category: cat })}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {cat}
            </motion.button>
          );
        })}
      </div>

      {/* Secondary Filters Bar: Date & Price & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold text-slate-400">Date:</span>
            <select
              id="filter-date-select"
              aria-label="Filter events by date"
              value={filters.dateFilter}
              onChange={(e) => onFilterChange({ dateFilter: e.target.value as DateFilterOption })}
              className="rounded-xl border border-white/10 bg-slate-900 py-1.5 px-2.5 text-xs font-medium text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="all">Any Date</option>
              <option value="today">Today Only</option>
              <option value="weekend">This Weekend</option>
              <option value="month">Next 30 Days</option>
            </select>
          </div>

          {/* Price Range Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-amber-400 text-xs">₹</span>
            <span className="font-semibold text-slate-400">Price:</span>
            <select
              id="filter-price-select"
              aria-label="Filter events by price"
              value={filters.priceFilter}
              onChange={(e) => onFilterChange({ priceFilter: e.target.value as PriceFilterOption })}
              className="rounded-xl border border-white/10 bg-slate-900 py-1.5 px-2.5 text-xs font-medium text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="all">All Prices</option>
              <option value="free">Free Events (₹0)</option>
              <option value="under1000">Under ₹1,000</option>
              <option value="1000to3000">₹1,000 to ₹3,000</option>
              <option value="above3000">Above ₹3,000</option>
            </select>
          </div>

          {/* Status Filter: Active vs Cancelled Events */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400">Status:</span>
            <div className="flex items-center rounded-xl bg-slate-900 border border-white/10 p-0.5">
              <button
                type="button"
                onClick={() => onFilterChange({ statusFilter: "all" })}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  (filters.statusFilter || "all") === "all"
                    ? "bg-amber-400 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => onFilterChange({ statusFilter: "active" })}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  filters.statusFilter === "active"
                    ? "bg-amber-400 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => onFilterChange({ statusFilter: "cancelled" })}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filters.statusFilter === "cancelled"
                    ? "bg-rose-500 text-white font-bold"
                    : "text-rose-400/80 hover:text-rose-300"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span>Cancelled</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter & Reset Button */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">
            Showing <strong className="text-white font-bold">{totalResults}</strong> event
            {totalResults === 1 ? "" : "s"}
          </span>

          {isFiltered && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              id="filter-reset-all-btn"
              onClick={onResetFilters}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3 py-1 font-semibold text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filters</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
