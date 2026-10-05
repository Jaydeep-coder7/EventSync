# 🎟️ EventSync

> **Don't Just Hear About It. Be There With EventSync.**

EventSync is a responsive event discovery, booking, and digital pass management web application created as a **college project/demo**.

The platform allows users to explore events, search and filter events, view detailed event information, book tickets, generate digital passes with QR codes, and manage their bookings.

🌐 **Live Website:**  
[Visit EventSync](PASTE-YOUR-LIVE-WEBSITE-LINK-HERE)

---

## 📌 About the Project

EventSync is designed as a modern event discovery and booking platform covering different types of experiences such as:

- 🎵 Music
- 💻 Technology
- 🎭 Theatre
- 🎨 Art
- 🍴 Food & Drink
- ⚽ Sports
- 😂 Comedy
- 💼 Business
- 📚 Education
- 🎉 Festivals
- 🏛️ Culture

The project contains **30 realistic demo events** distributed across major Indian cities.

All event information is simulated demo data created for academic/project demonstration.

---

# ✨ Features

## 🏠 Home Page

- Modern event-focused hero section
- Event search
- Category navigation
- Featured event discovery
- Scroll-driven event gallery
- Full-screen event presentation
- Event counter
- Previous / Next event navigation
- TOP and BOTTOM navigation controls
- Responsive layout

---

## 🔎 Event Discovery

Users can explore the complete event catalog with:

- Real-time search
- Category filtering
- City filtering
- Price filtering
- Sorting
- Recommended events
- Price: Low to High
- Price: High to Low
- Nearest date
- Highest rated events

---

## 🎫 Event Details

Each event includes detailed information such as:

- Event title
- Category
- Date
- Time
- Venue
- City
- Organizer
- Description
- Pricing
- Ticket tiers
- Availability
- Event images
- Additional event information

---

## 🎟️ Ticket Booking

Users can book tickets through an interactive booking system.

The booking flow includes:

1. Select an event
2. Select ticket type
3. Select ticket quantity
4. Enter attendee information
5. Validate the information
6. Calculate the booking amount
7. Generate the booking confirmation
8. Generate a digital event pass

---

## 📱 Digital Event Pass

After booking, EventSync generates a digital pass containing:

- Event information
- Attendee information
- Booking reference
- Ticket information
- QR code
- Digital pass design

The QR code is generated using HTML5 Canvas.

---

## 📅 Calendar Integration

Users can download an `.ics` calendar file for their booked event.

The calendar file can be used with supported calendar applications such as:

- Google Calendar
- Apple Calendar
- Microsoft Outlook

---

## 👤 Authentication

EventSync uses **Supabase Auth** for user authentication.

Authentication includes:

- User registration
- Email/password login
- Persistent sessions
- Session restoration
- Sign out
- Protected user features
- User profile state in the navigation bar

Supabase credentials are stored through environment variables and are not hard-coded into the project.

---

## 📂 My Bookings

The My Bookings section allows users to:

- View their booked events
- View ticket information
- Re-open digital passes
- View QR codes
- Download calendar invitations
- Cancel demo bookings

Booking information is stored in browser LocalStorage for demonstration purposes.

---

## 🆘 Support & FAQ

EventSync also includes a demo support interface with:

- Lost pass lookup
- Attendee lookup
- FAQ accordion
- Demo instructions
- Ticket/pass assistance

These features are implemented for the college/demo project and are not connected to a production customer-support system.

---

# 🌆 Demo Events

EventSync currently contains **30 realistic demo events**.

The events are distributed across:

| City |
|---|
| Hyderabad |
| Bengaluru |
| Mumbai |
| Delhi |
| Pune |
| Chennai |
| Kolkata |
| Ahmedabad |
| Jaipur |
| Kochi |

### Event Categories

The project contains 11 event categories:

- Art
- Business
- Comedy
- Culture
- Education
- Festival
- Food & Drink
- Music
- Sports
- Technology
- Theatre

> **Note:** All events, artists, venues, schedules, pricing, and related information are simulated demo data created for academic demonstration.

---

# 🛠️ Technologies Used

EventSync is built using modern web technologies.

### Frontend

- HTML5
- CSS3
- JavaScript ES6+
- JavaScript Modules
- DOM Manipulation
- Fetch API
- LocalStorage
- HTML5 Canvas

### Authentication

- Supabase Auth
- `@supabase/supabase-js`

### Data

- JSON
- Fetch API

### Development

- Vite
- ESLint
- Prettier
- npm

The application uses a **vanilla HTML/CSS/JavaScript architecture** and does not use React, TanStack, or Tailwind CSS.

---

# 📱 Responsive Design

EventSync is designed to work across different screen sizes.

### Mobile

- Responsive single-column layouts
- Touch-friendly controls
- Mobile navigation drawer
- Responsive event gallery
- Responsive booking forms

### Tablet

- Adaptive layouts
- Touch-friendly filtering
- Responsive event cards
- Optimized navigation

### Laptop & Desktop

- Multi-column layouts
- Expanded navigation
- Large event imagery
- Editorial event gallery
- Optimized content spacing

The website is designed for screen sizes ranging from approximately **320px mobile screens to large desktop displays**.

---

# 📁 Project Structure

```text
EventSync/
│
├── index.html
├── events.html
├── event-details.html
├── my-bookings.html
├── auth.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── api.js
│   ├── auth.js
│   ├── booking.js
│   ├── script.js
│   ├── support.js
│   └── validation.js
│
├── data/
│   └── events.json
│
├── public/
│   ├── favicon.ico
│   └── robots.txt
│
├── images/
│
├── scripts/
│   └── post-build.js
│
├── .env.example
├── package.json
├── package-lock.json
├── metadata.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
└── README.md
```
