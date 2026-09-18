import { Booking } from "../types";

export type NotificationPermissionStatus = "granted" | "denied" | "default" | "unsupported";

export interface NotificationSettings {
  enabled: boolean;
  alert24h: boolean;
  alert1h: boolean;
  bookingConfirmation: boolean;
  sound: boolean;
}

const SETTINGS_KEY = "eventsync_notification_settings";
const NOTIFIED_ALERTS_KEY = "eventsync_notified_alerts";

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  alert24h: true,
  alert1h: true,
  bookingConfirmation: true,
  sound: true,
};

// Check if Web Notification API is supported in current environment
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

// Get current permission status safely
export function getNotificationPermission(): NotificationPermissionStatus {
  if (!isNotificationSupported()) {
    return "unsupported";
  }
  return Notification.permission as NotificationPermissionStatus;
}

// Request permission from the user
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!isNotificationSupported()) {
    return "unsupported";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermissionStatus;
  } catch (error) {
    console.warn("Error requesting Web Notification permission:", error);
    return getNotificationPermission();
  }
}

// Retrieve user preferences for notifications
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Save notification preferences
export function saveNotificationSettings(
  newSettings: Partial<NotificationSettings>,
): NotificationSettings {
  const current = getNotificationSettings();
  const updated = { ...current, ...newSettings };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save notification settings:", err);
  }
  return updated;
}

// Play notification sound chime via Web Audio API
export function playNotificationChime(): void {
  const settings = getNotificationSettings();
  if (!settings.sound || typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Chime Note 1: D5 (587.33Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Chime Note 2: A5 (880Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.1);
    gain2.gain.setValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.45);
  } catch {
    // Gracefully ignore audio autoplay restrictions
  }
}

// Dispatch a native Web Notification
export async function sendWebNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    onClick?: () => void;
  },
): Promise<boolean> {
  const settings = getNotificationSettings();
  if (!settings.enabled) return false;

  if (!isNotificationSupported()) {
    console.warn("Web Notification API is not supported in this browser.");
    return false;
  }

  // Check or prompt permission
  let permission = getNotificationPermission();
  if (permission === "default") {
    permission = await requestNotificationPermission();
  }

  if (permission !== "granted") {
    return false;
  }

  try {
    playNotificationChime();

    const fallbackIcon =
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=256&q=80";
    const notification = new Notification(title, {
      body: options?.body || "Event alert from EventSync.",
      icon: options?.icon || fallbackIcon,
      badge: options?.icon || fallbackIcon,
      tag: options?.tag || `eventsync-${Date.now()}`,
    });

    notification.onclick = (e) => {
      e.preventDefault();
      window.focus();
      if (options?.onClick) {
        options.onClick();
      }
      notification.close();
    };

    return true;
  } catch (error) {
    console.warn("Failed to construct Web Notification:", error);
    return false;
  }
}

// Alert user when a new ticket is booked
export async function notifyBookingConfirmed(
  booking: Booking,
  onClick?: () => void,
): Promise<boolean> {
  const settings = getNotificationSettings();
  if (!settings.bookingConfirmation) return false;

  const title = `🎟️ Booking Confirmed: ${booking.eventTitle}`;
  const body = `Passes confirmed for ${booking.ticketQuantity} member(s)! Event date: ${booking.eventDate} at ${booking.venue}, ${booking.city}. Reference: #${booking.id}.`;

  return sendWebNotification(title, {
    body,
    icon: booking.eventImage,
    tag: `booking-confirmed-${booking.id}`,
    onClick,
  });
}

// Alert user about an upcoming booked event
export async function notifyUpcomingEvent(
  booking: Booking,
  timeContext: string = "Starting Soon",
  onClick?: () => void,
): Promise<boolean> {
  const title = `🔔 Event Alert (${timeContext}): ${booking.eventTitle}`;
  const body = `Your booked event starts on ${booking.eventDate} at ${booking.eventTime}! Venue: ${booking.venue}, ${booking.city}. Don't forget your digital entry pass.`;

  return sendWebNotification(title, {
    body,
    icon: booking.eventImage,
    tag: `booking-upcoming-${booking.id}-${timeContext.toLowerCase().replace(/\s+/g, "-")}`,
    onClick,
  });
}

// Send test notification
export async function sendTestNotification(onClick?: () => void): Promise<boolean> {
  const title = "🔔 EventSync Browser Push Notifications Active!";
  const body =
    "Web Notification API is enabled. You will receive live alerts for all upcoming events you have booked!";

  return sendWebNotification(title, {
    body,
    tag: "eventsync-test-notification",
    onClick,
  });
}

// Calculate hours until event date
export function calculateHoursUntilEvent(eventDateStr: string): number {
  try {
    const eventTime = new Date(eventDateStr).getTime();
    if (isNaN(eventTime)) return 9999;
    const now = Date.now();
    const diffMs = eventTime - now;
    return diffMs / (1000 * 60 * 60);
  } catch {
    return 9999;
  }
}

// Check all confirmed bookings and alert if upcoming
export async function checkUpcomingBookingsAndAlert(
  bookings: Booking[],
  onAlertSent?: (booking: Booking, message: string) => void,
): Promise<number> {
  const settings = getNotificationSettings();
  if (!settings.enabled) return 0;
  if (getNotificationPermission() !== "granted") return 0;

  // Track notified bookings in this session to prevent spamming
  let notifiedAlerts: string[] = [];
  try {
    const raw = localStorage.getItem(NOTIFIED_ALERTS_KEY);
    if (raw) notifiedAlerts = JSON.parse(raw);
  } catch {
    notifiedAlerts = [];
  }

  let alertsSent = 0;
  const activeBookings = bookings.filter((b) => b.status === "confirmed");

  for (const booking of activeBookings) {
    const hoursUntil = calculateHoursUntilEvent(booking.eventDate);

    // 1 hour or less reminder
    if (settings.alert1h && hoursUntil > 0 && hoursUntil <= 2) {
      const alertKey = `${booking.id}-1h`;
      if (!notifiedAlerts.includes(alertKey)) {
        const sent = await notifyUpcomingEvent(booking, "Starting in 1 Hour");
        if (sent) {
          notifiedAlerts.push(alertKey);
          alertsSent++;
          onAlertSent?.(booking, "Starting in 1 Hour alert sent!");
        }
      }
    }
    // 24 hours reminder
    else if (settings.alert24h && hoursUntil > 0 && hoursUntil <= 36) {
      const alertKey = `${booking.id}-24h`;
      if (!notifiedAlerts.includes(alertKey)) {
        const sent = await notifyUpcomingEvent(booking, "Tomorrow / 24h Ahead");
        if (sent) {
          notifiedAlerts.push(alertKey);
          alertsSent++;
          onAlertSent?.(booking, "24h upcoming event reminder sent!");
        }
      }
    }
  }

  try {
    localStorage.setItem(NOTIFIED_ALERTS_KEY, JSON.stringify(notifiedAlerts));
  } catch {
    // Storage quota or error ignore
  }

  return alertsSent;
}

export interface UpcomingScheduleItem {
  booking: Booking;
  hoursUntil: number;
  status: "imminent" | "today" | "upcoming" | "past";
  label: string;
}

// Get ordered schedule of booked events with humanized countdown
export function getUpcomingAlertSchedule(bookings: Booking[]): UpcomingScheduleItem[] {
  const confirmed = bookings.filter((b) => b.status === "confirmed");

  return confirmed
    .map((booking) => {
      const hoursUntil = calculateHoursUntilEvent(booking.eventDate);
      let status: "imminent" | "today" | "upcoming" | "past" = "upcoming";
      let label = `${Math.round(hoursUntil / 24)} days away`;

      if (hoursUntil < 0) {
        status = "past";
        label = "Event concluded";
      } else if (hoursUntil <= 3) {
        status = "imminent";
        label = `Starting in ${Math.max(1, Math.round(hoursUntil))} hours!`;
      } else if (hoursUntil <= 24) {
        status = "today";
        label = "Happening within 24 hours";
      }

      return {
        booking,
        hoursUntil,
        status,
        label,
      };
    })
    .sort((a, b) => a.hoursUntil - b.hoursUntil);
}
