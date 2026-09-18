export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  remaining: number;
}

export interface Organizer {
  name: string;
  avatar: string;
  role: string;
  bio: string;
  verified: boolean;
  eventsOrganized: number;
}

export type EventCategory =
  | 'All'
  | 'Music'
  | 'Technology'
  | 'Food & Drink'
  | 'Arts & Theatre'
  | 'Sports & Fitness'
  | 'Business & Networking';

export interface EventItem {
  id: string;
  title: string;
  tag?: string;
  category: EventCategory;
  date: string;
  displayDate: string;
  time: string;
  venue: string;
  city: string;
  address: string;
  price: number;
  originalPrice?: number;
  totalSeats: number;
  bookedSeats: number;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  fullDescription: string;
  image: string;
  gallery: string[];
  organizer: Organizer;
  highlights: string[];
  ticketTiers: TicketTier[];
  isCancelled?: boolean;
  cancellationReason?: string;
}

export interface Booking {
  id: string;
  eventId: string;
  eventTitle: string;
  eventCategory: string;
  eventImage: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  city: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  ticketTierId: string;
  ticketTierName: string;
  ticketQuantity: number;
  selectedSeats?: string[];
  pricePerTicket: number;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  bookingDate: string;
  status: 'confirmed' | 'cancelled';
  cancelledAt?: string;
  cancellationReason?: string;
  refundStatus?: string;
  specialRequests?: string;
}

export type DateFilterOption = 'all' | 'today' | 'weekend' | 'month';
export type PriceFilterOption = 'all' | 'free' | 'under1000' | '1000to3000' | 'above3000';
export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'date-asc'
  | 'name-asc';

export interface FilterState {
  searchQuery: string;
  category: EventCategory;
  dateFilter: DateFilterOption;
  priceFilter: PriceFilterOption;
  sortBy: SortOption;
  statusFilter?: 'all' | 'active' | 'cancelled';
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  gender?: 'boy' | 'girl' | 'male' | 'female';
  username?: string;
  phone?: string;
  loginTime: string;
  themePreference?: 'dark' | 'light';
}
