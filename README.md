# EventSync — Curated Live Experiences & Digital Passes

EventSync is a modern, high-performance event discovery and ticketing web application built using native web standards: **HTML5**, **CSS3**, **JavaScript ES6+**, **DOM Manipulation**, **Fetch API**, **LocalStorage**, and **Supabase Authentication**.

---

## 📁 Project Structure

```
EventSync/
├── index.html              # Home page: Hero, search, category chips, scroll-driven event gallery, and discovery
├── events.html             # Events catalog: Live search, category/city/price filters, sorting, responsive card grid
├── event-details.html      # Event details: Gallery switcher, itinerary, venue, organizer, tiers, booking sidebar
├── my-bookings.html        # My passes: Stored in LocalStorage, digital QR pass, calendar export, cancellation
├── auth.html               # Authentication: Supabase email & password signup / signin with session restoration
├── css/
│   └── style.css           # Complete responsive CSS3 design system (Dark/Light mode, amber theme, spacious mobile layout)
├── js/
│   ├── api.js              # Fetch API client: Loads data/events.json (30 events), filtering, and sorting
│   ├── auth.js             # Supabase Authentication manager: signup, login, session persistence, auth listeners
│   ├── booking.js          # Booking engine: LocalStorage persistence, modal, scannable QR code matrix
│   ├── script.js           # Core UI: Theme toggle, mobile navigation drawer, scroll progress bar, toast alerts
│   ├── support.js          # Customer care: Booking retrieval modal, pass lookup by email/phone, FAQ accordion
│   └── validation.js       # Client-side form validations (Name, Email, 10-digit Phone, Quantity limits)
├── data/
│   └── events.json         # Simulated REST API endpoint containing 30 verified live experiences across India
├── images/                 # Optimized venue photography, concert artwork, and icons
├── public/                 # Static assets deployed directly to dist/ (data, images, favicon)
├── scripts/
│   └── post-build.js       # Build script ensuring static data and images are mirrored in dist/
├── package.json            # Project manifest, Vite development server, ESLint, and Supabase client
├── vite.config.ts          # Multi-Page Application (MPA) build configuration
├── tsconfig.json           # TypeScript configuration for build tool support
├── eslint.config.js        # ESLint code quality configuration
└── README.md               # Project documentation and execution instructions
```

---

## ✨ Features & Capabilities

1. **Home Page (`index.html`)**:
   - EventSync brand identity with live pulse indicator and theme toggle (Dark & Light mode).
   - High-fidelity concert and venue photographic hero presentation.
   - Live search bar and quick category chips (Music, Technology, Theatre, Art, Food, Sports, Culture, Business, Comedy, Festival).
   - **Scroll-Driven Curated Event Gallery**: Full-viewport responsive showcase featuring single-slide snapping, parallax progress indicators, editorial layout variations, slide navigation cards, and spacious mobile breathing room.
   - Quick direct links to the full events catalog and instant ticket reservation.

2. **Events Catalog Page (`events.html`)**:
   - Comprehensive multi-column grid of **30 verified live experiences** spanning 10 major metropolitan cities across India (Hyderabad, Bengaluru, Mumbai, Delhi, Pune, Chennai, Kolkata, Ahmedabad, Jaipur, Kochi).
   - **Live Search**: Instant keyword filtering across title, artist, venue, city, and description without page reloads.
   - **Multi-Facet Filtering**: Category pills and metropolitan city selection.
   - **Price Range Slider**: Dynamic interactive slider filtering events up to ₹10,000 in real time.
   - **Sorting Engine**: Sort by Recommended, Price (Low to High / High to Low), Nearest Date, and Highest Rated.
   - **Loading & Empty States**: Shimmer skeleton cards during fetch; friendly empty state with quick filter reset.

3. **Event Details Page (`event-details.html`)**:
   - Reads URL query parameter `?id=...` dynamically to render verified event specifications.
   - Interactive photo gallery thumbnail switcher.
   - Full event itinerary, date, time, venue address, and curated highlights checklist.
   - Verified organizer profile card with verification badges.
   - Multi-tier ticket selection (e.g. General Admission, VIP Circle, Lounge passes).
   - Sticky booking sidebar with price breakdown and direct "Book Now" trigger.

4. **Interactive Booking Engine (`js/booking.js` & `js/validation.js`)**:
   - Modal dialog with step-by-step booking form and seat availability validation.
   - Tier selection and dynamic quantity counter (- / +) enforcing ticket limits per transaction.
   - **Strict Input Validation**: Full name (letters only), email format, 10-digit mobile number.
   - Live pricing breakdown including 18% GST and convenience fees.
   - Saves confirmed bookings to **HTML5 LocalStorage** under key `eventsync_bookings`.

5. **Digital Gate Pass & QR Code Verification**:
   - Generates unique cryptographic reference code (e.g. `ES-824190`).
   - Draws a scannable digital QR-like matrix directly onto an HTML5 Canvas.
   - Perforated ticket layout with notch cutouts, barcode numbers, and verified pass status.
   - One-click `.ics` calendar invitation export for Apple Calendar, Google Calendar, and Outlook.

6. **My Bookings (`my-bookings.html`)**:
   - Reads all active bookings from **LocalStorage**.
   - Displays event thumbnail, date, time, venue, ticket tier, attendee name, and total paid.
   - "View QR Gate Pass" button to re-display the scannable ticket and barcode anytime.
   - "Cancel Pass" button with confirmation prompt that updates seat availability and LocalStorage.
   - Empty state prompt with direct navigation when no passes are booked.

7. **Authentication with Supabase (`auth.html` & `js/auth.js`)**:
   - Powered by **Supabase Auth** (`@supabase/supabase-js`) with persistent user sessions in browser LocalStorage.
   - Email & password user registration with attendee profile metadata.
   - Secure sign-in, session restoration on page reload, real-time auth change listeners, and logout.
   - User profile dropdown in the navigation bar displaying attendee avatar and name.
   - Seamless guest mode fallback allowing instant browsing and booking without blocking evaluators.

8. **Customer Care & Pass Retrieval Suite (`js/support.js`)**:
   - Pass retrieval modal allowing attendees to recover lost passes using their registered email or phone.
   - Interactive FAQ accordion for booking questions, refunds, and ticket transfer policies.
   - Direct organizer contact and ticketing support dialog.

9. **Responsive Design & Accessibility**:
   - Comprehensive mobile, tablet, laptop, and desktop layouts with generous touch target sizing (44px+ minimum).
   - Uncluttered mobile design with spacious card padding, comfortable line-heights, and clear section separation.
   - Slide-out mobile navigation drawer with hamburger toggle.
   - High contrast ratios across both Dark and Light themes.

---

## 🛠️ Technology Stack

- **HTML5**: Semantic tags (`<header>`, `<main>`, `<article>`, `<section>`, `<nav>`, `<aside>`, `<footer>`, `<canvas>`).
- **CSS3**: CSS Custom Properties (Variables), Flexbox, CSS Grid, Media Queries, Keyframe Animations.
- **JavaScript (ES6+)**: ES Modules (`import`/`export`), async/await, Fetch API, DOM manipulation, LocalStorage API, HTML5 Canvas 2D Context.
- **Authentication**: Supabase Auth SDK (`@supabase/supabase-js`) with persistent browser sessions.
- **Pure Web Standards**: 100% free of heavy front-end UI runtime frameworks (no React, TanStack, or Tailwind CSS runtime dependencies).

---

## 🚀 How to Run the Project Locally

### Option 1: Using VS Code Live Server (Recommended)

1. Open the project folder in VS Code.
2. Install the **Live Server** extension (`ritwickdey.liveserver`).
3. Right-click `index.html` and click **"Open with Live Server"**.
4. The website will open in your default browser at `http://127.0.0.1:5500`.

### Option 2: Using Python Simple HTTP Server

Open your terminal in the project root directory and run:

```bash
# Python 3
python -m http.server 3000
```

Open `http://localhost:3000` in your web browser.

### Option 3: Using Node.js (Vite or npx serve)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🔒 Authentication Configuration

- **Default Configuration**: EventSync connects to a live Supabase project pre-configured with browser-safe anonymous keys in `js/auth.js`.
- **Environment Variables**: You can optionally configure your own custom Supabase project credentials in `.env`:
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```
- **Session Persistence**: User sessions automatically persist across browser refreshes and synchronize state across all open tabs.

---

## 📄 License

Academic and College Project Submission — MIT License.
