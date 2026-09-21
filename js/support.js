/**
 * EventSync - Customer Service & Fan Support System
 * Provides 24/7 ticket assistance, pass retrieval, FAQ help, and concierge modal
 */

import { getBookings } from "./booking.js";
import { showToast } from "./script.js";

/**
 * Opens the interactive Customer Service Modal
 * @param {string} defaultTab - 'help' | 'retrieval' | 'contact'
 */
export function openCustomerSupportModal(defaultTab = "help") {
  const existing = document.getElementById("eventsync-support-modal-root");
  if (existing) existing.remove();

  const modalRoot = document.createElement("div");
  modalRoot.id = "eventsync-support-modal-root";
  modalRoot.className = "modal-overlay active";

  modalRoot.innerHTML = `
    <div class="modal-card animate-scale-up" role="dialog" aria-modal="true" style="max-width: 680px;">
      <!-- Modal Header -->
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <button type="button" class="btn-back" id="support-modal-back-btn" aria-label="Back" style="padding: 0.4rem 0.85rem; font-size: 0.85rem;">
            <span class="back-arrow" style="width: 1.35rem; height: 1.35rem; font-size: 0.95rem;">←</span>
            <span>Back</span>
          </button>
          <div>
            <span class="badge-amber-sm">24/7 Dedicated Care</span>
            <h2 class="modal-title" style="font-size: 1.35rem;">Customer Service & Support</h2>
          </div>
        </div>
        <button id="support-modal-close-btn" class="modal-close" aria-label="Close modal">&times;</button>
      </div>

      <!-- Support Body -->
      <div class="modal-body" style="padding: 1.5rem 1.75rem;">
        <!-- Channels Strip -->
        <div class="support-channel-list">
          <div class="support-channel-item">
            <span class="support-channel-icon">📞</span>
            <div>
              <div class="support-channel-label">Toll Free Helpline</div>
              <div class="support-channel-val">+91 1800-202-SYNC</div>
            </div>
          </div>
          <div class="support-channel-item">
            <span class="support-channel-icon">✉️</span>
            <div>
              <div class="support-channel-label">Official Care Email</div>
              <div class="support-channel-val">support@eventsync.in</div>
            </div>
          </div>
        </div>

        <!-- Tab Selector -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
          <button type="button" class="filter-btn ${defaultTab === "help" ? "active" : ""}" id="tab-btn-help">Quick Assistance</button>
          <button type="button" class="filter-btn ${defaultTab === "retrieval" ? "active" : ""}" id="tab-btn-retrieval">Instant Pass Retrieval</button>
          <button type="button" class="filter-btn ${defaultTab === "contact" ? "active" : ""}" id="tab-btn-contact">Raise Ticket</button>
        </div>

        <!-- TAB 1: Quick FAQ & Guidelines -->
        <div id="tab-pane-help" style="${defaultTab === "help" ? "display: block;" : "display: none;"}">
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div class="tier-card" style="padding: 1rem 1.25rem;">
              <h4 style="font-size: 0.98rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--accent-amber);">🎟️ How do I enter the venue with my digital pass?</h4>
              <p style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.5;">
                Simply show the QR code from your <strong>My Passes</strong> page or confirmation screen at the entry gate. No physical printout is needed. Offline screenshots are also accepted.
              </p>
            </div>

            <div class="tier-card" style="padding: 1rem 1.25rem;">
              <h4 style="font-size: 0.98rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--accent-amber);">💳 What is EventSync's refund policy?</h4>
              <p style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.5;">
                Full refunds are granted automatically if an event is rescheduled or cancelled by the organizer. Attendees can also cancel passes directly in the My Passes dashboard up to 24 hours prior to showtime.
              </p>
            </div>

            <div class="tier-card" style="padding: 1rem 1.25rem;">
              <h4 style="font-size: 0.98rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--accent-amber);">♿ Accessibility & Box Office Inquiries</h4>
              <p style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.5;">
                All featured venues are wheelchair accessible and have dedicated priority gates. For companion passes or parking clearance, contact our helpline at +91 1800-202-SYNC.
              </p>
            </div>
          </div>
        </div>

        <!-- TAB 2: Instant Pass Retrieval -->
        <div id="tab-pane-retrieval" style="${defaultTab === "retrieval" ? "display: block;" : "display: none;"}">
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem;">
            Lost track of your confirmed pass? Enter your registered email address below to scan and retrieve your active passes immediately.
          </p>
          <form id="pass-retrieval-form" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="form-group">
              <label for="retrieval-email" class="form-label">Registered Attendee Email</label>
              <input type="email" id="retrieval-email" class="form-input" placeholder="e.g. aditi.sharma@example.com" required />
            </div>
            <button type="submit" class="btn-primary" style="align-self: flex-start;">
              <span>🔍 Scan & Retrieve My Passes</span>
            </button>
          </form>
          <div id="retrieval-results" style="margin-top: 1.25rem;"></div>
        </div>

        <!-- TAB 3: Raise a Ticket / Contact Support -->
        <div id="tab-pane-contact" style="${defaultTab === "contact" ? "display: block;" : "display: none;"}">
          <form id="support-ticket-form" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="form-grid-2">
              <div class="form-group">
                <label for="ticket-name" class="form-label">Full Name *</label>
                <input type="text" id="ticket-name" class="form-input" placeholder="Your name" required />
              </div>
              <div class="form-group">
                <label for="ticket-email" class="form-label">Email Address *</label>
                <input type="email" id="ticket-email" class="form-input" placeholder="name@domain.com" required />
              </div>
            </div>

            <div class="form-group">
              <label for="ticket-issue" class="form-label">Issue Category</label>
              <select id="ticket-issue" class="form-select">
                <option value="Gate Entry & QR Scanning">Gate Entry & QR Scanning Inquiry</option>
                <option value="Refund & Cancellation">Refund & Cancellation Request</option>
                <option value="Ticket Tier Upgrade">Ticket Tier / Seating Question</option>
                <option value="Venue Accessibility & Parking">Venue Accessibility & Parking</option>
                <option value="Other">Other General Inquiry</option>
              </select>
            </div>

            <div class="form-group">
              <label for="ticket-message" class="form-label">Details / Booking Reference</label>
              <textarea id="ticket-message" class="form-input" rows="3" placeholder="Describe your question or provide booking ID (e.g. ES-123456)..." required style="resize: vertical;"></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
              <button type="button" id="ticket-cancel-btn" class="btn-secondary">Close</button>
              <button type="submit" class="btn-primary">
                <span>Submit to Customer Support →</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalRoot);

  // Tab switching logic
  const tabs = {
    help: modalRoot.querySelector("#tab-btn-help"),
    retrieval: modalRoot.querySelector("#tab-btn-retrieval"),
    contact: modalRoot.querySelector("#tab-btn-contact"),
  };
  const panes = {
    help: modalRoot.querySelector("#tab-pane-help"),
    retrieval: modalRoot.querySelector("#tab-pane-retrieval"),
    contact: modalRoot.querySelector("#tab-pane-contact"),
  };

  function switchTab(selectedKey) {
    Object.keys(tabs).forEach((k) => {
      if (k === selectedKey) {
        tabs[k]?.classList.add("active");
        if (panes[k]) panes[k].style.display = "block";
      } else {
        tabs[k]?.classList.remove("active");
        if (panes[k]) panes[k].style.display = "none";
      }
    });
  }

  tabs.help?.addEventListener("click", () => switchTab("help"));
  tabs.retrieval?.addEventListener("click", () => switchTab("retrieval"));
  tabs.contact?.addEventListener("click", () => switchTab("contact"));

  // Back & Close buttons
  const close = () => modalRoot.remove();
  modalRoot.querySelector("#support-modal-back-btn")?.addEventListener("click", close);
  modalRoot.querySelector("#support-modal-close-btn")?.addEventListener("click", close);
  modalRoot.querySelector("#ticket-cancel-btn")?.addEventListener("click", close);
  modalRoot.addEventListener("click", (e) => {
    if (e.target === modalRoot) close();
  });

  // Handle Pass Retrieval Form
  const retrievalForm = modalRoot.querySelector("#pass-retrieval-form");
  const retrievalResults = modalRoot.querySelector("#retrieval-results");
  retrievalForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = modalRoot.querySelector("#retrieval-email")?.value.trim().toLowerCase();
    if (!email) return;

    const allBookings = getBookings();
    const matches = allBookings.filter((b) => b.customerEmail?.toLowerCase() === email);

    if (matches.length > 0) {
      retrievalResults.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--success); border-radius: var(--radius-md); padding: 1rem;">
          <div style="font-weight: 700; color: var(--success); margin-bottom: 0.5rem;">✓ Found ${matches.length} Confirmed Pass(es) for ${email}</div>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.88rem;">
            ${matches
              .map(
                (m) => `
              <li style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm);">
                <span><strong>${m.eventTitle}</strong> (${m.bookingId}) - ${m.quantity} ticket(s)</span>
                <a href="my-bookings.html" class="btn-secondary btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">View Pass</a>
              </li>
            `,
              )
              .join("")}
          </ul>
        </div>
      `;
      showToast(`Retrieved ${matches.length} booking pass(es)!`, "success");
    } else {
      retrievalResults.innerHTML = `
        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid var(--border-amber); border-radius: var(--radius-md); padding: 1rem; font-size: 0.88rem; color: var(--text-muted);">
          No passes currently stored under <strong>${email}</strong> in this browser session. If you recently booked, make sure you used this exact email or check <a href="my-bookings.html" style="color: var(--accent-amber); font-weight: 600;">My Passes</a>.
        </div>
      `;
    }
  });

  // Handle Support Ticket Submission
  const ticketForm = modalRoot.querySelector("#support-ticket-form");
  ticketForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const ticketId = "SYNC-" + Math.floor(100000 + Math.random() * 900000);
    const category = modalRoot.querySelector("#ticket-issue")?.value;

    showToast(
      `Support Ticket #${ticketId} created! Our care team will reply within 5 mins.`,
      "success",
    );

    modalRoot.querySelector("#tab-pane-contact").innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem;">
        <div style="font-size: 3rem; margin-bottom: 0.75rem;">📨</div>
        <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.5rem;">Ticket #${ticketId} Logged!</h3>
        <p style="color: var(--text-muted); font-size: 0.92rem; max-width: 440px; margin: 0 auto 1.5rem;">
          Your inquiry regarding <strong>${category}</strong> has been routed to our live dispatch desk. An automated copy has been sent to your email.
        </p>
        <button type="button" class="btn-primary" id="support-done-btn">Back to EventSync</button>
      </div>
    `;

    modalRoot.querySelector("#support-done-btn")?.addEventListener("click", close);
  });
}

/**
 * Initializes click handlers on all Customer Support trigger buttons
 */
export function initCustomerSupportTriggers() {
  document.querySelectorAll(".open-support-modal, [data-action='open-support']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = btn.getAttribute("data-tab") || "help";
      openCustomerSupportModal(tab);
    });
  });
}
