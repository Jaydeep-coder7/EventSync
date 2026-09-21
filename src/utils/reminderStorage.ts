import { EventItem } from "../types";

export interface EventReminder {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  displayDate: string;
  venue: string;
  city: string;
  createdAt: string;
}

const REMINDERS_KEY = "eventsync_reminders";

/**
 * Retrieve all saved event reminders from localStorage
 */
export function getStoredReminders(): EventReminder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to load reminders from localStorage:", err);
    return [];
  }
}

/**
 * Retrieve list of event IDs that have active reminders
 */
export function getStoredReminderIds(): string[] {
  return getStoredReminders().map((r) => r.eventId);
}

/**
 * Check if a reminder is active for a specific event
 */
export function isEventReminderSet(eventId: string): boolean {
  return getStoredReminderIds().includes(eventId);
}

/**
 * Calculate the number of days until an event
 * Returns negative if event has passed, 0 if today, or positive integer for future days.
 */
export function getDaysUntilEvent(eventDateStr: string): number {
  if (!eventDateStr) return 999;
  try {
    const parts = eventDateStr.split("-").map(Number);
    let targetDate: Date;
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      targetDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    } else {
      targetDate = new Date(eventDateStr);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 999;
  }
}

/**
 * Check if an event is "approaching soon" (happening today or within 14 days)
 */
export function isEventApproaching(eventDateStr: string): {
  isApproaching: boolean;
  days: number;
  label: string;
} {
  const days = getDaysUntilEvent(eventDateStr);
  if (days < 0) {
    return { isApproaching: false, days, label: "Event Concluded" };
  }
  if (days === 0) {
    return { isApproaching: true, days, label: "Happening Today!" };
  }
  if (days === 1) {
    return { isApproaching: true, days, label: "Happening Tomorrow!" };
  }
  if (days <= 7) {
    return { isApproaching: true, days, label: `Approaching in ${days} days` };
  }
  if (days <= 14) {
    return { isApproaching: true, days, label: `Coming up in ${days} days` };
  }
  return { isApproaching: false, days, label: `${days} days away` };
}

/**
 * Toggle a reminder for an event (save or remove)
 */
export function toggleEventReminder(event: EventItem): {
  isSet: boolean;
  daysRemaining: number;
  isApproaching: boolean;
  label: string;
} {
  const current = getStoredReminders();
  const existsIndex = current.findIndex((r) => r.eventId === event.id);
  const approachInfo = isEventApproaching(event.date);

  let isSet = false;
  let updated: EventReminder[];

  if (existsIndex >= 0) {
    // Remove reminder
    updated = current.filter((r) => r.eventId !== event.id);
    isSet = false;
  } else {
    // Add reminder
    const newReminder: EventReminder = {
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      displayDate: event.displayDate,
      venue: event.venue,
      city: event.city,
      createdAt: new Date().toISOString(),
    };
    updated = [newReminder, ...current];
    isSet = true;
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to update reminders storage:", err);
    }
  }

  return {
    isSet,
    daysRemaining: approachInfo.days,
    isApproaching: approachInfo.isApproaching,
    label: approachInfo.label,
  };
}

/**
 * Check approaching reminders against a list of events to generate notification alerts
 */
export function getApproachingReminders(events: EventItem[]): {
  reminder: EventReminder;
  event?: EventItem;
  daysRemaining: number;
  label: string;
}[] {
  const reminders = getStoredReminders();
  if (reminders.length === 0) return [];

  const approaching: {
    reminder: EventReminder;
    event?: EventItem;
    daysRemaining: number;
    label: string;
  }[] = [];

  for (const reminder of reminders) {
    const matchingEvent = events.find((e) => e.id === reminder.eventId);
    const dateToCheck = matchingEvent ? matchingEvent.date : reminder.eventDate;
    const approachInfo = isEventApproaching(dateToCheck);

    if (approachInfo.isApproaching) {
      approaching.push({
        reminder,
        event: matchingEvent,
        daysRemaining: approachInfo.days,
        label: approachInfo.label,
      });
    }
  }

  return approaching;
}
