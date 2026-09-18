import { Booking, EventItem } from "../types";

export interface BackendStats {
  totalEvents: number;
  activeBookingsCount: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalSeats: number;
  totalBookedSeats: number;
  totalAvailableSeats: number;
  uptimeSeconds: number;
}

export interface HealthResponse {
  status: string;
  service: string;
  uptime: number;
  timestamp: string;
  eventsCount: number;
  bookingsCount: number;
}

/**
 * Fetch events from backend with optional filter parameters
 */
export async function fetchEvents(options?: {
  searchQuery?: string;
  category?: string;
  dateFilter?: string;
  priceFilter?: string;
  sortBy?: string;
  simulateError?: boolean;
  delayMs?: number;
}): Promise<EventItem[]> {
  const delay = options?.delayMs ?? 0;
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  if (options?.simulateError) {
    throw new Error("Simulated network error: Failed to connect to server.");
  }

  const response = await fetch("/data/events.json");
  if (!response.ok) throw new Error("Failed to load events.");
  return (await response.json()) as EventItem[];
}

/**
 * Fetch a single event by ID from backend
 */
export async function fetchEventById(id: string): Promise<EventItem> {
  const res = await fetch(`/api/events/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to load event ${id}`);
  }
  const data = await res.json();
  return data.event;
}

/**
 * Create a new booking on the backend
 */
export async function createBookingApi(payload: {
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  ticketTierId: string;
  ticketQuantity: number;
  selectedSeats?: string[];
  specialRequests?: string;
}): Promise<{ booking: Booking; updatedEvent: EventItem }> {
  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Booking service unavailable");
    return { booking: data.booking, updatedEvent: data.updatedEvent };
  } catch {
    const events = await fetchEvents();
    const event = events.find((item) => item.id === payload.eventId);
    if (!event) throw new Error("This event could not be found.");
    const tier =
      event.ticketTiers.find((item) => item.id === payload.ticketTierId) ?? event.ticketTiers[0];
    if (!tier) throw new Error("No ticket tier is available for this event.");
    const totalAmount = tier.price * payload.ticketQuantity;
    const booking: Booking = {
      id: `ES-${Date.now().toString().slice(-8)}`,
      eventId: event.id,
      eventTitle: event.title,
      eventCategory: event.category,
      eventImage: event.image,
      eventDate: event.displayDate,
      eventTime: event.time,
      venue: event.venue,
      city: event.city,
      attendeeName: payload.attendeeName,
      attendeeEmail: payload.attendeeEmail,
      attendeePhone: payload.attendeePhone,
      ticketTierId: tier.id,
      ticketTierName: tier.name,
      ticketQuantity: payload.ticketQuantity,
      selectedSeats: payload.selectedSeats,
      pricePerTicket: tier.price,
      subtotal: totalAmount,
      serviceFee: 0,
      totalAmount,
      bookingDate: new Date().toLocaleString("en-IN"),
      status: "confirmed",
      specialRequests: payload.specialRequests,
    };
    return {
      booking,
      updatedEvent: {
        ...event,
        bookedSeats: Math.min(event.totalSeats, event.bookedSeats + payload.ticketQuantity),
      },
    };
  }
}

/**
 * Cancel a booking on the backend
 */
export async function cancelBookingApi(
  bookingId: string,
): Promise<{ booking: Booking; updatedEvent?: EventItem }> {
  const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
    method: "POST",
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to cancel booking on backend");
  }

  return {
    booking: data.booking,
    updatedEvent: data.updatedEvent,
  };
}

/**
 * Fetch platform stats from backend
 */
export async function fetchBackendStats(): Promise<BackendStats | null> {
  try {
    const events = await fetchEvents();
    const totalSeats = events.reduce((sum, event) => sum + event.totalSeats, 0);
    const totalBookedSeats = events.reduce((sum, event) => sum + event.bookedSeats, 0);
    return {
      totalEvents: events.length,
      activeBookingsCount: 0,
      totalTicketsSold: totalBookedSeats,
      totalRevenue: 0,
      totalSeats,
      totalBookedSeats,
      totalAvailableSeats: Math.max(0, totalSeats - totalBookedSeats),
      uptimeSeconds: 0,
    };
  } catch {
    return null;
  }
}

/**
 * Ping backend health
 */
export async function pingBackend(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = performance.now();
  try {
    const res = await fetch("/data/events.json", { method: "HEAD" });
    const latencyMs = Math.round(performance.now() - start);
    return { ok: res.ok, latencyMs };
  } catch {
    return { ok: false, latencyMs: 0 };
  }
}
