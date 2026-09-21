/**
 * EventSync - Core Application Script
 * Manages responsive navigation, theme toggle, fluid particle background, and UI interactions
 */

import { getBookings } from "./booking.js";
import { initCustomerSupportTriggers } from "./support.js";

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMobileNav();
  initScrollProgress();
  initBookingBadge();
  initFluidParticlesBackground();
  highlightActiveNavLink();
  initSmartBackButtons();
  initCustomerSupportTriggers();

  // Listen for booking updates across windows/components
  window.addEventListener("eventsync:booking-updated", () => {
    initBookingBadge();
  });
});

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

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Resize handler
  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Mouse interaction state
  const mouse = {
    x: width / 2,
    y: height / 2,
    vx: 0,
    vy: 0,
    prevX: width / 2,
    prevY: height / 2,
    radius: 120,
    active: false,
  };

  window.addEventListener("mousemove", (e) => {
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.vx = (mouse.x - mouse.prevX) * 0.5;
    mouse.vy = (mouse.y - mouse.prevY) * 0.5;
    mouse.active = true;
  });

  window.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  // Particle color palette (Amber, Golden Embers, Neon Magenta, Electric Cyan, Stardust)
  const colors = [
    { r: 245, g: 158, b: 11, a: 0.85 }, // Amber 500
    { r: 251, g: 191, b: 36, a: 0.8 }, // Amber 400
    { r: 217, g: 119, b: 6, a: 0.75 }, // Amber 600
    { r: 244, g: 63, b: 94, a: 0.7 }, // Rose / Neon Magenta
    { r: 14, g: 165, b: 233, a: 0.75 }, // Electric Cyan
    { r: 254, g: 243, b: 199, a: 0.9 }, // Stardust Gold
  ];

  const particleCount = Math.min(Math.floor((width * height) / 4500), 220);
  const particles = [];

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = -Math.random() * 0.8 - 0.2;
      this.size = Math.random() * 2.2 + 0.8;
      this.baseAlpha = Math.random() * 0.5 + 0.35;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.life = Math.random() * 300 + 150;
      this.age = 0;
      this.isGlow = Math.random() > 0.75;
    }

    update() {
      this.age++;
      if (this.age > this.life || this.y < -20 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }

      // Continuous gentle drift
      this.x += this.vx;
      this.y += this.vy;

      // Mouse deflection & swirl
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * 1.5;
          const angle = Math.atan2(dy, dx);
          // Radial push + swirl
          this.x += Math.cos(angle) * force * 2.5 - Math.sin(angle) * force * 1.5;
          this.y += Math.sin(angle) * force * 2.5 + Math.cos(angle) * force * 1.5;
        }
      }
    }

    draw() {
      const alphaProgress = Math.sin((this.age / this.life) * Math.PI);
      const currentAlpha = this.baseAlpha * alphaProgress;
      const { r, g, b } = this.color;

      if (this.isGlow) {
        const glowRad = this.size * 3.5;
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRad);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.9})`);
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.3})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowRad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core particle dot
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentAlpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Animation Loop
  let animationId;
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting constellation filaments between close particles
    const maxDist = 70;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const filamentAlpha = (1 - dist / maxDist) * 0.15;
          ctx.strokeStyle = `rgba(245, 158, 11, ${filamentAlpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // Update & draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    animationId = requestAnimationFrame(animate);
  }

  animate();
}
