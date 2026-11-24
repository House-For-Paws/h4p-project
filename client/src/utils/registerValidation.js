/**
 * =============================================================================
 * FILE: client/src/utils/registerValidation.js
 * ROLE: Client-side validation for the register form
 * =============================================================================
 */

export const REGISTER_REGEX = {
  name: /^[A-Za-z\u0590-\u05FF][A-Za-z\u0590-\u05FF\s'-]{1,49}$/,
  username: /^[A-Za-z][A-Za-z0-9_]{2,19}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  passwordLetter: /[A-Za-z]/,
  passwordNumber: /[0-9]/,
  phone: /^\+?[0-9\s\-()]{7,20}$/,
};

/** Returns error message for a field, or "" when valid. */
export function getRegisterFieldError(field, value, formData = {}) {
  const v = String(value ?? "").trim();

  switch (field) {
    case "firstName":
      if (!v) return "First name is required";
      if (!REGISTER_REGEX.name.test(v)) {
        return "Use 2–50 letters only (spaces, - and ' allowed)";
      }
      return "";
    case "lastName":
      if (!v) return "Last name is required";
      if (!REGISTER_REGEX.name.test(v)) {
        return "Use 2–50 letters only (spaces, - and ' allowed)";
      }
      return "";
    case "username":
      if (!v) return "Username is required";
      if (!REGISTER_REGEX.username.test(v)) {
        return "3–20 chars, start with a letter (A–Z, 0–9, _)";
      }
      return "";
    case "email":
      if (!v) return "Email is required";
      if (!REGISTER_REGEX.email.test(v)) {
        return "Enter a valid email address";
      }
      return "";
    case "password":
      if (!v) return "Password is required";
      if (v.length < 6) return "Password must be at least 6 characters";
      if (!REGISTER_REGEX.passwordLetter.test(v)) {
        return "Password must include at least one letter";
      }
      if (!REGISTER_REGEX.passwordNumber.test(v)) {
        return "Password must include at least one number";
      }
      return "";
    case "confirmPassword":
      if (!v) return "Please confirm your password";
      if (v !== String(formData.password || "")) {
        return "Passwords do not match";
      }
      return "";
    case "phoneNumber":
      if (!v) return "";
      if (!REGISTER_REGEX.phone.test(v)) {
        return "Use a valid phone (7–20 digits, optional + - ( ))";
      }
      return "";
    default:
      return "";
  }
}

/** Validates required (+ optional phone) fields; returns { field: message }. */
export function validateRegisterForm(formData) {
  const fields = [
    "firstName",
    "lastName",
    "username",
    "email",
    "password",
    "confirmPassword",
    "phoneNumber",
  ];

  const errors = {};
  fields.forEach((field) => {
    const message = getRegisterFieldError(field, formData[field], formData);
    if (message) errors[field] = message;
  });
  return errors;
}
