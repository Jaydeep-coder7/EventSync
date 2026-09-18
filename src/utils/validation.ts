export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface BookingFormData {
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  ticketTierId: string;
  ticketQuantity: number;
  selectedSeats?: string[];
  specialRequests?: string;
}

export function validateBookingForm(data: BookingFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // Validate Name
  const trimmedName = data.attendeeName.trim();
  if (!trimmedName) {
    errors.attendeeName = "Full Name is required.";
  } else if (trimmedName.length < 2) {
    errors.attendeeName = "Full Name must be at least 2 characters.";
  } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
    errors.attendeeName = "Please enter a valid name (letters and spaces only).";
  }

  // Validate Email
  const trimmedEmail = data.attendeeEmail.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail) {
    errors.attendeeEmail = "Email address is required.";
  } else if (!emailRegex.test(trimmedEmail)) {
    errors.attendeeEmail = "Please enter a valid email address (e.g. alex@example.com).";
  }

  // Validate Phone
  const trimmedPhone = data.attendeePhone.trim();
  // Allow format with +, spaces, dashes, parentheses, at least 10 digits
  const phoneDigitsOnly = trimmedPhone.replace(/\D/g, "");
  if (!trimmedPhone) {
    errors.attendeePhone = "Phone number is required.";
  } else if (phoneDigitsOnly.length < 10 || phoneDigitsOnly.length > 15) {
    errors.attendeePhone = "Please enter a valid phone number (at least 10 digits).";
  }

  // Validate Ticket Quantity
  if (!data.ticketQuantity || data.ticketQuantity < 1) {
    errors.ticketQuantity = "You must book at least 1 ticket.";
  } else if (data.ticketQuantity > 10) {
    errors.ticketQuantity = "Maximum 10 tickets per booking.";
  }

  // Validate Ticket Tier
  if (!data.ticketTierId) {
    errors.ticketTierId = "Please select a ticket category.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
