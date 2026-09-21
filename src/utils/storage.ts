import { Booking, EventReview } from "../types";

// Purge legacy global keys that contained mock data (e.g. Alex Morgan)
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("eventhive_bookings");
    localStorage.removeItem("eventhive_favorites");
  } catch {
    // Ignore localStorage access errors
  }
}

function getBookingsKey(email?: string): string {
  const clean = email?.trim().toLowerCase();
  return clean ? `eventsync_bookings_${clean}` : "eventsync_bookings_guest";
}

function getFavoritesKey(email?: string): string {
  const clean = email?.trim().toLowerCase();
  return clean ? `eventsync_favorites_${clean}` : "eventsync_favorites_guest";
}

/**
 * Retrieve bookings for a specific user.
 * Returns empty array [] for any new account (no fake seed bookings).
 */
export function getStoredBookings(userEmail?: string): Booking[] {
  if (typeof window === "undefined") return [];
  const key = getBookingsKey(userEmail);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse bookings from localStorage:", error);
    return [];
  }
}

/**
 * Persist bookings for a specific user.
 */
export function setStoredBookings(bookings: Booking[], userEmail?: string): void {
  if (typeof window === "undefined") return;
  const key = getBookingsKey(userEmail);
  try {
    localStorage.setItem(key, JSON.stringify(bookings));
  } catch (error) {
    console.warn("Failed to save bookings to localStorage:", error);
  }
}

/**
 * Save a new booking scoped to the given user.
 */
export function saveBooking(booking: Booking, userEmail?: string): Booking[] {
  const targetEmail = userEmail || booking.attendeeEmail;
  const current = getStoredBookings(targetEmail);
  // Prevent duplicate insertion
  const filtered = current.filter((b) => b.id !== booking.id);
  const updated = [booking, ...filtered];
  setStoredBookings(updated, targetEmail);
  return updated;
}

/**
 * Cancel a booking scoped to the given user.
 */
export function cancelBooking(bookingId: string, userEmail?: string): Booking[] {
  const current = getStoredBookings(userEmail);
  const now = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const updated = current.map((item) =>
    item.id === bookingId
      ? {
          ...item,
          status: "cancelled" as const,
          cancelledAt: now,
          cancellationReason: "Attendee requested cancellation. 100% full refund approved.",
          refundStatus: `100% Refund (₹${item.totalAmount.toLocaleString("en-IN")}) credited to original payment method`,
        }
      : item,
  );
  setStoredBookings(updated, userEmail);
  return updated;
}

/**
 * Delete a booking scoped to the given user.
 */
export function deleteBooking(bookingId: string, userEmail?: string): Booking[] {
  const current = getStoredBookings(userEmail);
  const updated = current.filter((item) => item.id !== bookingId);
  setStoredBookings(updated, userEmail);
  return updated;
}

/**
 * Retrieve saved favorites for a specific user.
 */
export function getStoredFavorites(userEmail?: string): string[] {
  if (typeof window === "undefined") return [];
  const key = getFavoritesKey(userEmail);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persist favorites for a specific user.
 */
export function setStoredFavorites(favorites: string[], userEmail?: string): void {
  if (typeof window === "undefined") return;
  const key = getFavoritesKey(userEmail);
  try {
    localStorage.setItem(key, JSON.stringify(favorites));
  } catch {
    // Ignore
  }
}

/**
 * Toggle favorite event for a specific user.
 */
export function toggleStoredFavorite(eventId: string, userEmail?: string): string[] {
  const current = getStoredFavorites(userEmail);
  const exists = current.includes(eventId);
  const updated = exists ? current.filter((id) => id !== eventId) : [...current, eventId];
  setStoredFavorites(updated, userEmail);
  return updated;
}

const DEFAULT_EVENT_REVIEWS: Record<string, EventReview[]> = {
  "eh-07": [
    {
      id: "rev-eh07-1",
      eventId: "eh-07",
      userName: "Rohan Verma",
      userEmail: "rohan.v@example.com",
      rating: 5,
      feedback:
        "Absolute street food paradise! The Kolkata kathi rolls and Benaras tamatar chaat stalls were incredible. Seamless entry through digital pass, highly recommended!",
      createdAt: "Sep 16, 2026",
      tags: ["Great Food Variety", "Smooth Entry", "Family Friendly"],
      verifiedAttendee: true,
      bookingReference: "ES-2026-9142",
    },
    {
      id: "rev-eh07-2",
      eventId: "eh-07",
      userName: "Pooja Sharma",
      userEmail: "pooja.s@example.com",
      rating: 4,
      feedback:
        "Loved the artisanal mocktails and live acoustic music. The crowd was energetic and seating arrangements were well maintained.",
      createdAt: "Sep 16, 2026",
      tags: ["Lively Crowd", "Good Music"],
      verifiedAttendee: true,
      bookingReference: "ES-2026-8823",
    },
  ],
  "eh-11": [
    {
      id: "rev-eh11-1",
      eventId: "eh-11",
      userName: "Ananya Iyer",
      userEmail: "ananya.i@example.com",
      rating: 5,
      feedback:
        "Unforgettable culinary heritage experience in Diggi Palace! The royal thali curation and storytelling by the master chef were top notch.",
      createdAt: "Sep 11, 2026",
      tags: ["Royal Ambience", "Exquisite Flavors", "Masterclass"],
      verifiedAttendee: true,
      bookingReference: "ES-2026-5512",
    },
  ],
};

/**
 * Check if an event date has passed (concluded event)
 */
export function isEventConcluded(eventDateStr: string): boolean {
  if (!eventDateStr) return false;
  try {
    const parts = eventDateStr.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const eventDate = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999);
      return eventDate.getTime() < Date.now();
    }
    const d = new Date(eventDateStr);
    return !isNaN(d.getTime()) && d.getTime() < Date.now();
  } catch {
    return false;
  }
}

function getEventReviewsKey(eventId: string): string {
  return `eventsync_reviews_${eventId}`;
}

/**
 * Retrieve reviews for an event (including saved user reviews and default verified reviews)
 */
export function getStoredEventReviews(eventId: string): EventReview[] {
  if (typeof window === "undefined") return DEFAULT_EVENT_REVIEWS[eventId] || [];
  const key = getEventReviewsKey(eventId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const defaults = DEFAULT_EVENT_REVIEWS[eventId] || [];
      if (defaults.length > 0) {
        localStorage.setItem(key, JSON.stringify(defaults));
      }
      return defaults;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return DEFAULT_EVENT_REVIEWS[eventId] || [];
  }
}

/**
 * Save or update a review for an event
 */
export function saveEventReview(review: EventReview): EventReview[] {
  const current = getStoredEventReviews(review.eventId);
  const existingIndex = current.findIndex(
    (r) => r.id === review.id || (r.userEmail && r.userEmail === review.userEmail),
  );

  let updated: EventReview[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = { ...current[existingIndex], ...review };
  } else {
    updated = [review, ...current];
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(getEventReviewsKey(review.eventId), JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to persist review:", err);
    }
  }

  return updated;
}

/**
 * Retrieve a specific user's review for an event, if they already submitted one
 */
export function getUserReviewForEvent(
  eventId: string,
  userEmail?: string,
): EventReview | undefined {
  if (!userEmail) return undefined;
  const reviews = getStoredEventReviews(eventId);
  const cleanEmail = userEmail.trim().toLowerCase();
  return reviews.find((r) => r.userEmail.trim().toLowerCase() === cleanEmail);
}
