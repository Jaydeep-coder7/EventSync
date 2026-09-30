# EventSync

EventSync is a responsive event discovery, booking, and digital pass management web application created as a college project/demo. It allows users to explore events, view event details, book tickets, and manage their digital booking passes.

---

## Features

- **Event Discovery**: Dynamic catalog featuring rich event cards with images, badges, dates, venues, and ticket pricing.
- **Search & Instant Filtering**: Real-time keyword search across titles, artists, venues, and cities without page reloads.
- **Category Filtering**: Single-click category filters matching diverse live entertainment domains.
- **City & Price Filtering**: Filter events across 10 metropolitan cities and adjust prices dynamically via an interactive slider.
- **Sorting Engine**: Sort events by Recommended, Price (Low to High / High to Low), Nearest Date, and Highest Rated.
- **30 Realistic Demo Events**: Comprehensive dataset covering diverse entertainment, culture, and industry gatherings.
- **Scroll-Driven Event Gallery**: Full-viewport responsive showcase on the home page with single-slide snapping, parallax progress indicators, editorial layouts, and side navigation.
- **Event Details Pages**: Dedicated pages rendering event itineraries, venue maps, organizer profiles, and ticket tiers via dynamic URL query parameters.
- **Interactive Booking System**: Step-by-step ticket reservation modal with tier selection, dynamic quantity counters, and price computation including GST and fees.
- **Client-Side Form Validation**: Real-time validation for attendee names (letters only), valid email formats, 10-digit mobile numbers, and ticket limits.
- **LocalStorage Booking Persistence**: Bookings are stored securely in browser LocalStorage for reliable demo session persistence.
- **My Bookings Dashboard**: Dedicated management page displaying active passes, ticket details, and cancel booking capabilities.
- **Digital Gate Pass & QR Code Generation**: Instant digital gate pass with perforated ticket styling, reference code, barcode, and scannable QR code matrix rendered on HTML5 Canvas.
- **Calendar Download (.ics)**: One-click standard iCalendar invitation export for Apple Calendar, Google Calendar, and Outlook.
- **Supabase Authentication**: User registration and login powered by Supabase Auth with persistent browser sessions.
- **Attendee Support & Pass Lookup**: Built-in support dialog with lost pass lookup by email or phone, demo guidelines, and FAQ accordion.
- **Dark / Light Theme Toggle**: Luxury dark mode and crisp light mode with preferences remembered across sessions.
- **Responsive Design**: Mobile-first design optimized from 320px mobile screens to 1440px+ widescreen desktop displays.

---

## Event Categories

The demo dataset contains 11 distinct event categories:

- **Art**: Contemporary exhibitions, digital art showcases, and gallery openings.
- **Business**: Startup summits, leadership conclaves, and investment forums.
- **Comedy**: Stand-up comedy specials and improv nights.
- **Culture**: Traditional heritage performances and literary festivals.
- **Education**: Workshops, masterclasses, and hands-on skill intensives.
- **Festival**: Multi-day music and cultural celebrations.
- **Food & Drink**: Gourmet festivals, wine tastings, and culinary pop-ups.
- **Music**: Arena concerts, classical recitals, and indie music gigs.
- **Sports**: Marathons, athletic championships, and live sporting fixtures.
- **Technology**: Developer conferences, AI expos, and tech hackathons.
- **Theatre**: Drama, stage plays, and musical productions.

---

## Demo Events

EventSync includes **30 realistic demo events** distributed across major Indian cities:

- **Hyderabad**
- **Bengaluru**
- **Mumbai**
- **Delhi**
- **Pune**
- **Chennai**
- **Kolkata**
- **Ahmedabad**
- **Jaipur**
- **Kochi**

_(Note: All events, artists, venues, and schedules in this project are simulated demo data created for academic demonstration.)_

---

## Authentication

EventSync integrates **Supabase Auth** for account management:

- **Email & Password Authentication**: Attendee registration and sign-in with client-side validation.
- **Persistent Browser Sessions**: Authentication tokens persist across page reloads and browser restarts.
- **Protected Actions**: Key operations such as accessing booking passes and personal profile details require an authenticated session.
- **Navbar Profile State**: Navigation bar dynamically updates to show attendee initials, avatar, and account options.
- **Sign Out**: Instant session termination and cache clearing.

Credentials are configured via environment variables and never hard-coded in source files.

---

## Booking System

The booking workflow is engineered entirely using vanilla JavaScript:

1. **Ticket Selection**: Choose from multiple tiers (General Admission, VIP Circle, Lounge passes) with dynamic pricing calculation.
2. **Attendee Validation**: Name, email, and 10-digit phone number validation prior to checkout.
3. **Demo Persistence**: Booking records and ticket quantities are saved to **HTML5 LocalStorage** under the `eventsync_bookings` key.
4. **Digital Pass Generation**: Generates a unique booking reference (e.g. `ES-824190`) with a scannable QR code matrix rendered onto an HTML5 Canvas.
5. **Calendar Export**: Generates and downloads a `.ics` calendar invitation for easy scheduling.
6. **Pass Management**: Passes appear immediately in **My Bookings**, where attendees can re-open their QR pass or cancel bookings.

---

## Technologies Used

- **HTML5**: Semantic markup (`<header>`, `<main>`, `<article>`, `<section>`, `<nav>`, `<aside>`, `<footer>`, `<canvas>`).
- **CSS3**: CSS Custom Properties (Variables), Flexbox, CSS Grid, media queries, and keyframe animations.
- **JavaScript (ES6+)**: ES Modules (`import`/`export`), async/await, DOM manipulation, Fetch API, and LocalStorage API.
- **HTML5 Canvas**: Procedural 2D canvas drawing used for generating scannable digital QR passes.
- **Supabase Auth**: Authentication SDK (`@supabase/supabase-js`) providing session management.
- **Vite**: Modern development server and production multi-page application (MPA) bundler.
- **JSON**: Structured demo event database (`data/events.json`).

_(This project is built purely with web standards and does not rely on React, TanStack, or Tailwind CSS runtime frameworks.)_

---

## Project Structure

```
EventSync/
├── index.html              # Home page: Hero, search, category chips, scroll-driven event gallery
├── events.html             # Events catalog: Live search, category/city/price filters, sorting, responsive card grid
├── event-details.html      # Event details: Gallery switcher, itinerary, venue, organizer, tiers, booking sidebar
├── my-bookings.html        # My passes: Stored in LocalStorage, digital QR pass, calendar export, cancellation
├── auth.html               # Authentication: Supabase email & password signup / signin with session restoration
├── css/
│   └── style.css           # Complete responsive CSS3 design system (Dark/Light mode, amber theme, spacious mobile layout)
├── js/
│   ├── api.js              # Fetch API client: Loads data/events.json (30 demo events), filtering, and sorting
│   ├── auth.js             # Supabase Authentication manager: signup, login, session persistence, auth listeners
│   ├── booking.js          # Booking engine: LocalStorage persistence, modal, scannable QR code matrix
│   ├── script.js           # Core UI: Theme toggle, mobile navigation drawer, scroll progress bar, toast alerts
│   ├── support.js          # Attendee care: Demo pass lookup by email/phone, demo guidelines, FAQ accordion
│   └── validation.js       # Client-side form validations (Name, Email, 10-digit Phone, Quantity limits)
├── data/
│   └── events.json         # Structured demo dataset containing 30 realistic demo events across India
├── public/
│   ├── data/
│   │   └── events.json     # Mirrored static dataset for production builds
│   ├── images/             # Static image assets
│   ├── favicon.ico         # Website favicon
│   └── robots.txt          # Search engine crawler instructions
├── images/                 # Venue photography, concert artwork, and icons
├── scripts/
│   └── post-build.js       # Build script ensuring static data and images are mirrored in dist/
├── .env.example            # Environment variables template
├── package.json            # Project manifest, Vite dev server, ESLint, and Supabase client
├── vite.config.ts          # Multi-Page Application (MPA) build configuration
├── tsconfig.json           # TypeScript configuration for build tool support
├── eslint.config.js        # ESLint code quality configuration
└── README.md               # Project documentation and execution instructions
```

---

## Setup

### Prerequisites

- Node.js (version 18 or later recommended)
- npm or bun

### Installation Steps

1. **Clone or extract the repository**:

   ```bash
   cd EventSync
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Add your Supabase project credentials in `.env`:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

### Alternative Static Serving

Because EventSync is built with standard HTML, CSS, and JavaScript modules, it can also be served statically:

- **VS Code Live Server**: Right-click `index.html` and choose **"Open with Live Server"**.
- **Python HTTP Server**: Run `python -m http.server 3000` in the project root.

---

## Supabase Configuration

To connect your own Supabase backend for user authentication:

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** > **API**.
3. Copy the **Project URL** and the **Anon / Public API Key**.
4. Paste these values into your `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. Enable **Email / Password** provider under **Authentication** > **Providers** in the Supabase dashboard.

_(Never expose your `service_role` or secret API keys in frontend configuration files.)_

---

## Build

To create a production-ready build:

```bash
# Build the multi-page application into dist/
npm run build
```

To run code quality linting:

```bash
# Verify code quality and syntax with ESLint
npm run lint
```

To format code with Prettier:

```bash
# Format HTML, CSS, JavaScript, and configuration files
npm run format
```

---

## Responsive Design

The EventSync design system is built to provide an optimal viewing experience across all device categories:

- **Mobile (320px – 480px)**: Single-column reflow, full-width touch targets (44px+ minimum), comfortable padding, and a sliding navigation drawer.
- **Tablet (768px – 820px)**: Two-column responsive event cards, touch-friendly filter scrolling, and compact sidebars.
- **Laptop (1024px – 1280px)**: Multi-column catalog grid with sticky filter sidebar and expanded navigation.
- **Desktop (1440px+)**: Wide-screen layout with maximum content containment and enhanced visual hierarchy.

All layouts adapt naturally using fluid percentages, CSS Grid, and Flexbox without unwanted horizontal page scrolling or clipped text.

---

## Project Architecture

```
HTML Pages (index, events, event-details, my-bookings, auth)
    │
    ▼
CSS3 Design System (css/style.css: variables, responsive grid, dark/light theme)
    │
    ▼
JavaScript Modules (js/api.js, js/auth.js, js/booking.js, js/script.js, js/support.js, js/validation.js)
    ├── Fetch API & JSON Event Data (data/events.json — 30 demo events)
    ├── Supabase Auth (@supabase/supabase-js — persistent sessions & auth state)
    └── HTML5 LocalStorage (eventsync_bookings — demo booking persistence & QR passes)
```

---

## Important Demo Limitation

> **Academic / College Project Notice**: This project is intended strictly as a college/demo application. Event listings, pricing, attendee profiles, booking persistence, support features, and related services are implemented for demonstration purposes and should not be treated as production infrastructure.

---

## License

Academic and College Project Submission — MIT License.
