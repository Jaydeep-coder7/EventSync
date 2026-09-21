import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useSpring, type Variants } from "motion/react";
import {
  Compass,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Ticket,
  Search,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Zap,
  Loader2,
} from "lucide-react";
import {
  Booking,
  EventCategory,
  EventItem,
  FilterState,
  TicketTier,
  ToastNotification,
  UserProfile,
} from "./types";
import {
  fetchEvents,
  cancelBookingApi,
  fetchBackendStats,
  pingBackend,
  BackendStats,
} from "./services/api";
import {
  getStoredBookings,
  setStoredBookings,
  saveBooking,
  cancelBooking,
  getStoredFavorites,
  setStoredFavorites,
  toggleStoredFavorite,
} from "./utils/storage";
import { getApproachingReminders } from "./utils/reminderStorage";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { EventCard, cardGridVariants } from "./components/EventCard";
import { EventCardSkeleton, EventGridSkeleton } from "./components/EventCardSkeleton";
import { EventFilterBar } from "./components/EventFilterBar";
import { HorizontalSellingFastFeed } from "./components/HorizontalSellingFastFeed";
import { EventDetailsModal } from "./components/EventDetailsModal";
import { BookingModal } from "./components/BookingModal";
import { MyBookingsView } from "./components/MyBookingsView";
import { AuthModal } from "./components/AuthModal";
import { ResetPasswordModal } from "./components/ResetPasswordModal";
import { UserProfileModal } from "./components/UserProfileModal";
import { Footer } from "./components/Footer";
import { ToastContainer } from "./components/ToastContainer";
import { SmoothScrollContainer } from "./components/SmoothScrollContainer";
import { FluidParticlesBackground } from "./components/ui/fluid-particles";
import { supabase, supabaseUserToUserProfile } from "./lib/supabase";

const INITIAL_FILTERS: FilterState = {
  searchQuery: "",
  category: "All",
  dateFilter: "all",
  priceFilter: "all",
  sortBy: "featured",
  statusFilter: "all",
};

// Satisfying Scroll Animation Variants
const slideInVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

const scaleUpVariant: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function App() {
  // Smooth scroll progress physics for satisfied scrolling experience
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Theme Management (Light or Dark Mode)
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return (localStorage.getItem("eventsync_theme") as "dark" | "light") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("eventsync_theme", theme);
  }, [theme]);

  // Authentication & Session Loading State (Supabase session is the ONLY source of truth)
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Movie-like Lenis smooth scroll to top helper
  const smoothScrollToTop = () => {
    const lenis = typeof window !== "undefined" ? window.__LENIS__ : undefined;
    if (lenis) {
      lenis.scrollTo(0, {
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState<boolean>(false);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [pendingBookingEvent, setPendingBookingEvent] = useState<{
    event: EventItem;
    tier?: TicketTier;
  } | null>(null);

  // Navigation
  const [activeTab, setActiveTab] = useState<"home" | "events" | "bookings">("home");

  // Events & API State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Backend Health & Stats
  const [backendOnline, setBackendOnline] = useState(true);
  const [backendLatency, setBackendLatency] = useState(8);
  const [backendStats, setBackendStats] = useState<BackendStats | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Modals
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<EventItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [selectedEventForBooking, setSelectedEventForBooking] = useState<EventItem | null>(null);
  const [preselectedTier, setPreselectedTier] = useState<TicketTier | undefined>(undefined);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // LocalStorage state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (type: "success" | "error" | "info", title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth & Profile Handlers
  const handleLoginSuccess = (newUser: UserProfile, isNewAccount = false) => {
    setUser(newUser);
    try {
      localStorage.setItem("eventsync_user_profile", JSON.stringify(newUser));
    } catch {
      // Ignore localStorage write errors
    }
    setIsAuthModalOpen(false);
    if (isNewAccount) {
      addToast("success", "Welcome to EventSync!", `Welcome to EventSync, ${newUser.name}!`);
    } else {
      addToast("success", "Welcome Back!", `Welcome back, ${newUser.name}!`);
    }

    // If there was a pending booking, trigger it now
    if (pendingBookingEvent) {
      handleBookNow(pendingBookingEvent.event, pendingBookingEvent.tier);
      setPendingBookingEvent(null);
    }
  };

  const handleUpdateProfile = async (updatedUser: UserProfile) => {
    setUser(updatedUser);
    try {
      localStorage.setItem("eventsync_user_profile", JSON.stringify(updatedUser));
    } catch {
      // Ignore localStorage errors
    }
    try {
      await supabase.auth.updateUser({
        data: {
          name: updatedUser.name,
          full_name: updatedUser.name,
          phone: updatedUser.phone,
          gender: updatedUser.gender,
          avatar: updatedUser.avatar,
        },
      });
    } catch (err) {
      console.warn("Supabase updateUser warning:", err);
    }
    addToast(
      "success",
      "Profile Updated",
      "Your user information and preferences have been saved.",
    );
  };

  const handleExit = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase signOut notice:", err);
    }
    try {
      localStorage.removeItem("eventsync_user_profile");
    } catch {
      // Ignore localStorage errors
    }
    setUser(null);
    setBookings([]);
    setFavorites([]);
    setIsProfileModalOpen(false);
    setIsBookingOpen(false);
    setIsDetailsOpen(false);
    setIsAuthModalOpen(false);
    setActiveTab("home");

    // Clear history state to prevent back navigation into protected views
    if (typeof window !== "undefined" && window.history?.replaceState) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    try {
      localStorage.removeItem("eventsync_user");
      localStorage.removeItem("eventhive_user");
      localStorage.removeItem("eventsync_registered_accounts");
    } catch {
      // ignore
    }

    addToast("info", "Logged Out", "You have signed out from EventSync.");
  };

  const handleShareApp = async () => {
    const shareData = {
      title: "EventSync — Curated Live Experiences & Digital Passes",
      text: "Discover and book concerts, tech summits, and festivals across India with zero convenience fees on EventSync!",
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        addToast("success", "Shared Successfully", "Thanks for sharing EventSync!");
        return;
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === "AbortError") return;
      }
    }

    // Fallback: clipboard copy
    navigator.clipboard.writeText(window.location.href);
    addToast("success", "Link Copied", "EventSync website link copied to clipboard!");
  };

  // Load Platform Stats & Ping
  const checkBackendStatus = async () => {
    const ping = await pingBackend();
    setBackendOnline(ping.ok);
    if (ping.ok) setBackendLatency(ping.latencyMs);

    const stats = await fetchBackendStats();
    if (stats) setBackendStats(stats);
  };

  // Initial Load from API & Storage
  const loadEventsData = async (simulateFailure = false) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await fetchEvents({ simulateError: simulateFailure, delayMs: 400 });
      setEvents(data);
      checkBackendStatus();
    } catch (err: unknown) {
      setApiError((err as Error)?.message || "Failed to load events, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setFavorites([]);
      return;
    }
    loadEventsData();

    // 1. Instantly load local bookings and favorites scoped to this specific user's email
    const localBookings = getStoredBookings(user.email);
    const localFavorites = getStoredFavorites(user.email);
    setBookings(localBookings);
    setFavorites(localFavorites);

    // 2. Sync with Supabase Auth cloud metadata to retrieve previous bookings
    // even after days, months, or years from any browser/device
    supabase.auth
      .getUser()
      .then(({ data }) => {
        const cloudUser = data?.user;
        if (!cloudUser) return;

        const cloudBookings = cloudUser.user_metadata?.bookings;
        const cloudFavorites = cloudUser.user_metadata?.favorites;

        if (Array.isArray(cloudBookings) && cloudBookings.length > 0) {
          setStoredBookings(cloudBookings, user.email);
          setBookings(cloudBookings);
        } else if (localBookings.length > 0) {
          // Sync existing local bookings up to Supabase cloud metadata
          supabase.auth
            .updateUser({
              data: { bookings: localBookings },
            })
            .catch(() => {});
        }

        if (Array.isArray(cloudFavorites) && cloudFavorites.length > 0) {
          setStoredFavorites(cloudFavorites, user.email);
          setFavorites(cloudFavorites);
        } else if (localFavorites.length > 0) {
          supabase.auth
            .updateUser({
              data: { favorites: localFavorites },
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        console.warn("Notice syncing cloud user_metadata:", err);
      });

    const interval = setInterval(() => {
      checkBackendStatus();
    }, 25000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Listen for Supabase Authentication state changes & persist session
  useEffect(() => {
    let isMounted = true;

    // Check for authentication callback notices or errors in URL params
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const errorDesc =
        searchParams.get("error_description") ||
        hashParams.get("error_description") ||
        searchParams.get("error") ||
        hashParams.get("error");

      if (errorDesc) {
        addToast(
          "error",
          "Authentication Notice",
          decodeURIComponent(errorDesc).replace(/\+/g, " "),
        );
        window.history.replaceState(null, "", window.location.pathname);
      }
    }

    // 1. Check existing active session from Supabase on mount
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.warn("Supabase getSession notice:", error);
          try {
            const saved = localStorage.getItem("eventsync_user_profile");
            setUser(saved ? JSON.parse(saved) : null);
          } catch {
            setUser(null);
          }
        } else if (session?.user) {
          const profile = supabaseUserToUserProfile(session.user);
          setUser(profile);
          try {
            localStorage.setItem("eventsync_user_profile", JSON.stringify(profile));
          } catch {
            // Ignore
          }
        } else {
          try {
            const saved = localStorage.getItem("eventsync_user_profile");
            setUser(saved ? JSON.parse(saved) : null);
          } catch {
            setUser(null);
          }
        }
        setIsCheckingAuth(false);
      })
      .catch((err) => {
        console.warn("Notice retrieving Supabase session:", err);
        if (isMounted) {
          try {
            const saved = localStorage.getItem("eventsync_user_profile");
            setUser(saved ? JSON.parse(saved) : null);
          } catch {
            setUser(null);
          }
          setIsCheckingAuth(false);
        }
      });

    // Check if URL hash contains password recovery tokens
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      if (hash.includes("type=recovery") || hash.includes("access_token=")) {
        setIsResetPasswordOpen(true);
      }
    }

    // 2. Subscribe to real-time auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "PASSWORD_RECOVERY") {
        setIsResetPasswordOpen(true);
      }
      if (session?.user) {
        const profile = supabaseUserToUserProfile(session.user);
        setUser(profile);
      } else {
        setUser(null);
      }
      setIsCheckingAuth(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Prevent browser back navigation from returning to protected content when logged out
  useEffect(() => {
    if (!user && !isCheckingAuth) {
      if (typeof window !== "undefined" && window.history?.pushState) {
        window.history.pushState(null, "", window.location.href);
        const handlePopState = () => {
          window.history.pushState(null, "", window.location.href);
        };
        window.addEventListener("popstate", handlePopState);
        return () => {
          window.removeEventListener("popstate", handlePopState);
        };
      }
    }
  }, [user, isCheckingAuth]);

  // Check approaching event reminders and trigger toast notification alerts
  useEffect(() => {
    if (events.length === 0) return;
    try {
      const alreadyChecked = sessionStorage.getItem("eventsync_reminders_toast_shown");
      if (alreadyChecked) return;

      const approachingList = getApproachingReminders(events);
      if (approachingList.length > 0) {
        sessionStorage.setItem("eventsync_reminders_toast_shown", "true");
        // Alert for upcoming approaching events
        approachingList.slice(0, 2).forEach((item, index) => {
          setTimeout(
            () => {
              addToast(
                "info",
                "Upcoming Event Alert ⏰",
                `Reminder: "${item.reminder.eventTitle}" is ${item.label} (${item.reminder.displayDate}) at ${item.reminder.venue}, ${item.reminder.city}!`,
              );
            },
            1800 + index * 1200,
          );
        });
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, [events]);

  // Filter and Sort Engine (Live filtering without page reload)
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // 1. Text Search Filter (title, description, venue, city)
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.shortDescription.toLowerCase().includes(query) ||
          event.venue.toLowerCase().includes(query) ||
          event.city.toLowerCase().includes(query) ||
          event.category.toLowerCase().includes(query),
      );
    }

    // 2. Category Filter
    if (filters.category !== "All") {
      result = result.filter((event) => event.category === filters.category);
    }

    // 3. Price Filter (INR ₹)
    if (filters.priceFilter !== "all") {
      if (filters.priceFilter === "free") {
        result = result.filter((event) => event.price === 0);
      } else if (filters.priceFilter === "under1000") {
        result = result.filter((event) => event.price > 0 && event.price < 1000);
      } else if (filters.priceFilter === "1000to3000") {
        result = result.filter((event) => event.price >= 1000 && event.price <= 3000);
      } else if (filters.priceFilter === "above3000") {
        result = result.filter((event) => event.price > 3000);
      }
    }

    // 4. Date Filter
    if (filters.dateFilter !== "all") {
      const now = new Date();
      if (filters.dateFilter === "today") {
        const todayStr = now.toISOString().split("T")[0];
        result = result.filter((e) => e.date === todayStr);
      } else if (filters.dateFilter === "weekend") {
        result = result.filter((e) => {
          const d = new Date(e.date);
          const day = d.getDay();
          return day === 0 || day === 6; // Sunday or Saturday
        });
      } else if (filters.dateFilter === "month") {
        const nextMonth = new Date();
        nextMonth.setDate(now.getDate() + 30);
        result = result.filter((e) => {
          const d = new Date(e.date);
          return d >= now && d <= nextMonth;
        });
      }
    }

    // 4.5 Status Filter (All vs Active vs Cancelled Events)
    if (filters.statusFilter === "cancelled") {
      result = result.filter((event) => event.isCancelled === true);
    } else if (filters.statusFilter === "active") {
      result = result.filter((event) => !event.isCancelled);
    }

    // 5. Sorting
    if (filters.sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === "date-asc") {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (filters.sortBy === "name-asc") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [events, filters]);

  // Featured and high-demand events for the horizontal reel ("scroll like hell")
  const featuredEvents = useMemo(() => {
    // Sort all events by booking velocity / demand and rating
    const sorted = [...events].sort((a, b) => {
      const aDemand = (a.bookedSeats / a.totalSeats) * 2 + a.rating / 5;
      const bDemand = (b.bookedSeats / b.totalSeats) * 2 + b.rating / 5;
      return bDemand - aDemand;
    });
    return sorted;
  }, [events]);

  // Handlers
  const handleHeroSearch = (query: string, category: EventCategory) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: query,
      category,
    }));
    setActiveTab("events");
    smoothScrollToTop();
  };

  const handleFilterUpdate = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    addToast("info", "Filters Reset", "Showing all available events.");
  };

  const handleViewDetails = (event: EventItem) => {
    setSelectedEventForDetails(event);
    setIsDetailsOpen(true);
  };

  const handleBookNow = (event: EventItem, preTier?: TicketTier) => {
    // If not logged in with Gmail, prompt login first
    if (!user) {
      setPendingBookingEvent({ event, tier: preTier });
      setIsAuthModalOpen(true);
      addToast("info", "Login Required", "Please sign in with Gmail to book tickets.");
      return;
    }

    setSelectedEventForBooking(event);
    setPreselectedTier(preTier);
    setIsDetailsOpen(false);
    setIsBookingOpen(true);
  };

  const handleBookingConfirmed = (newBooking: Booking, updatedEvent?: EventItem) => {
    const updated = saveBooking(newBooking, user?.email);
    setBookings(updated);

    // Sync to Supabase user_metadata for cloud persistence across devices & sessions
    if (user?.email) {
      supabase.auth
        .updateUser({
          data: { bookings: updated },
        })
        .catch((err) => {
          console.warn("Supabase user_metadata bookings sync notice:", err);
        });
    }

    // Update booked seats count in event list state
    if (updatedEvent) {
      setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
    } else {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === newBooking.eventId
            ? {
                ...e,
                bookedSeats: Math.min(e.totalSeats, e.bookedSeats + newBooking.ticketQuantity),
              }
            : e,
        ),
      );
    }

    checkBackendStatus();

    addToast(
      "success",
      "Booking Confirmed!",
      `Reference: ${newBooking.id}. Digital pass generated.`,
    );
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await cancelBookingApi(bookingId);
      if (res.updatedEvent) {
        setEvents((prev) =>
          prev.map((e) => (e.id === res.updatedEvent!.id ? res.updatedEvent! : e)),
        );
      }
    } catch (err) {
      console.warn("Backend cancel call skipped/failed, updating client state:", err);
    }

    const updated = cancelBooking(bookingId, user?.email);
    setBookings(updated);

    // Sync cancelled status to Supabase user_metadata
    if (user?.email) {
      supabase.auth
        .updateUser({
          data: { bookings: updated },
        })
        .catch((err) => {
          console.warn("Supabase user_metadata cancel sync notice:", err);
        });
    }

    checkBackendStatus();
    addToast("info", "Booking Cancelled", "Your ticket reservation has been cancelled.");
  };

  const handleToggleFavorite = (eventId: string) => {
    const updated = toggleStoredFavorite(eventId, user?.email);
    setFavorites(updated);

    // Sync favorites to Supabase user_metadata
    if (user?.email) {
      supabase.auth
        .updateUser({
          data: { favorites: updated },
        })
        .catch((err) => {
          console.warn("Supabase user_metadata favorites sync notice:", err);
        });
    }

    const isFav = updated.includes(eventId);
    addToast(
      "info",
      isFav ? "Added to Saved Events" : "Removed from Saved Events",
      isFav ? "Find this easily later." : undefined,
    );
  };

  // 1. Initial Authentication Check Screen - Prevents any flash of protected content
  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-slate-950 text-white select-none">
        <div className="relative flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 shadow-xl shadow-amber-500/25 mb-4 animate-bounce">
            <Ticket className="h-8 w-8 rotate-[-12deg]" />
          </div>
          <div className="flex items-center gap-2.5 text-sm font-semibold tracking-wide text-slate-200">
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
            <span>Loading EventSync...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Strict Authentication Gate - Hides entire application when unauthenticated
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-slate-950 relative flex items-center justify-center overflow-hidden">
        {/* Bundui Fluid Particles Background */}
        <FluidParticlesBackground
          className="fixed inset-0 pointer-events-none z-[2]"
          particleCount={450}
          particleOpacity={0.75}
          interactive={true}
          connectParticles={true}
          showTrails={true}
        />

        {/* Ambient atmospheric lighting */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />

        <AuthModal isOpen={true} forceLogin={true} onLoginSuccess={handleLoginSuccess} />

        {/* Global Toast Notifications */}
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  return (
    <SmoothScrollContainer>
      <div
        className={`eventsync-shell flex min-h-screen flex-col transition-colors duration-300 ${
          theme === "light"
            ? "bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950"
            : "bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950"
        } font-sans relative`}
      >
        {/* Bundui Fluid Particles Interactive Background */}
        <FluidParticlesBackground
          className="fixed inset-0 pointer-events-none z-[2]"
          particleCount={450}
          particleOpacity={0.75}
          interactive={true}
          connectParticles={true}
          showTrails={true}
        />

        {/* Satisfying Smooth Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 origin-left z-50 pointer-events-none shadow-[0_0_12px_rgba(245,158,11,0.6)]"
          style={{ scaleX }}
        />

        {/* Top Navigation */}
        <Navbar
          activeTab={activeTab}
          onNavigate={(tab) => {
            setActiveTab(tab);
            smoothScrollToTop();
          }}
          bookingCount={bookings.filter((b) => b.status === "confirmed").length}
          user={user}
          onExit={handleExit}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Main View Router with Animated Tab Transitions */}
        <main className="flex-1 relative z-10">
          <AnimatePresence mode="wait">
            {/* ==================================================== */}
            {/* TAB 1: HOME PAGE */}
            {/* ==================================================== */}
            {activeTab === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-16 pb-20"
              >
                {/* Hero Section with Search Bar */}
                <Hero
                  onSearchSubmit={handleHeroSearch}
                  onExploreClick={() => {
                    setActiveTab("events");
                    smoothScrollToTop();
                  }}
                  onBookFeaturedClick={() => {
                    const featured = events.find((e) => e.tag === "Featured") || events[0];
                    if (featured) handleBookNow(featured);
                  }}
                  stats={
                    backendStats
                      ? {
                          totalEvents: backendStats.totalEvents,
                          activeBookingsCount: backendStats.activeBookingsCount,
                          totalTicketsSold: backendStats.totalTicketsSold,
                          totalAvailableSeats: backendStats.totalAvailableSeats,
                        }
                      : null
                  }
                />

                {/* Featured & Selling Fast Section - Horizontal Cards Scrolling Vertically */}
                <motion.section
                  variants={slideInVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8"
                >
                  {isLoading ? (
                    <div className="py-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <EventCardSkeleton />
                      <EventCardSkeleton />
                    </div>
                  ) : (
                    <HorizontalSellingFastFeed
                      events={featuredEvents}
                      onViewDetails={handleViewDetails}
                      onBookNow={handleBookNow}
                      favorites={favorites}
                      onToggleFavorite={handleToggleFavorite}
                      onSeeAll={() => {
                        setActiveTab("events");
                        smoothScrollToTop();
                      }}
                    />
                  )}
                </motion.section>

                {/* Categories Bento Grid Section with Scale-Up Scroll Reveal */}
                <motion.section
                  variants={scaleUpVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4"
                >
                  <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-amber-500/[0.04] p-6 sm:p-10 backdrop-blur-xl">
                    <div className="text-center max-w-2xl mx-auto mb-8">
                      <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                        Explore by Category
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-extrabold mt-1">
                        Find What Excites You
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-2">
                        Filter events across 6 distinct categories with instantaneous client-side
                        filtering.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                      {(
                        [
                          {
                            name: "Music",
                            count: "4 Events",
                            color: "from-rose-500/20 to-pink-500/10",
                          },
                          {
                            name: "Technology",
                            count: "3 Events",
                            color: "from-blue-500/20 to-cyan-500/10",
                          },
                          {
                            name: "Food & Drink",
                            count: "2 Events",
                            color: "from-amber-500/20 to-yellow-500/10",
                          },
                          {
                            name: "Arts & Theatre",
                            count: "2 Events",
                            color: "from-purple-500/20 to-indigo-500/10",
                          },
                          {
                            name: "Sports & Fitness",
                            count: "2 Events",
                            color: "from-emerald-500/20 to-teal-500/10",
                          },
                          {
                            name: "Business & Networking",
                            count: "3 Events",
                            color: "from-slate-500/20 to-zinc-500/10",
                          },
                        ] as const
                      ).map((cat) => (
                        <motion.button
                          key={cat.name}
                          whileHover={{ y: -4, scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            setFilters((prev) => ({
                              ...prev,
                              category: cat.name as EventCategory,
                            }));
                            setActiveTab("events");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-white/10 bg-gradient-to-b ${cat.color} hover:border-amber-400/50 transition-all cursor-pointer text-center group shadow-md shadow-black/20`}
                        >
                          <span className="font-display text-xs sm:text-sm font-bold group-hover:text-amber-300 transition-colors">
                            {cat.name}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-1">{cat.count}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.section>

                {/* Instant Trust & Features Section with Slide-in Scroll Reveal */}
                <motion.section
                  variants={slideInVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 mb-4 border border-amber-500/20">
                        <Zap className="h-6 w-6" />
                      </div>
                      <h4 className="font-display text-lg font-bold">
                        Instant Seat Synchronization
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Every ticket reserved is broadcast in real time across attendees. Never
                        worry about double bookings or outdated availability.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 mb-4 border border-amber-500/20">
                        <Ticket className="h-6 w-6" />
                      </div>
                      <h4 className="font-display text-lg font-bold">
                        Cryptographic Digital Passes
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Receive an instant printable QR gate pass. Scan seamlessly at venue entry
                        points directly from your mobile screen.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 mb-4 border border-amber-500/20">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <h4 className="font-display text-lg font-bold">
                        Zero Hidden Convenience Surcharges
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        All prices are denominated transparently in Indian Rupees (₹) with ₹0
                        convenience fee and ₹0 verification surcharge.
                      </p>
                    </div>
                  </div>
                </motion.section>
              </motion.div>
            )}

            {/* ==================================================== */}
            {/* TAB 2: EVENTS LISTING & LIVE FILTERING PAGE */}
            {/* ==================================================== */}
            {activeTab === "events" && (
              <motion.section
                key="events"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6"
              >
                {/* Header Title with Slide-in */}
                <motion.div variants={slideInVariant} initial="hidden" animate="visible">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 mb-2">
                    <Compass className="h-3.5 w-3.5 text-amber-400" />
                    <span>Discover & Filter</span>
                  </div>
                  <h1 className="font-display text-3xl font-extrabold tracking-tight">
                    All Live Events
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Instant live filtering by title, category, date, and price range in Indian
                    Rupees (₹) with zero surcharges.
                  </p>
                </motion.div>

                {/* Interactive Live Filter Bar */}
                <EventFilterBar
                  filters={filters}
                  onFilterChange={handleFilterUpdate}
                  onResetFilters={handleResetFilters}
                  totalResults={filteredEvents.length}
                />

                {/* Shimmering Gradient Skeleton Screens */}
                {isLoading && <EventGridSkeleton count={8} />}

                {/* API Error State */}
                {apiError && !isLoading && (
                  <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8 text-center space-y-3">
                    <AlertCircle className="mx-auto h-10 w-10 text-rose-400" />
                    <h3 className="font-display text-lg font-bold text-rose-200">
                      Failed to load events, please try again
                    </h3>
                    <p className="text-xs text-rose-300 max-w-md mx-auto">{apiError}</p>
                    <button
                      onClick={() => loadEventsData(false)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-md transition-all cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Retry Fetching Events</span>
                    </button>
                  </div>
                )}

                {/* Empty Search Results State */}
                {!isLoading && !apiError && filteredEvents.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5 p-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-slate-400 mb-3">
                      <Search className="h-7 w-7" />
                    </div>
                    <h3 className="font-display text-lg font-bold">No Matching Events Found</h3>
                    <p className="mt-1 max-w-md text-xs text-slate-400">
                      We couldn't find any events matching your search or filter combination. Try
                      adjusting the keyword, clearing price filters, or switching categories.
                    </p>
                    <button
                      id="empty-results-reset-btn"
                      onClick={handleResetFilters}
                      className="mt-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}

                {/* Cancelled events quick toggle reminder */}
                {!isLoading &&
                  !apiError &&
                  filteredEvents.length > 0 &&
                  events.some((e) => e.isCancelled) && (
                    <div className="flex justify-end">
                      <button
                        id="cancelled-events-pill-toggle"
                        onClick={() =>
                          handleFilterUpdate({
                            statusFilter:
                              filters.statusFilter === "cancelled" ? "all" : "cancelled",
                          })
                        }
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                          filters.statusFilter === "cancelled"
                            ? "border-rose-500 bg-rose-500 text-white font-bold"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                        <span>
                          {filters.statusFilter === "cancelled"
                            ? "Showing Cancelled Only (Click to show all)"
                            : `View Cancelled Events (${events.filter((e) => e.isCancelled).length})`}
                        </span>
                      </button>
                    </div>
                  )}

                {/* Events Showcase: Multi-column Grid */}
                {!isLoading && !apiError && filteredEvents.length > 0 && (
                  <motion.div
                    key={`${filters.category}-${filters.sortBy}-${filters.priceFilter}-${filters.dateFilter}-${filters.searchQuery}-${filters.statusFilter}`}
                    variants={cardGridVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  >
                    {filteredEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onViewDetails={handleViewDetails}
                        onBookNow={handleBookNow}
                        isFavorite={favorites.includes(event.id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.section>
            )}

            {/* ==================================================== */}
            {/* TAB 3: MY BOOKINGS PAGE */}
            {/* ==================================================== */}
            {activeTab === "bookings" && (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <MyBookingsView
                  bookings={bookings}
                  onCancelBooking={handleCancelBooking}
                  onViewEventDetails={(eventId) => {
                    const ev = events.find((e) => e.id === eventId);
                    if (ev) {
                      handleViewDetails(ev);
                    }
                  }}
                  onExploreEvents={() => {
                    setActiveTab("events");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Global Modals with AnimatePresence */}
        <AnimatePresence>
          {isDetailsOpen && selectedEventForDetails && (
            <EventDetailsModal
              event={selectedEventForDetails}
              isOpen={isDetailsOpen}
              onClose={() => setIsDetailsOpen(false)}
              onProceedToBook={handleBookNow}
              isFavorite={favorites.includes(selectedEventForDetails.id)}
              onToggleFavorite={handleToggleFavorite}
              currentUser={user}
              userBookings={bookings}
              onAddToast={addToast}
              onReviewSubmitted={(newReview) => {
                setEvents((prev) =>
                  prev.map((e) => {
                    if (e.id === newReview.eventId) {
                      const prevCount = e.reviewCount || 0;
                      const prevRating = e.rating || 4.8;
                      const updatedCount = prevCount + 1;
                      const updatedRating = Number(
                        ((prevRating * prevCount + newReview.rating) / updatedCount).toFixed(2),
                      );
                      const updatedEvent = {
                        ...e,
                        rating: updatedRating,
                        reviewCount: updatedCount,
                      };
                      if (selectedEventForDetails?.id === e.id) {
                        setSelectedEventForDetails(updatedEvent);
                      }
                      return updatedEvent;
                    }
                    return e;
                  }),
                );
                addToast(
                  "success",
                  "Review Published!",
                  `Your ${newReview.rating}★ rating has been recorded for this event.`,
                );
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isBookingOpen && selectedEventForBooking && (
            <BookingModal
              isOpen={isBookingOpen}
              event={selectedEventForBooking}
              initialTier={preselectedTier}
              currentUser={user}
              onClose={() => setIsBookingOpen(false)}
              onBookingConfirmed={handleBookingConfirmed}
              onViewBookings={() => {
                setActiveTab("bookings");
                smoothScrollToTop();
              }}
            />
          )}
        </AnimatePresence>

        {/* User Profile & Theme Settings Modal */}
        <AnimatePresence>
          {isProfileModalOpen && user && (
            <UserProfileModal
              isOpen={isProfileModalOpen}
              user={user}
              onClose={() => setIsProfileModalOpen(false)}
              onUpdateProfile={handleUpdateProfile}
              onExit={handleExit}
              bookingCount={bookings.filter((b) => b.status === "confirmed").length}
              favoriteCount={favorites.length}
              currentTheme={theme}
              onToggleTheme={(newTheme) => setTheme(newTheme)}
              onShareApp={handleShareApp}
            />
          )}
        </AnimatePresence>

        {/* Auth Modal */}
        <AnimatePresence>
          {isAuthModalOpen && (
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
              onLoginSuccess={handleLoginSuccess}
              defaultEmail=""
              forceLogin={false}
            />
          )}
        </AnimatePresence>

        {/* Reset Password Modal (triggers on password recovery links/tokens) */}
        <AnimatePresence>
          {isResetPasswordOpen && (
            <ResetPasswordModal
              isOpen={isResetPasswordOpen}
              onClose={() => setIsResetPasswordOpen(false)}
              onPasswordUpdated={() => {
                addToast(
                  "success",
                  "Password Updated Successfully",
                  "You can now securely sign in with your new password.",
                );
              }}
            />
          )}
        </AnimatePresence>

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onDismiss={removeToast} />

        {/* Footer */}
        <Footer
          onNavigateCategory={(cat) => {
            setFilters((prev) => ({ ...prev, category: cat, searchQuery: "" }));
            setActiveTab("events");
            smoothScrollToTop();
          }}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            smoothScrollToTop();
          }}
        />
      </div>
    </SmoothScrollContainer>
  );
}
