import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  MapPin,
  Volume2,
  VolumeX,
  Send,
  X,
  ShieldCheck,
  Sparkles,
  Ticket,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Booking } from "../types";
import {
  getNotificationPermission,
  requestNotificationPermission,
  getNotificationSettings,
  saveNotificationSettings,
  sendTestNotification,
  notifyUpcomingEvent,
  getUpcomingAlertSchedule,
  NotificationPermissionStatus,
  NotificationSettings,
} from "../services/notificationService";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onViewBookingPass?: (booking: Booking) => void;
  onShowToast?: (type: "success" | "error" | "info", title: string, message?: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onViewBookingPass,
  onShowToast,
}) => {
  const [permission, setPermission] = useState<NotificationPermissionStatus>("default");
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testingBookingId, setTestingBookingId] = useState<string | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPermission(getNotificationPermission());
      setSettings(getNotificationSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);

    if (result === "granted") {
      onShowToast?.(
        "success",
        "Notifications Enabled",
        "You will now receive alerts for all your booked events.",
      );
      sendTestNotification();
    } else if (result === "denied") {
      onShowToast?.(
        "error",
        "Permission Denied",
        "Browser notifications were blocked. Please enable them in site settings.",
      );
    }
  };

  const handleToggleSetting = (key: keyof NotificationSettings) => {
    const updated = saveNotificationSettings({ [key]: !settings[key] });
    setSettings(updated);
    onShowToast?.("info", "Settings Updated", "Notification preferences saved.");
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    const success = await sendTestNotification();
    setIsSendingTest(false);

    if (success) {
      onShowToast?.("success", "Test Notification Sent", "Check your device notification tray.");
    } else {
      onShowToast?.(
        "info",
        "Notification Sent",
        "If no banner appeared, please verify browser notification permissions.",
      );
    }
  };

  const handleTestEventAlert = async (booking: Booking) => {
    setTestingBookingId(booking.id);
    const success = await notifyUpcomingEvent(booking, "Upcoming Event Reminder", () => {
      onViewBookingPass?.(booking);
    });
    setTestingBookingId(null);

    if (success) {
      onShowToast?.(
        "success",
        "Event Alert Dispatched",
        `Browser alert sent for "${booking.eventTitle}".`,
      );
    } else {
      onShowToast?.("info", "Alert Triggered", `Notification sent for "${booking.eventTitle}".`);
    }
  };

  const schedule = getUpcomingAlertSchedule(bookings);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          data-lenis-prevent="true"
          className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-slate-900 shadow-2xl shadow-black/80 flex flex-col max-h-[90vh] my-auto"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-slate-950/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <BellRing className="h-4 w-4 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>Browser Event Alerts</span>
                  <span className="text-[10px] rounded-full bg-white/10 px-2 py-0.5 font-mono text-slate-300">
                    Web API
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Stay updated on gate timings, venue details & schedule updates
                </p>
              </div>
            </div>

            <button
              type="button"
              id="notification-modal-close-btn"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1 divide-y divide-white/10">
            {/* Permission Banner Card */}
            <div className="rounded-2xl border p-4 transition-all">
              {permission === "granted" ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-emerald-300">
                        Browser Push Notifications Active
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                        Your browser will automatically alert you when upcoming booked events draw
                        near.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="btn-send-test-alert"
                    onClick={handleSendTest}
                    disabled={isSendingTest}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSendingTest ? "Sending..." : "Send Test Alert"}</span>
                  </button>
                </div>
              ) : permission === "denied" ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-rose-300">
                      Notifications Blocked by Browser
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                      Your browser has blocked push notifications for this site. To re-enable, click
                      the tune / lock icon in your browser address bar and switch Notifications to{" "}
                      <strong>Allow</strong>.
                    </p>
                  </div>
                </div>
              ) : permission === "unsupported" ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 shrink-0 mt-0.5">
                    <BellOff className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-300">
                      Web Notification API Unsupported
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      This environment or in-app browser does not support the Web Notification API.
                      In-app banner alerts will be used.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                        Enable Browser Push Notifications
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                        Get live notifications on your device for upcoming showtimes, gate opening,
                        and digital passes.
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    id="btn-enable-push-permission"
                    onClick={handleRequestPermission}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
                  >
                    <BellRing className="h-3.5 w-3.5" />
                    <span>Allow Notifications</span>
                  </motion.button>
                </div>
              )}
            </div>

            {/* Upcoming Booked Event Alerts */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Ticket className="h-3.5 w-3.5 text-amber-400" />
                  <span>Booked Events & Alert Triggers</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {schedule.length} Booked
                </span>
              </div>

              {schedule.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-xs text-slate-400">
                    You have no active event bookings yet. Book an event to receive automated
                    browser push reminders!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {schedule.map(({ booking, label, status }) => (
                    <div
                      key={booking.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-colors"
                    >
                      <div className="min-w-0 flex items-start gap-3">
                        <img
                          src={booking.eventImage}
                          alt={booking.eventTitle}
                          className="h-12 w-12 rounded-xl object-cover shrink-0 border border-white/10"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <h5 className="text-xs font-bold text-white truncate break-words">
                            {booking.eventTitle}
                          </h5>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-amber-400 shrink-0" />
                              <span>{booking.eventDate}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
                              <span className="truncate">{booking.city}</span>
                            </span>
                          </div>
                          <div className="pt-1">
                            <span
                              className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                status === "imminent"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : status === "today"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          id={`test-alert-btn-${booking.id}`}
                          onClick={() => handleTestEventAlert(booking)}
                          disabled={testingBookingId === booking.id}
                          className="flex items-center gap-1 rounded-xl border border-amber-400/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
                          title="Trigger a browser push notification for this event now"
                        >
                          <BellRing className="h-3 w-3" />
                          <span>
                            {testingBookingId === booking.id ? "Sending..." : "Test Alert"}
                          </span>
                        </button>

                        {onViewBookingPass && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onViewBookingPass(booking);
                            }}
                            className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            Pass
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Preferences */}
            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Alert Rules & Sound</span>
              </h4>

              <div className="space-y-2">
                {/* Master Switch */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Event Alerts Master Switch
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Enable or pause all automated event notifications
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={() => handleToggleSetting("enabled")}
                    className="h-4 w-4 rounded border-white/20 bg-slate-800 text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-400"
                  />
                </div>

                {/* 24-hour reminder */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      24 Hours Advance Reminder
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Alert you the day before the event with timing and venue details
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.alert24h}
                    disabled={!settings.enabled}
                    onChange={() => handleToggleSetting("alert24h")}
                    className="h-4 w-4 rounded border-white/20 bg-slate-800 text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-400"
                  />
                </div>

                {/* 1-hour gate pass reminder */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      1 Hour Gate Pass Reminder
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Remind you to have your digital QR pass ready as gates open
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.alert1h}
                    disabled={!settings.enabled}
                    onChange={() => handleToggleSetting("alert1h")}
                    className="h-4 w-4 rounded border-white/20 bg-slate-800 text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-400"
                  />
                </div>

                {/* Audio Chime */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2">
                    {settings.sound ? (
                      <Volume2 className="h-4 w-4 text-amber-400 shrink-0" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-slate-500 shrink-0" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Notification Chime Sound
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Play subtle harmonic chime when notifications arrive
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.sound}
                    onChange={() => handleToggleSetting("sound")}
                    className="h-4 w-4 rounded border-white/20 bg-slate-800 text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-white/10 px-5 py-3.5 bg-slate-950/80 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Native Browser Web Notification API</span>
            </span>

            <button
              type="button"
              id="notification-modal-done-btn"
              onClick={onClose}
              className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
