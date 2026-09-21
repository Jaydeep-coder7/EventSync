/**
 * EventSync - Booking & Ticket Engine
 * Manages LocalStorage persistence, modal interactions, digital passes, and QR codes
 */

import { validateBookingForm } from "./validation.js";

const BOOKINGS_STORAGE_KEY = "eventsync_bookings";

/**
 * Retrieves all saved bookings from LocalStorage
 * @returns {Array} List of booking objects
 */
export function getBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error reading bookings from LocalStorage:", err);
    return [];
  }
}

/**
 * Saves a new booking to LocalStorage
 * @param {Object} booking
 * @returns {Object} Saved booking with assigned ID and timestamp
 */
export function saveBooking(booking) {
  const bookings = getBookings();
  const bookingId = "ES-" + Math.floor(100000 + Math.random() * 900000);
  const newBooking = {
    ...booking,
    bookingId,
    status: "Confirmed",
    createdAt: new Date().toISOString(),
  };

  bookings.unshift(newBooking);
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));

  // Dispatch custom event to notify other components/pages
  window.dispatchEvent(new CustomEvent("eventsync:booking-updated"));
  return newBooking;
}

/**
 * Cancels and removes a booking by ID
 * @param {string} bookingId
 * @returns {boolean} Success status
 */
export function cancelBooking(bookingId) {
  let bookings = getBookings();
  const initialLength = bookings.length;
  bookings = bookings.filter((b) => b.bookingId !== bookingId);

  if (bookings.length !== initialLength) {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    window.dispatchEvent(new CustomEvent("eventsync:booking-updated"));
    return true;
  }
  return false;
}

/**
 * Calculates pricing breakdown with GST and fees
 * @param {number} tierPrice - Base ticket price in INR
 * @param {number} quantity - Number of tickets
 * @returns {Object} Pricing breakdown
 */
export function calculatePricing(tierPrice, quantity) {
  const subtotal = tierPrice * quantity;
  const gst = Math.round(subtotal * 0.18); // 18% GST standard in India
  const convenienceFee = quantity * 40; // ₹40 per ticket service fee
  const total = subtotal + gst + convenienceFee;
  return {
    tierPrice,
    quantity,
    subtotal,
    gst,
    convenienceFee,
    total,
  };
}

/**
 * Draws a scannable digital QR-like matrix on a Canvas element
 * Uses clean high-contrast black/amber matrix with finder patterns
 */
export function drawQRCode(canvas, dataString) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width || 200;
  canvas.height = size;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Seeded pseudo-random generator based on dataString for consistent matrix
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    hash = (hash << 5) - hash + dataString.charCodeAt(i);
    hash |= 0;
  }

  const modules = 25; // 25x25 grid
  const cellSize = Math.floor(size / modules);
  const offset = Math.floor((size - cellSize * modules) / 2);

  ctx.fillStyle = "#0f172a"; // Deep slate for high contrast scannability

  // Finder pattern helper (top-left, top-right, bottom-left)
  function drawFinderPattern(startX, startY) {
    // 7x7 outer square
    ctx.fillRect(
      startX * cellSize + offset,
      startY * cellSize + offset,
      7 * cellSize,
      7 * cellSize,
    );
    // 5x5 white inner
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      (startX + 1) * cellSize + offset,
      (startY + 1) * cellSize + offset,
      5 * cellSize,
      5 * cellSize,
    );
    // 3x3 black center
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(
      (startX + 2) * cellSize + offset,
      (startY + 2) * cellSize + offset,
      3 * cellSize,
      3 * cellSize,
    );
  }

  // Draw 3 corner finder patterns
  drawFinderPattern(0, 0);
  drawFinderPattern(modules - 7, 0);
  drawFinderPattern(0, modules - 7);

  // Draw pseudo data cells (avoiding finder corners)
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= modules - 8;
      const inBottomLeft = r >= modules - 8 && c < 8;

      if (inTopLeft || inTopRight || inBottomLeft) continue;

      // Timing lines
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) {
          ctx.fillRect(
            c * cellSize + offset,
            r * cellSize + offset,
            cellSize - 0.5,
            cellSize - 0.5,
          );
        }
        continue;
      }

      // Compute cell value from data hash and coordinates
      const bit = Math.abs(Math.sin((hash + r * 37 + c * 17) * 1.345)) > 0.48;
      if (bit) {
        ctx.fillRect(c * cellSize + offset, r * cellSize + offset, cellSize - 0.5, cellSize - 0.5);
      }
    }
  }

  // Draw amber accent center dot
  const center = Math.floor(modules / 2);
  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(
    (center - 1) * cellSize + offset,
    (center - 1) * cellSize + offset,
    2 * cellSize,
    2 * cellSize,
  );
}

/**
 * Downloads a standard .ics calendar file for the booked event
 * @param {Object} booking
 */
export function downloadCalendarEvent(booking) {
  const eventDate = booking.date ? booking.date.replace(/-/g, "") : "20261018";
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EventSync//Live Digital Pass//EN",
    "BEGIN:VEVENT",
    `UID:${booking.bookingId}@eventsync.app`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART:${eventDate}T120000Z`,
    `DTEND:${eventDate}T180000Z`,
    `SUMMARY:${booking.eventTitle} (Pass: ${booking.bookingId})`,
    `DESCRIPTION:Pass Reference: ${booking.bookingId}\\nTicket Tier: ${booking.tierName}\\nSeats: ${booking.quantity}\\nVenue: ${booking.venue}, ${booking.city}`,
    `LOCATION:${booking.venue}, ${booking.city}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `EventSync-${booking.bookingId}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Opens the interactive Booking Modal for a given event
 * @param {Object} event - Event object
 * @param {string} [preselectedTierId] - Optional tier ID
 */
export function openBookingModal(event, preselectedTierId = null) {
  // Remove existing modal if any
  const existingModal = document.getElementById("eventsync-booking-modal-root");
  if (existingModal) existingModal.remove();

  const tiers = event.ticketTiers || [
    { id: "ga", name: "General Admission", price: event.price || 999, remaining: 100 },
  ];

  let currentTier = tiers.find((t) => t.id === preselectedTierId) || tiers[0];
  let currentQuantity = 1;

  const modalRoot = document.createElement("div");
  modalRoot.id = "eventsync-booking-modal-root";
  modalRoot.className = "modal-overlay active";

  function renderModalContent() {
    const pricing = calculatePricing(currentTier.price, currentQuantity);

    modalRoot.innerHTML = `
      <div class="modal-card animate-scale-up" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <!-- Modal Header -->
        <div class="modal-header">
          <div>
            <span class="badge-amber-sm">Instant Digital Pass</span>
            <h2 id="modal-title" class="modal-title">${event.title}</h2>
            <p class="modal-subtitle">
              <span>📅 ${event.displayDate || event.date}</span> • 
              <span>📍 ${event.venue}, ${event.city}</span>
            </p>
          </div>
          <button id="modal-close-btn" class="modal-close" aria-label="Close modal">&times;</button>
        </div>

        <!-- Modal Body / Form -->
        <form id="booking-form" class="modal-body" novalidate>
          <!-- 1. Select Ticket Tier -->
          <div class="form-group">
            <label class="form-label">Select Ticket Tier</label>
            <div class="tier-grid">
              ${tiers
                .map(
                  (tier) => `
                <div class="tier-card ${tier.id === currentTier.id ? "selected" : ""}" data-tier-id="${tier.id}">
                  <div class="tier-header">
                    <span class="tier-name">${tier.name}</span>
                    <span class="tier-price">₹${tier.price.toLocaleString("en-IN")}</span>
                  </div>
                  <p class="tier-desc">${tier.description || "Full access pass to the live event"}</p>
                  <span class="tier-remaining">${tier.remaining ? tier.remaining + " seats left" : "Filling fast"}</span>
                </div>
              `,
                )
                .join("")}
            </div>
            <span id="tier-error" class="form-error"></span>
          </div>

          <!-- 2. Quantity Selector -->
          <div class="form-group">
            <div class="quantity-row">
              <label class="form-label mb-0">Number of Passes</label>
              <div class="quantity-control">
                <button type="button" id="qty-minus" class="qty-btn" aria-label="Decrease passes">−</button>
                <span id="qty-display" class="qty-display">${currentQuantity}</span>
                <button type="button" id="qty-plus" class="qty-btn" aria-label="Increase passes">+</button>
              </div>
            </div>
            <span id="quantity-error" class="form-error"></span>
          </div>

          <!-- 3. Customer Details -->
          <div class="form-grid-2">
            <div class="form-group">
              <label for="booking-name" class="form-label">Full Name *</label>
              <input type="text" id="booking-name" class="form-input" placeholder="e.g. Aditi Sharma" required />
              <span id="name-error" class="form-error"></span>
            </div>

            <div class="form-group">
              <label for="booking-phone" class="form-label">Phone Number *</label>
              <input type="tel" id="booking-phone" class="form-input" placeholder="e.g. 9876543210" required />
              <span id="phone-error" class="form-error"></span>
            </div>
          </div>

          <div class="form-group">
            <label for="booking-email" class="form-label">Email Address (for Digital QR Pass) *</label>
            <input type="email" id="booking-email" class="form-input" placeholder="e.g. aditi.sharma@example.com" required />
            <span id="email-error" class="form-error"></span>
          </div>

          <!-- 4. Pricing Summary Box -->
          <div class="pricing-summary-box">
            <div class="price-row">
              <span>Passes (${currentQuantity} × ₹${currentTier.price.toLocaleString("en-IN")})</span>
              <span>₹${pricing.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div class="price-row">
              <span>GST & Venue Cess (18%)</span>
              <span>₹${pricing.gst.toLocaleString("en-IN")}</span>
            </div>
            <div class="price-row">
              <span>EventSync Secure Concierge</span>
              <span>₹${pricing.convenienceFee.toLocaleString("en-IN")}</span>
            </div>
            <div class="price-divider"></div>
            <div class="price-row total-row">
              <span class="font-bold">Total Payable</span>
              <span class="price-total">₹${pricing.total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="modal-footer">
            <button type="button" id="modal-cancel-btn" class="btn-secondary">Cancel</button>
            <button type="submit" id="modal-submit-btn" class="btn-primary">
              <span>Confirm & Generate Digital Pass</span>
              <span>₹${pricing.total.toLocaleString("en-IN")} →</span>
            </button>
          </div>
        </form>
      </div>
    `;

    // Attach Event Listeners
    attachModalEvents();
  }

  function attachModalEvents() {
    // Close button
    modalRoot
      .querySelector("#modal-close-btn")
      ?.addEventListener("click", () => modalRoot.remove());
    modalRoot
      .querySelector("#modal-cancel-btn")
      ?.addEventListener("click", () => modalRoot.remove());

    // Click outside to close
    modalRoot.addEventListener("click", (e) => {
      if (e.target === modalRoot) modalRoot.remove();
    });

    // Tier selection
    modalRoot.querySelectorAll(".tier-card").forEach((card) => {
      card.addEventListener("click", () => {
        const tierId = card.getAttribute("data-tier-id");
        currentTier = tiers.find((t) => t.id === tierId) || currentTier;
        renderModalContent();
      });
    });

    // Quantity buttons
    const minusBtn = modalRoot.querySelector("#qty-minus");
    const plusBtn = modalRoot.querySelector("#qty-plus");

    minusBtn?.addEventListener("click", () => {
      if (currentQuantity > 1) {
        currentQuantity--;
        renderModalContent();
      }
    });

    plusBtn?.addEventListener("click", () => {
      const maxAllowed = Math.min(currentTier.remaining || 10, 10);
      if (currentQuantity < maxAllowed) {
        currentQuantity++;
        renderModalContent();
      }
    });

    // Form Submission with Validation
    const form = modalRoot.querySelector("#booking-form");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = modalRoot.querySelector("#booking-name");
      const emailInput = modalRoot.querySelector("#booking-email");
      const phoneInput = modalRoot.querySelector("#booking-phone");

      const formData = {
        fullName: nameInput?.value || "",
        email: emailInput?.value || "",
        phone: phoneInput?.value || "",
        quantity: currentQuantity,
        tierId: currentTier.id,
      };

      const maxAvailable = currentTier.remaining || 10;
      const validation = validateBookingForm(formData, maxAvailable);

      // Clear previous error messages
      modalRoot.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
      modalRoot.querySelectorAll(".form-input").forEach((el) => el.classList.remove("error"));

      if (!validation.isValid) {
        if (validation.errors.fullName) {
          const errEl = modalRoot.querySelector("#name-error");
          if (errEl) errEl.textContent = validation.errors.fullName;
          nameInput?.classList.add("error");
        }
        if (validation.errors.email) {
          const errEl = modalRoot.querySelector("#email-error");
          if (errEl) errEl.textContent = validation.errors.email;
          emailInput?.classList.add("error");
        }
        if (validation.errors.phone) {
          const errEl = modalRoot.querySelector("#phone-error");
          if (errEl) errEl.textContent = validation.errors.phone;
          phoneInput?.classList.add("error");
        }
        if (validation.errors.quantity) {
          const errEl = modalRoot.querySelector("#quantity-error");
          if (errEl) errEl.textContent = validation.errors.quantity;
        }
        return;
      }

      // Save Booking to LocalStorage
      const pricing = calculatePricing(currentTier.price, currentQuantity);
      const bookingRecord = {
        eventId: event.id,
        eventTitle: event.title,
        eventImage: event.image,
        category: event.category,
        date: event.date,
        displayDate: event.displayDate || event.date,
        time: event.time,
        venue: event.venue,
        city: event.city,
        address: event.address || event.venue,
        tierId: currentTier.id,
        tierName: currentTier.name,
        quantity: currentQuantity,
        customerName: formData.fullName.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),
        pricing,
      };

      const savedBooking = saveBooking(bookingRecord);

      // Transition to Digital Pass Confirmation
      showConfirmationModal(savedBooking);
    });
  }

  document.body.appendChild(modalRoot);
  renderModalContent();
}

/**
 * Displays the Digital Gate Pass Confirmation Modal with Scannable QR Code
 * @param {Object} booking
 */
export function showConfirmationModal(booking) {
  const existingModal = document.getElementById("eventsync-booking-modal-root");
  if (existingModal) existingModal.remove();

  const confirmRoot = document.createElement("div");
  confirmRoot.id = "eventsync-booking-modal-root";
  confirmRoot.className = "modal-overlay active";

  confirmRoot.innerHTML = `
    <div class="modal-card pass-confirmation-card animate-scale-up" role="dialog" aria-modal="true">
      <div class="confetti-banner">
        <span class="badge-success">✓ Booking Confirmed & Verified</span>
        <h2 class="conf-title">Your Live Pass is Ready!</h2>
        <p class="conf-subtitle">Present this verified gate pass or QR code at venue entry.</p>
      </div>

      <!-- Ticket Pass Body -->
      <div class="digital-pass-container">
        <div class="pass-top">
          <div class="pass-event-info">
            <span class="pass-category">${booking.category || "Live Event"}</span>
            <h3 class="pass-title">${booking.eventTitle}</h3>
            <p class="pass-meta">📅 ${booking.displayDate || booking.date} • ⏰ ${booking.time}</p>
            <p class="pass-venue">📍 ${booking.venue}, ${booking.city}</p>
          </div>
          <div class="pass-qr-box">
            <canvas id="pass-qr-canvas" width="140" height="140"></canvas>
            <span class="pass-code">${booking.bookingId}</span>
          </div>
        </div>

        <div class="pass-divider">
          <span class="punch-hole left"></span>
          <span class="dashed-line"></span>
          <span class="punch-hole right"></span>
        </div>

        <div class="pass-bottom">
          <div class="pass-detail-cell">
            <span class="cell-label">Attendee</span>
            <span class="cell-value">${booking.customerName}</span>
          </div>
          <div class="pass-detail-cell">
            <span class="cell-label">Pass Tier</span>
            <span class="cell-value text-amber">${booking.tierName}</span>
          </div>
          <div class="pass-detail-cell">
            <span class="cell-label">Passes</span>
            <span class="cell-value">${booking.quantity} Ticket(s)</span>
          </div>
          <div class="pass-detail-cell">
            <span class="cell-label">Total Paid</span>
            <span class="cell-value text-gold">₹${booking.pricing.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="confirmation-actions">
        <button id="download-ics-btn" class="btn-secondary">
          <span>📅 Add to Calendar (.ics)</span>
        </button>
        <a href="my-bookings.html" class="btn-primary">
          <span>Go to My Bookings →</span>
        </a>
      </div>
      <button id="close-conf-btn" class="btn-text">Close Window</button>
    </div>
  `;

  document.body.appendChild(confirmRoot);

  // Render QR Code onto Canvas
  const qrCanvas = confirmRoot.querySelector("#pass-qr-canvas");
  if (qrCanvas) {
    drawQRCode(
      qrCanvas,
      `EVENTSYNC:${booking.bookingId}:${booking.eventId}:${booking.customerEmail}`,
    );
  }

  // Event Listeners
  confirmRoot
    .querySelector("#close-conf-btn")
    ?.addEventListener("click", () => confirmRoot.remove());
  confirmRoot
    .querySelector("#download-ics-btn")
    ?.addEventListener("click", () => downloadCalendarEvent(booking));
  confirmRoot.addEventListener("click", (e) => {
    if (e.target === confirmRoot) confirmRoot.remove();
  });
}

/**
 * Displays an in-app confirmation modal for cancelling a booking pass
 * Prevents issues where browser window.confirm is suppressed by iframe sandboxing
 * @param {Object} booking - Booking object to cancel
 * @param {Function} onConfirm - Callback on confirmed cancellation
 */
export function promptCancelBooking(booking, onConfirm) {
  const existingModal = document.getElementById("eventsync-cancel-modal-root");
  if (existingModal) existingModal.remove();

  const cancelRoot = document.createElement("div");
  cancelRoot.id = "eventsync-cancel-modal-root";
  cancelRoot.className = "modal-overlay active";

  cancelRoot.innerHTML = `
    <div class="cancel-modal-card animate-scale-up" role="alertdialog" aria-modal="true" aria-labelledby="cancel-modal-title" aria-describedby="cancel-modal-desc">
      <div class="cancel-modal-header">
        <div class="cancel-modal-icon">⚠️</div>
        <div>
          <span class="badge-amber-sm" style="color: var(--error); border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.1);">Confirm Action</span>
          <h3 id="cancel-modal-title" class="cancel-modal-title">Cancel Event Pass?</h3>
        </div>
      </div>

      <p id="cancel-modal-desc" class="cancel-modal-desc">
        Are you sure you want to cancel this booking? This will revoke your digital gate pass and release your reserved seats.
      </p>

      <div class="cancel-modal-event-box">
        <div style="font-weight: 700; font-size: 1rem; color: var(--text-main); margin-bottom: 0.25rem;">
          ${booking.eventTitle}
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; justify-content: space-between;">
          <span>Pass: <strong style="color: var(--accent-amber);">${booking.bookingId}</strong></span>
          <span>${booking.quantity}x ${booking.tierName}</span>
        </div>
      </div>

      <div class="cancel-modal-actions">
        <button type="button" id="abort-cancel-btn" class="btn-secondary" style="padding: 0.55rem 1.25rem;">
          Keep Pass
        </button>
        <button type="button" id="confirm-cancel-btn" class="btn-primary" style="background: var(--error); border-color: var(--error); padding: 0.55rem 1.25rem;">
          Yes, Cancel Pass
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(cancelRoot);

  const close = () => cancelRoot.remove();

  cancelRoot.querySelector("#abort-cancel-btn")?.addEventListener("click", close);
  cancelRoot.addEventListener("click", (e) => {
    if (e.target === cancelRoot) close();
  });

  cancelRoot.querySelector("#confirm-cancel-btn")?.addEventListener("click", () => {
    close();
    if (typeof onConfirm === "function") {
      onConfirm();
    }
  });
}

