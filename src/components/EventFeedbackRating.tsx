import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Star,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Clock,
  Send,
  Edit3,
  CalendarCheck,
  ShieldCheck,
  Tag,
  AlertCircle,
} from "lucide-react";
import { EventItem, EventReview, UserProfile, Booking } from "../types";
import {
  isEventConcluded,
  getStoredEventReviews,
  saveEventReview,
  getUserReviewForEvent,
} from "../utils/storage";

interface EventFeedbackRatingProps {
  event: EventItem;
  currentUser?: UserProfile | null;
  userBookings?: Booking[];
  onReviewSubmitted?: (review: EventReview) => void;
}

const RATING_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: "Poor — Needs significant improvement", color: "text-rose-400" },
  2: { text: "Fair — Below expectations", color: "text-amber-400" },
  3: { text: "Good — Satisfactory experience", color: "text-amber-300" },
  4: { text: "Very Good — Thoroughly enjoyed it!", color: "text-emerald-400" },
  5: { text: "Outstanding — An unforgettable experience!", color: "text-amber-400" },
};

const SUGGESTED_TAGS = [
  "⚡ Seamless Entry",
  "🔊 Stellar Acoustics",
  "🎉 Electric Atmosphere",
  "👥 Amazing Crowd",
  "🍱 Great Food & Drinks",
  "🌟 Top Organization",
  "✨ Worth Every Rupee",
];

export const EventFeedbackRating: React.FC<EventFeedbackRatingProps> = ({
  event,
  currentUser,
  userBookings = [],
  onReviewSubmitted,
}) => {
  const eventConcluded = isEventConcluded(event.date);

  // Allow preview / test mode toggle if the event is upcoming
  const [simulateConcluded, setSimulateConcluded] = useState(false);
  const isEligibleToReview = eventConcluded || simulateConcluded;

  // Check if current user booked this event
  const matchingBooking = userBookings.find(
    (b) => b.eventId === event.id && b.status === "confirmed",
  );
  const isVerifiedAttendee = Boolean(matchingBooking);

  // Reviews state
  const [reviews, setReviews] = useState<EventReview[]>([]);
  const [existingUserReview, setExistingUserReview] = useState<EventReview | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reviewerName, setReviewerName] = useState<string>(currentUser?.name || "");
  const [reviewerEmail, setReviewerEmail] = useState<string>(currentUser?.email || "");
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [formError, setFormError] = useState<string>("");

  // Load reviews on mount and when event changes
  useEffect(() => {
    const loaded = getStoredEventReviews(event.id);
    setReviews(loaded);

    if (currentUser?.email) {
      const existing = getUserReviewForEvent(event.id, currentUser.email);
      setExistingUserReview(existing);
      if (existing) {
        setRating(existing.rating);
        setFeedback(existing.feedback);
        setSelectedTags(existing.tags || []);
        setReviewerName(existing.userName);
        setReviewerEmail(existing.userEmail);
      }
    }
  }, [event.id, currentUser?.email]);

  // Keep reviewer fields in sync with currentUser
  useEffect(() => {
    if (currentUser) {
      setReviewerName((prev) => prev || currentUser.name);
      setReviewerEmail((prev) => prev || currentUser.email);
    }
  }, [currentUser]);

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
    setFormError("");
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (rating === 0) {
      setFormError("Please select a star rating from 1 to 5.");
      return;
    }

    if (feedback.trim().length < 5) {
      setFormError("Please share at least a short sentence (5+ characters) about your experience.");
      return;
    }

    const name = reviewerName.trim() || currentUser?.name || "Event Attendee";
    const email =
      reviewerEmail.trim().toLowerCase() || currentUser?.email || "attendee@eventsync.app";

    const newReview: EventReview = {
      id: existingUserReview?.id || `rev-${event.id}-${Date.now()}`,
      eventId: event.id,
      userName: name,
      userEmail: email,
      rating,
      feedback: feedback.trim(),
      tags: selectedTags,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      verifiedAttendee: isVerifiedAttendee || Boolean(existingUserReview?.verifiedAttendee),
      bookingReference: matchingBooking?.id,
    };

    const updated = saveEventReview(newReview);
    setReviews(updated);
    setExistingUserReview(newReview);
    setIsEditing(false);
    setSubmittedSuccess(true);

    if (onReviewSubmitted) {
      onReviewSubmitted(newReview);
    }

    setTimeout(() => {
      setSubmittedSuccess(false);
    }, 4000);
  };

  const displayedRating = hoverRating || rating;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-white">
                Attendee Ratings & Feedback
              </h3>
              {eventConcluded ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <CalendarCheck className="h-3 w-3" />
                  Event Concluded
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  <Clock className="h-3 w-3" />
                  Upcoming Event
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {eventConcluded
                ? `Event took place on ${event.displayDate}. Attendees can share verified ratings & reviews.`
                : `Scheduled for ${event.displayDate}. Review form unlocks after the event date passes.`}
            </p>
          </div>
        </div>

        {/* Simulating / Testing toggle for upcoming events */}
        {!eventConcluded && (
          <button
            type="button"
            onClick={() => setSimulateConcluded((prev) => !prev)}
            className="self-start sm:self-center text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Toggle post-event review simulation to test the interactive star rating"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{simulateConcluded ? "Exit Test Mode" : "Test Star Rating"}</span>
          </button>
        )}
      </div>

      {/* Case 1: Event is Upcoming and user did not toggle test mode */}
      {!isEligibleToReview && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
          <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300 block">
              Rating & Reviews Unlock After Concluding
            </span>
            <p>
              To maintain authentic feedback, star ratings and attendee reviews open once the event
              date ({event.displayDate}) has passed.
            </p>
            <button
              type="button"
              onClick={() => setSimulateConcluded(true)}
              className="mt-1 text-amber-400 underline font-semibold hover:text-amber-300 cursor-pointer"
            >
              Click here to test the interactive star-rating component right now →
            </button>
          </div>
        </div>
      )}

      {/* Case 2: Event has Concluded (or preview mode active) -> Interactive Review Form */}
      {isEligibleToReview && (
        <div className="space-y-4">
          {/* Verified Attendee Callout */}
          {isVerifiedAttendee && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 text-xs text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Verified Attendee:</strong> You hold pass #{matchingBooking?.id}. Your
                review will feature a Verified Attendee badge!
              </span>
            </div>
          )}

          {/* If user already reviewed and is NOT currently editing: Show their review card */}
          {existingUserReview && !isEditing ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Your Submitted Review
                  </span>
                  {existingUserReview.verifiedAttendee && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified Attendee
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  id="btn-edit-user-review"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Feedback</span>
                </button>
              </div>

              {/* Star Display */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= existingUserReview.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-white">
                  {existingUserReview.rating} of 5 Stars
                </span>
                <span className="text-[11px] text-slate-400">
                  • Submitted on {existingUserReview.createdAt}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed italic bg-black/20 p-3 rounded-lg border border-white/5">
                &ldquo;{existingUserReview.feedback}&rdquo;
              </p>

              {existingUserReview.tags && existingUserReview.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {existingUserReview.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-medium bg-white/10 text-slate-200 px-2 py-0.5 rounded-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Interactive Star Rating Form */
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {existingUserReview ? "Update Your Event Rating" : "Leave Your Event Rating"}
                  </h4>
                  <p className="text-xs text-slate-400">
                    How was your experience at {event.title}?
                  </p>
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Interactive Stars Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Select Rating <span className="text-amber-400">*</span>
                </label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isFilled = starValue <= displayedRating;
                    return (
                      <motion.button
                        type="button"
                        key={starValue}
                        id={`star-rating-btn-${starValue}`}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleStarClick(starValue)}
                        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                          isFilled
                            ? "bg-amber-500/20 text-amber-400 shadow-sm shadow-amber-500/20"
                            : "bg-white/5 text-slate-500 hover:text-slate-300"
                        }`}
                        title={`${starValue} Star${starValue > 1 ? "s" : ""}`}
                        aria-label={`Rate ${starValue} of 5 stars`}
                      >
                        <Star
                          className={`h-6 w-6 sm:h-7 sm:w-7 transition-colors ${
                            isFilled ? "fill-amber-400 text-amber-400" : "fill-none"
                          }`}
                        />
                      </motion.button>
                    );
                  })}

                  <div className="ml-2 min-w-[140px]">
                    <span
                      className={`text-xs font-bold ${RATING_LABELS[displayedRating]?.color || "text-white"}`}
                    >
                      {displayedRating} / 5 Stars
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {RATING_LABELS[displayedRating]?.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Highlight Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-amber-400" />
                  <span>Highlight Tags (Optional)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "border-amber-400/60 bg-amber-500/20 text-amber-300"
                            : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Written Feedback Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="event-feedback-input"
                    className="text-xs font-semibold text-slate-300"
                  >
                    Your Feedback & Review <span className="text-amber-400">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500">{feedback.length}/500 chars</span>
                </div>
                <textarea
                  id="event-feedback-input"
                  value={feedback}
                  onChange={(e) => {
                    setFeedback(e.target.value);
                    if (formError) setFormError("");
                  }}
                  maxLength={500}
                  rows={3}
                  placeholder="Share details about the venue, sound quality, performances, hospitality, or suggestions for next time..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all resize-none"
                />
              </div>

              {/* Reviewer Name / Attribution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Your Display Name
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g., Alex M."
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Email (for verified pass match)
                  </label>
                  <input
                    type="email"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Action */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <motion.button
                  type="submit"
                  id="submit-event-review-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{existingUserReview ? "Update Feedback" : "Post Review"}</span>
                </motion.button>
              </div>
            </form>
          )}

          {/* Success Notification Banner */}
          <AnimatePresence>
            {submittedSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Thank you! Your verified rating and feedback have been published.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Community Reviews List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Verified Attendee Reviews ({reviews.length})
            </h4>
          </div>

          {reviews.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-bold text-white">
                {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
              </span>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-slate-400 space-y-1">
            <Star className="h-6 w-6 text-slate-600 mx-auto stroke-1" />
            <p className="font-semibold text-slate-300">No reviews published yet</p>
            <p className="text-[11px] text-slate-500">
              Be the first attendee to rate and review this experience!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-300 text-xs">
                      {rev.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{rev.userName}</span>
                        {rev.verifiedAttendee && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{rev.createdAt}</span>
                    </div>
                  </div>

                  {/* Stars for this review */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3 w-3 ${
                          s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">{rev.feedback}</p>

                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {rev.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] bg-white/5 text-slate-400 border border-white/5 px-2 py-0.5 rounded-md"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
