/**
 * EventSync - Validation Service
 * Provides client-side validation logic for booking forms, user inputs, and authentication
 */

/**
 * Validates full name
 * @param {string} name
 * @returns {{ isValid: boolean, message: string }}
 */
export function validateName(name) {
  if (!name || name.trim() === "") {
    return { isValid: false, message: "Please enter your full name." };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { isValid: false, message: "Name must be at least 2 characters long." };
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return { isValid: false, message: "Name should only contain letters, spaces, and hyphens." };
  }
  return { isValid: true, message: "" };
}

/**
 * Validates email address format
 * @param {string} email
 * @returns {{ isValid: boolean, message: string }}
 */
export function validateEmail(email) {
  if (!email || email.trim() === "") {
    return { isValid: false, message: "Please enter your email address." };
  }
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      message: "Please enter a valid email address (e.g., name@example.com).",
    };
  }
  return { isValid: true, message: "" };
}

/**
 * Validates phone number (standard 10-digit mobile, optionally with country code)
 * @param {string} phone
 * @param {boolean} required
 * @returns {{ isValid: boolean, message: string, formatted?: string }}
 */
export function validatePhone(phone, required = true) {
  if (!phone || phone.trim() === "") {
    if (!required) {
      return { isValid: true, message: "", formatted: "" };
    }
    return { isValid: false, message: "Please enter your 10-digit mobile number." };
  }
  // Strip spaces, dashes, parentheses and +91 prefix
  const cleaned = phone
    .replace(/[\s\-()]/g, "")
    .replace(/^\+91/, "")
    .replace(/^0/, "");
  if (!/^\d{10}$/.test(cleaned)) {
    return { isValid: false, message: "Phone number must be exactly 10 digits." };
  }
  return { isValid: true, message: "", formatted: cleaned };
}

/**
 * Validates password strength (minimum 8 characters)
 * @param {string} password
 * @returns {{ isValid: boolean, message: string }}
 */
export function validatePassword(password) {
  if (!password || password.length === 0) {
    return { isValid: false, message: "Password is required." };
  }
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long." };
  }
  return { isValid: true, message: "" };
}

/**
 * Validates that confirm password matches the chosen password
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {{ isValid: boolean, message: string }}
 */
export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword || confirmPassword.length === 0) {
    return { isValid: false, message: "Please confirm your password." };
  }
  if (password !== confirmPassword) {
    return { isValid: false, message: "Passwords do not match." };
  }
  return { isValid: true, message: "" };
}

/**
 * Validates Login credentials
 * @param {{ email: string, password: string }} data
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateLoginForm(data) {
  const errors = {};

  const emailCheck = validateEmail(data.email);
  if (!emailCheck.isValid) errors.email = emailCheck.message;

  const passCheck = validatePassword(data.password);
  if (!passCheck.isValid) errors.password = passCheck.message;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates Signup form inputs
 * @param {{ fullName: string, email: string, phone?: string, password: string, confirmPassword: string }} data
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateSignupForm(data) {
  const errors = {};

  const nameCheck = validateName(data.fullName);
  if (!nameCheck.isValid) errors.fullName = nameCheck.message;

  const emailCheck = validateEmail(data.email);
  if (!emailCheck.isValid) errors.email = emailCheck.message;

  // Phone is optional for signup; validate only if provided
  if (data.phone && data.phone.trim() !== "") {
    const phoneCheck = validatePhone(data.phone, false);
    if (!phoneCheck.isValid) errors.phone = phoneCheck.message;
  }

  const passCheck = validatePassword(data.password);
  if (!passCheck.isValid) errors.password = passCheck.message;

  const confirmCheck = validateConfirmPassword(data.password, data.confirmPassword);
  if (!confirmCheck.isValid) errors.confirmPassword = confirmCheck.message;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates ticket quantity
 * @param {number|string} quantity
 * @param {number} maxAvailable
 * @returns {{ isValid: boolean, message: string }}
 */
export function validateQuantity(quantity, maxAvailable = 10) {
  const num = parseInt(quantity, 10);
  if (isNaN(num) || num < 1) {
    return { isValid: false, message: "Please select at least 1 ticket." };
  }
  if (num > maxAvailable) {
    return {
      isValid: false,
      message: `Maximum available tickets for this tier is ${maxAvailable}.`,
    };
  }
  if (num > 10) {
    return { isValid: false, message: "Maximum booking limit is 10 tickets per order." };
  }
  return { isValid: true, message: "" };
}

/**
 * Validates the entire booking form
 * @param {Object} formData
 * @param {number} maxAvailable
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateBookingForm(formData, maxAvailable = 10) {
  const errors = {};

  const nameCheck = validateName(formData.fullName);
  if (!nameCheck.isValid) errors.fullName = nameCheck.message;

  const emailCheck = validateEmail(formData.email);
  if (!emailCheck.isValid) errors.email = emailCheck.message;

  const phoneCheck = validatePhone(formData.phone, true);
  if (!phoneCheck.isValid) errors.phone = phoneCheck.message;

  const qtyCheck = validateQuantity(formData.quantity, maxAvailable);
  if (!qtyCheck.isValid) errors.quantity = qtyCheck.message;

  if (!formData.tierId) {
    errors.tier = "Please select a ticket tier.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
