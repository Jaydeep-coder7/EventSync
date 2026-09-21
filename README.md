# EventSync — Curated Live Experiences & Digital Passes

EventSync is a modern, high-performance event discovery and ticketing web application built using traditional web standards: **HTML5**, **CSS3**, **JavaScript ES6+**, **DOM Manipulation**, **Fetch API**, and **LocalStorage**.

---

## 📁 Target Project Structure

```
EventSync/
├── index.html              # Home page: Hero, search, category chips, featured events, CTA
├── events.html             # Events catalog: Live search, category/city/price filters, sorting
├── event-details.html      # Event details: Gallery, description, schedule, organizer, tiers
├── my-bookings.html        # My passes: Stored in LocalStorage, digital QR pass, calendar export
├── css/
│   └── style.css           # Complete responsive CSS3 design system (Dark/Light mode, luxury theme)
├── js/
│   ├── script.js           # Core UI: Theme toggle, mobile hamburger menu, fluid particle background
│   ├── api.js              # Fetch API client: Loads data/events.json, filtering, and sorting
│   ├── booking.js          # Booking engine: LocalStorage persistence, modal, scannable QR code
│   ├── validation.js       # Client-side form validations (Name, Email, Phone, Quantity)
│   └── auth.js             # Session & guest authentication manager
├── data/
│   └── events.json         # Simulated REST API endpoint containing 16 verified events
├── images/                 # Image assets and icons
└── README.md               # Documentation and execution instructions
```

---

## ✨ Features & Assignment Capabilities

1. **Home Page (`index.html`)**:
   - EventSync brand identity with live pulse indicator.
   - Interactive Hero section with animated stage background and HTML5 Canvas fluid particle field.
   - Live search bar and quick category chips (Music, Technology, Food & Drink, Arts & Theatre, Sports).
   - Dynamically rendered Featured Events grid loaded via standard **Fetch API**.
   - "Explore Events" button linking to the catalog and instant "Book Now" CTAs.

2. **Events Catalog Page (`events.html`)**:
   - Responsive multi-column grid of verified event cards.
   - **Live Search**: Instant keyword filtering across title, artist, venue, city, and description without page reload.
   - **Category & City Filtering**: Single-click category filters and metropolitan city selection.
   - **Price Range Slider**: Dynamic interactive slider filtering events up to ₹10,000.
   - **Sorting Engine**: Sort by Price (Low to High / High to Low), Nearest Date, and Highest Rated.
   - **Loading & Empty States**: Shimmer skeleton cards during fetch; friendly empty state with filter reset.

3. **Event Details Page (`event-details.html`)**:
   - Reads URL query parameter `?id=...` dynamically.
   - Interactive photo gallery thumbnail switcher.
   - Full event itinerary, date, time, venue address, and curated highlights checklist.
   - Verified organizer profile card with verified badge.
   - Available ticket tiers (General Admission, VIP Circle, Lounge).
   - Sticky booking sidebar with price breakdown and "Book Now" trigger.

4. **Interactive Booking Engine (`js/booking.js` & `js/validation.js`)**:
   - Modal dialog with step-by-step booking form.
   - Tier selection and quantity counter (- / +) with seat availability validation.
   - **Input Validation**: Full name (letters only), email format, 10-digit phone number.
   - Live pricing calculation including 18% GST and convenience fees.
   - Saves confirmed bookings to **HTML5 LocalStorage** under key `eventsync_bookings`.

5. **Digital Gate Pass & QR Code Verification**:
   - Generates unique reference code (e.g. `ES-824190`).
   - Draws a scannable digital QR-like matrix directly onto an HTML5 Canvas.
   - Perforated ticket layout with notch cutouts.
   - One-click `.ics` calendar invitation download.

6. **My Bookings (`my-bookings.html`)**:
   - Reads all active bookings from **LocalStorage**.
   - Displays event thumbnail, date, time, venue, ticket tier, attendee name, and total paid.
   - "View QR Gate Pass" button to re-display the scannable ticket.
   - "Cancel Pass" button with confirmation prompt that updates LocalStorage.
   - Empty state prompt when no passes are currently booked.

7. **Responsive Design & Accessibility**:
   - Mobile, tablet, laptop, and desktop layouts.
   - Animated mobile navigation drawer with hamburger toggle.
   - Dark / Light mode toggle persisted in `localStorage`.
   - Touch targets designed to adhere to 44px+ guidelines.

---

## 🛠️ Technology Stack

- **HTML5**: Semantic tags (`<header>`, `<main>`, `<article>`, `<section>`, `<nav>`, `<aside>`, `<footer>`, `<canvas>`).
- **CSS3**: CSS Custom Properties (Variables), Flexbox, CSS Grid, Media Queries, Keyframe Animations.
- **JavaScript (ES6+)**: ES Modules (`import`/`export`), async/await, Fetch API, DOM manipulation, LocalStorage API, Canvas 2D Context.
- **No Framework Dependencies**: 100% free of React, React DOM, or TypeScript runtime dependencies.

---

## 🚀 How to Run the Project Locally

### Option 1: Using VS Code Live Server (Easiest)
1. Open the project folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and click **"Open with Live Server"**.
4. The website will open in your default browser at `http://127.0.0.1:5500`.

### Option 2: Using Python Simple HTTP Server
Open your terminal in the project root directory and run:
```bash
# Python 3
python -m http.server 3000
```
Open `http://localhost:3000` in your web browser.

### Option 3: Using Node.js (npx serve or npm)
```bash
# Using npx serve
npx serve . -l 3000

# OR using npm dev script
npm run dev
```

---

## 🔒 Authentication & Supabase Notes

- This project is configured with a frictionless **Local Session Manager** (`js/auth.js`) that persists guest attendees and booking profiles in `localStorage`.
- This ensures any evaluator or student can test all booking and gate pass workflows immediately without requiring external API keys.
- If you wish to connect real Supabase Auth, you can initialize the Supabase client via the CDN in `js/auth.js` by adding your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## 📄 License

Academic and College Project Submission — MIT License.
