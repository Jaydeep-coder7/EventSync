/**
 * EventSync - API Service
 * Handles data fetching, caching, filtering, and sorting using standard Fetch API
 */

let cachedEvents = null;

/**
 * Fetches all events from the simulated events.json API
 * @returns {Promise<Array>} List of events
 */
export async function fetchEvents() {
  if (cachedEvents) {
    return cachedEvents;
  }

  try {
    // Try local relative path first, fallback to root path
    let response = await fetch("data/events.json");
    if (!response.ok) {
      response = await fetch("/data/events.json");
    }
    if (!response.ok) {
      throw new Error(`Failed to load events: HTTP ${response.status}`);
    }

    const data = await response.json();
    cachedEvents = data;
    return data;
  } catch (error) {
    console.error("Error loading events via Fetch API:", error);
    throw error;
  }
}

/**
 * Retrieves a single event by its unique ID
 * @param {string} id - Event ID (e.g., 'eh-01')
 * @returns {Promise<Object|null>} Event object or null if not found
 */
export async function getEventById(id) {
  const events = await fetchEvents();
  return events.find((event) => event.id === id) || null;
}

/**
 * Returns featured and high-demand events for the homepage
 * @param {number} limit - Maximum number of items
 * @returns {Promise<Array>}
 */
export async function getFeaturedEvents(limit = 6) {
  const events = await fetchEvents();
  // Prioritize Featured and Selling Fast
  const featured = events.filter((e) => e.tag === "Featured" || e.tag === "Selling Fast");
  const remaining = events.filter((e) => e.tag !== "Featured" && e.tag !== "Selling Fast");
  return [...featured, ...remaining].slice(0, limit);
}

/**
 * Filters and sorts events based on user search and filter criteria
 * @param {Array} events - Complete list of events
 * @param {Object} criteria - Filter and sort settings
 * @returns {Array} Filtered and sorted events
 */
export function filterAndSortEvents(events, criteria = {}) {
  const {
    searchQuery = "",
    category = "All",
    city = "All",
    maxPrice = null,
    date = null,
    sortBy = "recommended",
  } = criteria;

  let results = [...events];

  // 1. Search Query Filter (Title, Venue, City, Organizer)
  if (searchQuery && searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase().trim();
    results = results.filter((e) => {
      const titleMatch = e.title?.toLowerCase().includes(q);
      const venueMatch = e.venue?.toLowerCase().includes(q);
      const cityMatch = e.city?.toLowerCase().includes(q);
      const orgMatch = e.organizer?.name?.toLowerCase().includes(q);
      const descMatch = e.shortDescription?.toLowerCase().includes(q);
      return titleMatch || venueMatch || cityMatch || orgMatch || descMatch;
    });
  }

  // 2. Category Filter
  if (category && category !== "All") {
    results = results.filter((e) => e.category?.toLowerCase() === category.toLowerCase());
  }

  // 3. City Filter
  if (city && city !== "All") {
    results = results.filter((e) => e.city?.toLowerCase() === city.toLowerCase());
  }

  // 4. Maximum Price Filter
  if (maxPrice !== null && maxPrice !== undefined && !isNaN(maxPrice)) {
    results = results.filter((e) => e.price <= maxPrice);
  }

  // 5. Date Filter (on or after selected date)
  if (date) {
    results = results.filter((e) => e.date >= date);
  }

  // 6. Sorting
  switch (sortBy) {
    case "price-low":
      results.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      results.sort((a, b) => b.price - a.price);
      break;
    case "date-nearest":
      results.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "rating":
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "recommended":
    default:
      // Featured first, then highest rating
      results.sort((a, b) => {
        if (a.tag === "Featured" && b.tag !== "Featured") return -1;
        if (b.tag === "Featured" && a.tag !== "Featured") return 1;
        return (b.rating || 0) - (a.rating || 0);
      });
      break;
  }

  return results;
}
