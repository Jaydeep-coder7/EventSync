# EventSync — Curated Live Experiences & Digital Passes

EventSync is a modern, high-performance event discovery and ticketing web application. Built for live concerts, tech summits, sports tournaments, comedy tours, theatre, and cultural festivals, EventSync offers interactive event booking, digital QR gate passes, dynamic seating tiers, and fluid visual effects.

![EventSync Preview](public/favicon.ico)

---

## ✨ Features

- **Dynamic Hero & Discovery**:
  - Curated event showcase with multi-category filter chips (Music, Technology, Food & Drink, Arts & Theatre, Sports, Business).
  - Live search with instant filtering and keyboard shortcuts.
  - Featured & Selling Fast horizontal scrolling carousels.

- **Fluid Particle Vector Background**:
  - Atmospheric simplex noise-driven fluid particle field powered by `@bundui/components/fluid-particles-background`.
  - Radiant ember blooms, constellation filament connectors, and interactive cursor deflection.
  - Automatic dark and light mode synchronization.

- **Interactive Ticketing Engine**:
  - Real-time tier selection (General, Silver, Gold, VIP, Backstage Lounge).
  - Quantity counter with real-time seat availability limits.
  - Transparent pricing breakdowns with tax, discount vouchers, and instant order totals in INR (₹).

- **Digital Passes & Gate QR Codes**:
  - Instant digital gate pass generation upon booking confirmation.
  - High-contrast scannable QR codes for venue check-ins.
  - One-click `.ics` calendar file export and smart reminder notifications.

- **Booking & Favorites Management**:
  - "My Passes" tab to manage active, upcoming, and past event tickets.
  - Bookmark and save favorite events across sessions.
  - Secure ticket cancellation with automated seat release.

- **Host & Publish Events**:
  - Guided event creation form for event organizers to list new live experiences with tiered ticket allocations.

- **Smooth Cinematic Polish**:
  - Lenis smooth inertial scrolling with scroll progress bar.
  - Motion transitions and micro-interactions.
  - Dark / Light theme toggle with persistent user preferences.

---

## 🛠️ Tech Stack

- **Framework**: [React 18+](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **State & Data**: [TanStack Query (React Query)](https://tanstack.com/query)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Motion (`motion/react`)](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Smooth Scroll**: [Lenis](https://github.com/darkroomengineering/lenis)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend / Auth**: [Supabase](https://supabase.com/)

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, pnpm, or bun

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd eventsync
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Ensure your `.env` contains the required credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be running locally at `http://localhost:3000`.

---

## 📦 Available Scripts

- `npm run dev` — Starts the development server on port 3000.
- `npm run build` — Builds the optimized static production application into `dist/`.
- `npm run lint` — Runs ESLint checks across the codebase.
- `npm run preview` — Previews the production build locally.

---

## 🔄 Syncing to GitHub

To push or sync this project with your GitHub repository:

### Option A: Via AI Studio / Lovable UI (Recommended)
1. Open the **Settings** or **Project** menu in the top-right toolbar.
2. Select **Connect to GitHub** (or **Export to GitHub**).
3. Authorize your GitHub account and select or create your destination repository.
4. Your repository will stay automatically synced with every commit!

### Option B: Via Git CLI
If you prefer pushing directly to an existing GitHub repository:

```bash
# Initialize git if not already initialized
git init -b main

# Add and commit all changes
git add .
git commit -m "feat: complete EventSync application with fluid particles background"

# Add your GitHub repository remote
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# Push to GitHub
git push -u origin main
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
