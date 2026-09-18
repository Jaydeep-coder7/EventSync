import { Booking } from "../types";

const BOOKINGS_KEY = "eventhive_bookings";
const FAVORITES_KEY = "eventhive_favorites";

const DEFAULT_SEED_BOOKINGS: Booking[] = [
  {
    id: "ES-2026-7842",
    eventId: "eh-07",
    eventTitle: "Monsoon EDM Sunset Rave & Laser Pavilion",
    eventCategory: "Music",
    eventImage:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    eventDate: "Sun, Nov 15, 2026",
    eventTime: "4:00 PM - 11:00 PM IST",
    venue: "Bayview Coastal Arena",
    city: "Goa",
    attendeeName: "Alex Morgan",
    attendeeEmail: "alex.morgan@gmail.com",
    attendeePhone: "+91 98765 43210",
    ticketTierId: "tier-vip",
    ticketTierName: "VIP Golden Circle Pass",
    ticketQuantity: 2,
    selectedSeats: ["Row A - Seat 4 (VIP)", "Row A - Seat 5 (VIP)"],
    pricePerTicket: 2999,
    subtotal: 5998,
    serviceFee: 0,
    totalAmount: 5998,
    bookingDate: "Sep 10, 2026, 03:30 PM",
    status: "cancelled",
    cancelledAt: "Sep 12, 2026, 11:15 AM",
    cancellationReason:
      "Event cancelled by festival organizers due to coastal monsoon alert. 100% full refund approved.",
    refundStatus: "100% Refund (₹5,998) successfully processed to Google Pay / UPI",
  },
  {
    id: "ES-2026-4419",
    eventId: "eh-01",
    eventTitle: "Neon Pulse: Electro-Sonic Music Festival 2026",
    eventCategory: "Music",
    eventImage:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    eventDate: "Sat, Oct 18, 2026",
    eventTime: "5:00 PM - 1:00 AM IST",
    venue: "Bandra Kurla Amphitheatre Grounds",
    city: "Mumbai",
    attendeeName: "Alex Morgan",
    attendeeEmail: "alex.morgan@gmail.com",
    attendeePhone: "+91 98765 43210",
    ticketTierId: "tier-ga",
    ticketTierName: "General Admission",
    ticketQuantity: 2,
    selectedSeats: ["Row B - Seat 3", "Row B - Seat 4"],
    pricePerTicket: 1499,
    subtotal: 2998,
    serviceFee: 0,
    totalAmount: 2998,
    bookingDate: "Sep 14, 2026, 02:15 PM",
    status: "confirmed",
  },
];

export function getStoredBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(DEFAULT_SEED_BOOKINGS));
      return DEFAULT_SEED_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SEED_BOOKINGS;
  } catch (error) {
    console.error("Failed to parse bookings from localStorage:", error);
    return DEFAULT_SEED_BOOKINGS;
  }
}

export function saveBooking(booking: Booking): Booking[] {
  const current = getStoredBookings();
  const updated = [booking, ...current];
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save booking to localStorage:", error);
  }
  return updated;
}

export function cancelBooking(bookingId: string): Booking[] {
  const current = getStoredBookings();
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
          refundStatus: `100% Refund (₹${item.totalAmount.toLocaleString("en-IN")}) successfully credited to original payment method`,
        }
      : item,
  );
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update booking status in localStorage:", error);
  }
  return updated;
}

export function deleteBooking(bookingId: string): Booking[] {
  const current = getStoredBookings();
  const updated = current.filter((item) => item.id !== bookingId);
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to delete booking from localStorage:", error);
  }
  return updated;
}

export function getStoredFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function toggleStoredFavorite(eventId: string): string[] {
  const current = getStoredFavorites();
  const exists = current.includes(eventId);
  const updated = exists ? current.filter((id) => id !== eventId) : [...current, eventId];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}
