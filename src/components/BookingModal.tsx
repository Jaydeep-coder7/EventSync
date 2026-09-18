import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "qrcode";
import {
  X,
  Ticket,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  QrCode,
  ShieldCheck,
  CreditCard,
  Building2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Smartphone,
  AlertCircle,
  Plus,
  Minus,
  Users,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { EventItem, TicketTier, Booking, UserProfile } from "../types";
import { validateBookingForm, BookingFormData } from "../utils/validation";
import { createBookingApi } from "../services/api";
import { ScanAtEntryPass } from "./ScanAtEntryPass";
import { PaymentSuccessOverlay } from "./PaymentSuccessOverlay";

interface MemberDetail {
  id: string;
  name: string;
}

interface BookingModalProps {
  isOpen: boolean;
  event: EventItem | null;
  initialTier?: TicketTier;
  currentUser: UserProfile | null;
  onClose: () => void;
  onBookingConfirmed: (booking: Booking, updatedEvent?: EventItem) => void;
  onViewBookings: () => void;
}

const POPULAR_BANKS = [
  { id: "sbi", name: "State Bank of India", short: "SBI", icon: "🏛️" },
  { id: "hdfc", name: "HDFC Bank", short: "HDFC", icon: "🏦" },
  { id: "icici", name: "ICICI Bank", short: "ICICI", icon: "💳" },
  { id: "axis", name: "Axis Bank", short: "Axis", icon: "📈" },
  { id: "kotak", name: "Kotak Mahindra", short: "Kotak", icon: "🛡️" },
  { id: "pnb", name: "Punjab National Bank", short: "PNB", icon: "🏛️" },
  { id: "gpay", name: "Google Pay UPI", short: "GPay", icon: "⚡" },
  { id: "phonepe", name: "PhonePe UPI", short: "PhonePe", icon: "🟣" },
  { id: "paytm", name: "Paytm UPI", short: "Paytm", icon: "📱" },
];

export const BookingModal: React.FC<BookingModalProps> = (props) => {
  if (!props.isOpen || !props.event) return null;
  return <BookingModalContent {...props} event={props.event} />;
};

const BookingModalContent: React.FC<BookingModalProps & { event: EventItem }> = ({
  isOpen,
  event,
  initialTier,
  currentUser,
  onClose,
  onBookingConfirmed,
  onViewBookings,
}) => {
  // Step 1: select members & show total price
  // Step 2: UPI scanner / number + select bank details + enter user details
  // Step 2.5: payment processing
  // Step 3: confirmed - give passes directly to the user
  const [currentStep, setCurrentStep] = useState<
    "members-and-price" | "upi-bank-payment" | "payment-processing" | "confirmed"
  >("members-and-price");

  // Member management state
  const [members, setMembers] = useState<MemberDetail[]>(() => [
    { id: "1", name: currentUser?.name || "" },
  ]);

  // Primary attendee form state
  const [formData, setFormData] = useState<BookingFormData>({
    attendeeName: currentUser?.name || "",
    attendeeEmail: currentUser?.email || "",
    attendeePhone: currentUser?.phone || "+91 98765 43210",
    ticketTierId: initialTier?.id || event.ticketTiers?.[0]?.id || "",
    ticketQuantity: 1,
    selectedSeats: ["Member 1 (Primary)"],
    specialRequests: "",
  });

  // Bank & UPI Payment State - strictly EMPTY by default (users fill these themselves)
  const [selectedBank, setSelectedBank] = useState<string>("sbi");
  const [bankAccountHolder, setBankAccountHolder] = useState<string>(currentUser?.name || "");
  const [upiNumberId, setUpiNumberId] = useState<string>(""); // empty by user request
  const [bankRefNo, setBankRefNo] = useState<string>(""); // empty by user request
  const [upiPin, setUpiPin] = useState<string>(""); // empty by user request
  const [copiedField, setCopiedField] = useState<"upi-id" | "upi-number" | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        attendeeName: prev.attendeeName || currentUser.name,
        attendeeEmail: prev.attendeeEmail || currentUser.email,
        attendeePhone: prev.attendeePhone || currentUser.phone || "+91 98765 43210",
      }));
      setBankAccountHolder((prev) => prev || currentUser.name);
      setMembers((prev) => {
        if (prev.length > 0 && !prev[0].name) {
          const next = [...prev];
          next[0] = { ...next[0], name: currentUser.name };
          return next;
        }
        return prev;
      });
    }
  }, [currentUser]);

  // Derive active tier & pricing
  const currentTier =
    event.ticketTiers.find((t) => t.id === formData.ticketTierId) || event.ticketTiers[0];

  const pricePerTicket = currentTier?.price || 0;
  const memberCount = members.length;
  const totalAmount = pricePerTicket * memberCount;

  // Generate UPI QR Code with amount embedded
  useEffect(() => {
    const upiUri = `upi://pay?pa=eventhive.pay@icici&pn=EventHive%20Tickets&am=${totalAmount}&cu=INR&tn=Booking%20Passes%20for%20${memberCount}%20Members`;
    QRCode.toDataURL(upiUri, {
      width: 260,
      margin: 1,
      color: {
        dark: "#020617",
        light: "#ffffff",
      },
    })
      .then((url) => {
        setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error("Failed to render UPI QR Code:", err);
      });
  }, [totalAmount, memberCount]);

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setApiError(null);
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Add a member
  const handleAddMember = () => {
    if (members.length >= 10) {
      setApiError("Maximum 10 members allowed per booking.");
      return;
    }
    const nextNum = members.length + 1;
    const newMember: MemberDetail = {
      id: String(Date.now() + Math.random()),
      name: "",
    };
    const updated = [...members, newMember];
    setMembers(updated);
    setFormData((prev) => ({
      ...prev,
      ticketQuantity: updated.length,
      selectedSeats: updated.map((m, i) =>
        i === 0
          ? `Member 1 (${prev.attendeeName || "Primary"})`
          : `Member ${i + 1}${m.name ? ` (${m.name})` : ""}`,
      ),
    }));
    setApiError(null);
  };

  // Remove a member
  const handleRemoveMember = (indexToRemove: number) => {
    if (members.length <= 1) return;
    const updated = members.filter((_, idx) => idx !== indexToRemove);
    setMembers(updated);
    setFormData((prev) => ({
      ...prev,
      ticketQuantity: updated.length,
      selectedSeats: updated.map((m, i) =>
        i === 0
          ? `Member 1 (${prev.attendeeName || "Primary"})`
          : `Member ${i + 1}${m.name ? ` (${m.name})` : ""}`,
      ),
    }));
    setApiError(null);
  };

  // Update specific member name
  const handleMemberNameChange = (index: number, name: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], name };
    setMembers(updated);
    if (index === 0) {
      handleInputChange("attendeeName", name);
    }
    setFormData((prev) => ({
      ...prev,
      selectedSeats: updated.map((m, i) =>
        i === 0
          ? `Member 1 (${name || prev.attendeeName || "Primary"})`
          : `Member ${i + 1}${m.name ? ` (${m.name})` : ""}`,
      ),
    }));
  };

  // Set member count directly (via stepper or chips)
  const handleSetMemberCount = (targetCount: number) => {
    const safeCount = Math.max(1, Math.min(10, targetCount));
    let nextMembers: MemberDetail[] = [...members];

    if (safeCount > nextMembers.length) {
      while (nextMembers.length < safeCount) {
        nextMembers.push({
          id: String(Date.now() + Math.random()),
          name: "",
        });
      }
    } else if (safeCount < nextMembers.length) {
      nextMembers = nextMembers.slice(0, safeCount);
    }

    setMembers(nextMembers);
    setFormData((prev) => ({
      ...prev,
      ticketQuantity: nextMembers.length,
      selectedSeats: nextMembers.map((m, i) =>
        i === 0
          ? `Member 1 (${prev.attendeeName || "Primary"})`
          : `Member ${i + 1}${m.name ? ` (${m.name})` : ""}`,
      ),
    }));
    setApiError(null);
  };

  // Step 1: Click "Book Tickets" -> Validate attendee info and member count -> Show UPI & Bank Details
  const handleClickBook = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validation = validateBookingForm({
      ...formData,
      ticketQuantity: members.length,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setCurrentStep("upi-bank-payment");
  };

  // Copy helper
  const handleCopy = (text: string, type: "upi-id" | "upi-number") => {
    navigator.clipboard.writeText(text);
    setCopiedField(type);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Optional manual test UTR generation (only when user clicks)
  const handleGenerateTestUTR = () => {
    const newRef = `4029${Math.floor(10000000 + Math.random() * 90000000)}`;
    setBankRefNo(newRef);
  };

  // Step 2: "Proceed Payment & Confirm Booking"
  const handleProceedPaymentAndConfirm = async () => {
    setApiError(null);

    // Validation: make sure user entered UPI ID / phone or UTR
    if (!upiNumberId.trim() && !bankRefNo.trim()) {
      setApiError(
        "Please enter your UPI ID, linked phone number, or 12-digit UTR reference to verify payment.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Build human readable member passes
      const formattedMemberPasses = members.map((m, i) => {
        if (i === 0) {
          return `Member 1 (Primary: ${formData.attendeeName.trim()})`;
        }
        return `Member ${i + 1}${m.name.trim() ? `: ${m.name.trim()}` : ""}`;
      });

      // Call backend API: POST /api/bookings
      const result = await createBookingApi({
        eventId: event.id,
        attendeeName: formData.attendeeName.trim(),
        attendeeEmail: formData.attendeeEmail.trim(),
        attendeePhone: formData.attendeePhone.trim(),
        ticketTierId: currentTier.id,
        ticketQuantity: members.length,
        selectedSeats: formattedMemberPasses,
        specialRequests: formData.specialRequests?.trim(),
      });

      onBookingConfirmed(result.booking, result.updatedEvent);
      setConfirmedBooking(result.booking);
      setCurrentStep("payment-processing");
    } catch (err: unknown) {
      console.error("Booking submission error:", err);
      setApiError(
        (err as Error)?.message || "Payment processing failed. Please check payment authorization.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      data-lenis-prevent="true"
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 md:p-6 flex justify-center items-start min-h-screen text-white"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/10 shadow-2xl my-4 sm:my-8 text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-5 sm:px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
              <Ticket className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-sm sm:text-base font-bold text-white truncate">
                {currentStep === "confirmed"
                  ? "Your Admission Passes Are Ready!"
                  : currentStep === "upi-bank-payment"
                    ? "Scan UPI QR & Enter Bank Details"
                    : "Add Members & Book Tickets"}
              </h2>
              <span className="text-[11px] text-amber-300/80 font-medium block truncate">
                {currentStep === "confirmed"
                  ? "Valid for Direct Gate Entry"
                  : "100% Zero Convenience & Processing Fees"}
              </span>
            </div>
          </div>

          <button
            id="booking-modal-close-btn"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Multi-Step Indicator */}
        <div className="grid grid-cols-3 border-b border-white/10 bg-slate-950/50 text-[11px] sm:text-xs font-semibold">
          <div
            className={`py-2.5 px-2 text-center transition-colors truncate ${
              currentStep === "members-and-price"
                ? "text-amber-400 border-b-2 border-amber-400 bg-amber-500/5"
                : "text-slate-400"
            }`}
          >
            1. Members & Price
          </div>
          <div
            className={`py-2.5 px-2 text-center transition-colors truncate ${
              currentStep === "upi-bank-payment"
                ? "text-amber-400 border-b-2 border-amber-400 bg-amber-500/5"
                : "text-slate-400"
            }`}
          >
            2. UPI & Bank Details
          </div>
          <div
            className={`py-2.5 px-2 text-center transition-colors truncate ${
              currentStep === "confirmed"
                ? "text-amber-400 border-b-2 border-amber-400 bg-amber-500/5"
                : "text-slate-400"
            }`}
          >
            3. Issued Passes
          </div>
        </div>

        {/* ==================================================== */}
        {/* STEP 2.5: PAYMENT SUCCESS ANIMATION OVERLAY */}
        {/* ==================================================== */}
        {currentStep === "payment-processing" && confirmedBooking && (
          <PaymentSuccessOverlay
            amount={totalAmount}
            currencySymbol="₹"
            eventName={event.title}
            ticketCount={members.length}
            onComplete={() => setCurrentStep("confirmed")}
          />
        )}

        {/* ==================================================== */}
        {/* STEP 3: CONFIRMED - PASSES DELIVERED DIRECTLY */}
        {/* ==================================================== */}
        {currentStep === "confirmed" && confirmedBooking ? (
          <div className="p-5 sm:p-7 space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                Payment Succeeded & Booking Confirmed! Official passes are generated below.
              </span>
            </div>

            {/* Passes directly delivered */}
            <ScanAtEntryPass
              booking={confirmedBooking}
              onPrint={handlePrint}
              onShare={() => {
                if (navigator.share) {
                  navigator
                    .share({
                      title: `Entry Pass for ${confirmedBooking.eventTitle}`,
                      text: `Passes reserved for ${confirmedBooking.ticketQuantity} member(s) at ${confirmedBooking.eventTitle}! Pass #${confirmedBooking.id}`,
                      url: window.location.href,
                    })
                    .catch(() => {});
                }
              }}
            />

            {/* Post Booking Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                id="view-in-my-bookings-btn"
                onClick={() => {
                  onClose();
                  onViewBookings();
                }}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer"
              >
                <span>Go to My Bookings</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                id="close-confirmation-btn"
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : currentStep === "upi-bank-payment" ? (
          /* ==================================================== */
          /* STEP 2: SHOW UPI SCANNER OR NUMBER -> SELECT BANK DETAILS & ENTER -> PROCEED PAYMENT */
          /* ==================================================== */
          <div className="p-5 sm:p-7 space-y-5">
            {/* Order Recap Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/10 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-12 w-16 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-display text-xs sm:text-sm font-bold text-white truncate">
                    {event.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 truncate">
                    {members.length} Member{members.length > 1 ? "s" : ""} • {currentTier.name}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase">Total Payable</span>
                <span className="font-display text-lg sm:text-xl font-black text-amber-400">
                  {totalAmount === 0 ? "FREE" : `₹${totalAmount.toLocaleString("en-IN")}`}
                </span>
              </div>
            </div>

            {/* UPI SCANNER & UPI NUMBER SECTION */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    1. Scan UPI QR or Pay via Number
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full self-start sm:self-auto">
                  Instant Auto-Verify
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Visual UPI Scanner */}
                <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-950/70 border border-white/10">
                  <div className="relative p-2 rounded-2xl bg-white shadow-lg">
                    {/* Reticle corner borders */}
                    <div className="absolute top-1 left-1 h-3.5 w-3.5 border-t-2 border-l-2 border-amber-500" />
                    <div className="absolute top-1 right-1 h-3.5 w-3.5 border-t-2 border-r-2 border-amber-500" />
                    <div className="absolute bottom-1 left-1 h-3.5 w-3.5 border-b-2 border-l-2 border-amber-500" />
                    <div className="absolute bottom-1 right-1 h-3.5 w-3.5 border-b-2 border-r-2 border-amber-500" />

                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="UPI Payment QR Code"
                        className="h-36 w-36 sm:h-40 sm:w-40 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="h-36 w-36 sm:h-40 sm:w-40 flex items-center justify-center text-xs text-slate-600 font-mono">
                        Generating QR...
                      </div>
                    )}

                    {/* Animated scanning laser line */}
                    <motion.div
                      animate={{ y: [0, 130, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 shadow-[0_0_8px_#f59e0b] pointer-events-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 text-center font-medium">
                    Scan with GPay, PhonePe, Paytm, CRED or any UPI App
                  </span>
                </div>

                {/* UPI Number & UPI ID Options */}
                <div className="space-y-2.5">
                  {/* UPI Number */}
                  <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">
                      UPI Mobile Number
                    </span>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span className="font-mono text-xs sm:text-sm font-bold text-white truncate">
                        +91 98765 43210
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy("+919876543210", "upi-number")}
                        className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-semibold text-amber-300 hover:bg-white/20 transition-colors cursor-pointer shrink-0"
                      >
                        {copiedField === "upi-number" ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* UPI ID / VPA */}
                  <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">
                      Official UPI ID / VPA
                    </span>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 break-all truncate">
                        eventhive.pay@icici
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy("eventhive.pay@icici", "upi-id")}
                        className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-semibold text-amber-300 hover:bg-white/20 transition-colors cursor-pointer shrink-0"
                      >
                        {copiedField === "upi-id" ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-300/90 leading-tight">
                    Amount:{" "}
                    <strong className="text-white">₹{totalAmount.toLocaleString("en-IN")}</strong>{" "}
                    will populate in your UPI app upon scan.
                  </div>
                </div>
              </div>
            </div>

            {/* SELECT BANK DETAILS & ENTER INFORMATION (NO AUTO-FILL) */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    2. Select Bank & Enter Your Payment Info
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  We do not pre-fill your private UPI or PIN
                </span>
              </div>

              {/* Bank Selector Chips */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
                {POPULAR_BANKS.map((b) => {
                  const isSelected = selectedBank === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBank(b.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30"
                          : "border-white/10 bg-slate-950/40 text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span className="text-sm mb-0.5">{b.icon}</span>
                      <span className="truncate w-full text-center">{b.short}</span>
                    </button>
                  );
                })}
              </div>

              {/* Enter Bank & Payment Inputs - BLANK BY DEFAULT FOR USERS TO FILL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Account / UPI Holder Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <User className="h-3 w-3 text-amber-400" />
                    <span>Account Holder Name</span>
                  </label>
                  <input
                    type="text"
                    value={bankAccountHolder}
                    onChange={(e) => setBankAccountHolder(e.target.value)}
                    placeholder="Enter your name as on bank account"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>

                {/* UPI ID / Virtual Address */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <Smartphone className="h-3 w-3 text-amber-400" />
                    <span>Your UPI ID / Linked Mobile Number *</span>
                  </label>
                  <input
                    type="text"
                    value={upiNumberId}
                    onChange={(e) => setUpiNumberId(e.target.value)}
                    placeholder="e.g. yourname@upi or 9876543210"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {/* 12-Digit Bank Reference (UTR) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-amber-400" />
                      <span>Bank UTR / UPI Ref Number</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateTestUTR}
                      className="text-[10px] text-amber-400 underline hover:text-amber-300 cursor-pointer"
                    >
                      Need test UTR?
                    </button>
                  </div>
                  <input
                    type="text"
                    value={bankRefNo}
                    onChange={(e) => setBankRefNo(e.target.value)}
                    placeholder="Enter 12-digit transaction reference"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {/* UPI Security PIN (Masked) - User Enters */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <Lock className="h-3 w-3 text-amber-400" />
                    <span>UPI Security PIN *</span>
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={upiPin}
                    onChange={(e) => setUpiPin(e.target.value)}
                    placeholder="Enter 4 or 6 digit PIN"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono tracking-widest"
                  />
                </div>
              </div>
            </div>

            {/* Error Display if any */}
            {apiError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span className="break-words">{apiError}</span>
              </div>
            )}

            {/* ACTION: BACK OR PROCEED PAYMENT AND CONFIRM BOOKING */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setCurrentStep("members-and-price")}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Adjust Members</span>
              </button>

              <button
                type="button"
                id="proceed-payment-and-confirm-btn"
                onClick={handleProceedPaymentAndConfirm}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    <span>Verifying Bank & Confirming...</span>
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>
                      Proceed Payment & Confirm (
                      {totalAmount === 0 ? "FREE" : `₹${totalAmount.toLocaleString("en-IN")}`})
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ==================================================== */
          /* STEP 1: HOW MANY MEMBERS -> ADD THEM -> SHOW TOTAL AMOUNT -> CLICK ON BOOK */
          /* ==================================================== */
          <form onSubmit={handleClickBook} className="p-5 sm:p-7 space-y-5">
            {/* Event Header Card Mini */}
            <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 p-3.5 border border-white/10">
              <img
                src={event.image}
                alt={event.title}
                className="h-14 w-20 rounded-xl object-cover shrink-0 shadow-xs"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {event.category}
                </span>
                <h4 className="font-display text-xs sm:text-sm font-bold text-white truncate">
                  {event.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {event.displayDate} • {event.venue}, {event.city}
                </p>
              </div>
            </div>

            {/* Ticket Tier Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Select Ticket Tier
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {event.ticketTiers.map((tier) => {
                  const isSelected = formData.ticketTierId === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => handleInputChange("ticketTierId", tier.id)}
                      className={`flex flex-col justify-between rounded-xl border p-3 transition-all cursor-pointer ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/15 ring-1 ring-amber-500/30"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-xs text-white">
                          {tier.name}
                        </span>
                        <span className="font-display font-extrabold text-xs text-amber-400">
                          {tier.price === 0 ? "FREE" : `₹${tier.price.toLocaleString("en-IN")}`}
                          <span className="text-[10px] text-slate-400 font-normal ml-0.5">
                            /member
                          </span>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                        {tier.remaining} passes remaining
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HOW MANY MEMBERS & ADD MEMBERS SECTION */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>How Many Members Are Attending?</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select count or add member details directly
                  </p>
                </div>

                {/* Member Stepper Counter */}
                <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-950/70 border border-white/10 rounded-2xl p-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetMemberCount(members.length - 1)}
                    disabled={members.length <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Remove member"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <div className="px-2 text-center min-w-[70px]">
                    <span className="font-display text-base font-black text-amber-400 block leading-tight">
                      {members.length}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase">
                      {members.length === 1 ? "Member" : "Members"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSetMemberCount(members.length + 1)}
                    disabled={members.length >= 10}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Add member"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Member Preset Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 mr-1">Quick Select:</span>
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const isCur = members.length === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSetMemberCount(num)}
                      className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                        isCur
                          ? "bg-amber-400 text-slate-950 font-bold shadow-xs"
                          : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
                      }`}
                    >
                      {num} {num === 1 ? "Member" : "Members"}
                    </button>
                  );
                })}
              </div>

              {/* Detailed Member List & Names */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Member Passes ({members.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    disabled={members.length >= 10}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Member</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {members.map((member, idx) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2.5 rounded-xl bg-slate-950/60 border border-white/10 p-2.5"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={idx === 0 ? formData.attendeeName : member.name}
                          onChange={(e) => handleMemberNameChange(idx, e.target.value)}
                          placeholder={
                            idx === 0
                              ? "Primary Member Name (Required)"
                              : `Member ${idx + 1} Name (Optional)`
                          }
                          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-medium truncate"
                        />
                      </div>

                      {idx === 0 ? (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30 shrink-0">
                          Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(idx)}
                          className="text-slate-400 hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer shrink-0"
                          title="Remove member"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PROMINENT TOTAL PRICE DISPLAY */}
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/10 p-4 space-y-2.5 shadow-lg shadow-black/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Total Amount Calculation
                </span>
                <span className="text-[11px] font-mono text-slate-300">
                  {members.length} Member{members.length > 1 ? "s" : ""} ×{" "}
                  {pricePerTicket === 0 ? "FREE" : `₹${pricePerTicket.toLocaleString("en-IN")}`}
                </span>
              </div>

              {/* Price Breakdown Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                <div className="rounded-xl bg-white/5 p-2 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Rate / Member</span>
                  <span className="font-bold text-white truncate block">
                    {pricePerTicket === 0 ? "FREE" : `₹${pricePerTicket.toLocaleString("en-IN")}`}
                  </span>
                </div>
                <div className="rounded-xl bg-white/5 p-2 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Convenience Fee</span>
                  <span className="font-bold text-emerald-400 block">₹0 (Waived)</span>
                </div>
                <div className="rounded-xl bg-white/5 p-2 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Verification Fee</span>
                  <span className="font-bold text-emerald-400 block">₹0 (Free)</span>
                </div>
              </div>

              {/* Grand Total Highlight */}
              <div className="pt-2 border-t border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Total Payable Amount</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Includes entry for {members.length}{" "}
                    {members.length === 1 ? "member" : "members"}
                  </span>
                </div>
                <div className="font-display text-xl sm:text-2xl font-black text-amber-400">
                  {totalAmount === 0 ? "FREE PASS" : `₹${totalAmount.toLocaleString("en-IN")}`}
                </div>
              </div>
            </div>

            {/* Primary Contact Details (Email & Phone for pass delivery) */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Primary Contact Details (For Pass Delivery)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <User className="h-3 w-3 text-amber-400" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.attendeeName}
                    onChange={(e) => {
                      handleInputChange("attendeeName", e.target.value);
                      handleMemberNameChange(0, e.target.value);
                    }}
                    placeholder="Jaydeep Sharma"
                    className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                      errors.attendeeName ? "border-rose-500" : "border-white/10"
                    }`}
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <Mail className="h-3 w-3 text-amber-400" />
                    <span>Email (Pass Delivery) *</span>
                  </label>
                  <input
                    type="email"
                    value={formData.attendeeEmail}
                    onChange={(e) => handleInputChange("attendeeEmail", e.target.value)}
                    placeholder="jaydeep@example.com"
                    className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                      errors.attendeeEmail ? "border-rose-500" : "border-white/10"
                    }`}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-amber-400" />
                    <span>Phone (SMS Pass) *</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.attendeePhone}
                    onChange={(e) => handleInputChange("attendeePhone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                      errors.attendeePhone ? "border-rose-500" : "border-white/10"
                    }`}
                  />
                </div>
              </div>
            </div>

            {apiError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span className="break-words">{apiError}</span>
              </div>
            )}

            {/* CLICK ON BOOK TICKETS BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                id="click-on-book-btn"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>
                  Book Tickets for {members.length} {members.length === 1 ? "Member" : "Members"} •
                  Total {totalAmount === 0 ? "FREE" : `₹${totalAmount.toLocaleString("en-IN")}`}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
