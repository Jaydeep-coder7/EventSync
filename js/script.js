/**
 * EventSync - Core Application Script
 * Manages responsive navigation, theme toggle, fluid particle background, and UI interactions
 */

import { getBookings } from "./booking.js";
import { initCustomerSupportTriggers } from "./support.js";
import { restoreSession, getCurrentUser, signOut, listenForAuthChanges } from "./auth.js";

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initMobileNav();
  initScrollProgress();
  initFluidParticlesBackground();
  highlightActiveNavLink();
  initSmartBackButtons();
  initCustomerSupportTriggers();

  // Restore session from Supabase
  await restoreSession();
  initNavbarAuth();
  initBookingBadge();

  // Listen for auth changes from Supabase
  listenForAuthChanges(() => {
    initNavbarAuth();
    initBookingBadge();
  });

  // Listen for custom auth events across components
  window.addEventListener("eventsync:auth-changed", () => {
    initNavbarAuth();
    initBookingBadge();
  });

  // Listen for booking updates across windows/components
  window.addEventListener("eventsync:booking-updated", () => {
    initBookingBadge();
  });
});

/**
 * Initializes and manages the Navbar User Profile and Dropdown
 */
export function initNavbarAuth() {
  const user = getCurrentUser();
  const navActions = document.querySelector(".nav-actions");
  const mobileDrawer = document.getElementById("mobile-nav-drawer");

  if (!navActions) return;

  // 1. Desktop Profile Menu
  let userWrap = document.getElementById("user-nav-profile-wrap");
  let guestBtn = document.getElementById("nav-guest-signin-btn");

  if (user) {
    if (guestBtn) guestBtn.remove();
    if (!userWrap) {
      userWrap = document.createElement("div");
      userWrap.id = "user-nav-profile-wrap";
      userWrap.className = "user-nav-dropdown-wrap";
      // Insert before theme toggle or first child of navActions
      navActions.insertBefore(userWrap, navActions.firstChild);
    }

    userWrap.innerHTML = `
      <button type="button" class="user-nav-btn" id="user-profile-menu-toggle" aria-expanded="false" aria-haspopup="true" title="Account Menu">
        <img src="${user.avatar}" alt="${user.name}" class="user-nav-avatar" />
        <span class="user-nav-greeting">Hi, <strong class="user-nav-name">${user.firstName}</strong></span>
        <span class="user-nav-arrow">▾</span>
      </button>
      <div class="user-nav-menu" id="user-nav-dropdown-menu" role="menu">
        <div class="user-menu-profile">
          <img src="${user.avatar}" alt="${user.name}" class="user-menu-avatar" />
          <div class="user-menu-info">
            <span class="user-menu-name">${user.name}</span>
            <span class="user-menu-email">${user.email}</span>
          </div>
        </div>
        <div class="user-menu-divider"></div>
        <a href="my-bookings.html" class="user-menu-link" role="menuitem">
          <span class="menu-icon">🎟️</span>
          <span>My Bookings</span>
        </a>
        <a href="events.html" class="user-menu-link" role="menuitem">
          <span class="menu-icon">🎪</span>
          <span>Explore Events</span>
        </a>
        <div class="user-menu-divider"></div>
        <button type="button" class="user-menu-link user-menu-logout" id="nav-logout-btn" role="menuitem">
          <span class="menu-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    `;

    // Dropdown toggle handler
    const toggleBtn = userWrap.querySelector("#user-profile-menu-toggle");
    const menu = userWrap.querySelector("#user-nav-dropdown-menu");

    toggleBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = menu?.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!userWrap.contains(e.target)) {
        menu?.classList.remove("open");
        toggleBtn?.setAttribute("aria-expanded", "false");
      }
    });

    // Logout trigger
    const logoutBtn = userWrap.querySelector("#nav-logout-btn");
    logoutBtn?.addEventListener("click", async () => {
      logoutBtn.innerHTML = `<span class="menu-icon">⏳</span><span>Logging out...</span>`;
      logoutBtn.disabled = true;
      await signOut();
      showToast("Signed out of EventSync.", "info");
      setTimeout(() => {
        window.location.replace("auth.html");
      }, 300);
    });
  } else {
    if (userWrap) userWrap.remove();
    // Only show Sign In button if not on auth page
    if (!window.location.pathname.includes("auth.html")) {
      if (!guestBtn) {
        guestBtn = document.createElement("a");
        guestBtn.id = "nav-guest-signin-btn";
        guestBtn.href = "auth.html";
        guestBtn.className = "btn-secondary btn-sm";
        guestBtn.textContent = "Sign In";
        navActions.insertBefore(guestBtn, navActions.firstChild);
      }
    }
  }

  // 2. Mobile Drawer User Section
  if (mobileDrawer) {
    let mobileUserCard = document.getElementById("mobile-user-card");
    if (user) {
      if (!mobileUserCard) {
        mobileUserCard = document.createElement("div");
        mobileUserCard.id = "mobile-user-card";
        mobileUserCard.className = "mobile-user-card";
        mobileDrawer.appendChild(mobileUserCard);
      }

      mobileUserCard.innerHTML = `
        <div class="mobile-user-info">
          <img src="${user.avatar}" alt="${user.name}" class="mobile-user-avatar" />
          <div class="mobile-user-details">
            <span class="mobile-user-name">${user.name}</span>
            <span class="mobile-user-email">${user.email}</span>
          </div>
        </div>
        <button type="button" class="mobile-logout-btn" id="mobile-drawer-logout-btn">
          <span>🚪</span> Logout
        </button>
      `;

      const mobileLogoutBtn = mobileUserCard.querySelector("#mobile-drawer-logout-btn");
      mobileLogoutBtn?.addEventListener("click", async () => {
        mobileLogoutBtn.innerHTML = `<span>⏳</span> Signing out...`;
        mobileLogoutBtn.disabled = true;
        await signOut();
        showToast("Signed out of EventSync.", "info");
        setTimeout(() => {
          window.location.replace("auth.html");
        }, 300);
      });
    } else {
      if (mobileUserCard) mobileUserCard.remove();
    }
  }
}

/**
 * Initializes interactive and reliable back buttons across all secondary pages
 */
export function initSmartBackButtons() {
  document
    .querySelectorAll(".btn-back, #global-back-btn, #smart-back-btn, [data-action='go-back']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const fallback =
          btn.getAttribute("data-fallback") ||
          (window.location.pathname.includes("event-details") ? "events.html" : "index.html");

        if (
          window.history.length > 1 &&
          document.referrer &&
          document.referrer.indexOf(window.location.host) !== -1
        ) {
          window.history.back();
        } else {
          window.location.href = fallback;
        }
      });
    });
}

/**
 * Updates the booking count badge in the navbar
 */
export function initBookingBadge() {
  const bookings = getBookings();
  const badges = document.querySelectorAll(".nav-booking-badge");
  badges.forEach((badge) => {
    if (bookings.length > 0) {
      badge.textContent = bookings.length;
      badge.style.display = "inline-flex";
    } else {
      badge.style.display = "none";
    }
  });
}

/**
 * Highlights active navigation link based on current path
 */
function highlightActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    if (
      (currentPath.endsWith(href) && href !== "#") ||
      (currentPath.endsWith("/") && (href === "index.html" || href === "/")) ||
      (currentPath === "" && href === "index.html")
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

/**
 * Scroll Progress Bar
 */
function initScrollProgress() {
  const bar = document.getElementById("scroll-progress-bar");
  if (!bar) return;

  window.addEventListener(
    "scroll",
    () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${scrolled}%`;
    },
    { passive: true },
  );
}

/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileNav() {
  const menuToggleBtn = document.getElementById("mobile-menu-toggle");
  const mobileNav = document.getElementById("mobile-nav-drawer");
  const overlay = document.getElementById("mobile-nav-overlay");

  if (!menuToggleBtn || !mobileNav) return;

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !mobileNav.classList.contains("open");
    if (isOpen) {
      mobileNav.classList.add("open");
      overlay?.classList.add("active");
      menuToggleBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    } else {
      mobileNav.classList.remove("open");
      overlay?.classList.remove("active");
      menuToggleBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  }

  menuToggleBtn.addEventListener("click", () => toggleMenu());
  overlay?.addEventListener("click", () => toggleMenu(false));

  // Close when clicking any nav link inside mobile drawer
  mobileNav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => toggleMenu(false));
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileNav.classList.contains("open")) {
      toggleMenu(false);
    }
  });

  // Auto-close on resize to tablet/desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768 && mobileNav.classList.contains("open")) {
      toggleMenu(false);
    }
  });
}

/**
 * Dark / Light Theme Manager
 */
function initTheme() {
  const themeToggleBtns = document.querySelectorAll(".theme-toggle-btn");
  const savedTheme = localStorage.getItem("eventsync_theme") || "dark";

  applyTheme(savedTheme);

  themeToggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const nextTheme = current === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("eventsync_theme", theme);

  const themeIcons = document.querySelectorAll(".theme-toggle-icon");
  themeIcons.forEach((icon) => {
    icon.textContent = theme === "dark" ? "☀️" : "🌙";
  });
}

/**
 * Floating Toast Notification
 * @param {string} message
 * @param {string} [type='info'] - 'info' | 'success' | 'error'
 */
export function showToast(message, type = "info") {
  let toastContainer = document.getElementById("eventsync-toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "eventsync-toast-container";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type} animate-slide-in`;
  toast.innerHTML = `
    <span class="toast-icon">${type === "success" ? "✓" : type === "error" ? "⚠️" : "ℹ️"}</span>
    <span class="toast-msg">${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/**
 * Interactive Fluid Particles Canvas Background
 * High-performance HTML5 Canvas simulation with Simplex Noise and interactive mouse deflection
 */
function initFluidParticlesBackground() {
  const canvas = document.getElementById("fluid-particles-canvas");
  if (!canvas) return;

  // Reduced, unobtrusive subtle background canvas - disabled to prevent AI-generated floating sparkle look
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.style.display = "none";
}
