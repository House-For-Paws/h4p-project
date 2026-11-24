/**
 * =============================================================================
 * FILE: client/src/utils/loginValidation.js
 * ROLE: Client-side validation for login + forgot-password forms
 * =============================================================================
 */
import { REGISTER_REGEX } from "./registerValidation";

export const LOGIN_REGEX = {
  email: REGISTER_REGEX.email,
  username: REGISTER_REGEX.username,
  passwordLetter: REGISTER_REGEX.passwordLetter,
  passwordNumber: REGISTER_REGEX.passwordNumber,
};

/** Email or username (backend login accepts both). */
export function isLoginIdentifierValid(value) {
  const v = String(value || "").trim();
  return LOGIN_REGEX.email.test(v) || LOGIN_REGEX.username.test(v);
}

export function isLoginPasswordValid(value) {
  // Login only checks length so older accounts are not blocked.
  // Strength rules apply when creating/resetting a password.
  return String(value || "").length >= 6;
}

/** Returns field error message, or "" when valid. */
export function getLoginFieldError(field, value, formData = {}) {
  const v = String(value ?? "").trim();

  switch (field) {
    case "email":
    case "login":
      if (!v) return "Email or username is required";
      if (!isLoginIdentifierValid(v)) {
        return "Enter a valid email or username";
      }
      return "";
    case "password":
      if (!v) return "Password is required";
      if (v.length < 6) return "Password must be at least 6 characters";
      return "";
    case "resetEmail":
      if (!v) return "Email is required";
      if (!LOGIN_REGEX.email.test(v)) return "Enter a valid email address";
      return "";
    case "newPassword":
      if (!v) return "New password is required";
      if (v.length < 6) return "Password must be at least 6 characters";
      if (!LOGIN_REGEX.passwordLetter.test(v)) {
        return "Password must include at least one letter";
      }
      if (!LOGIN_REGEX.passwordNumber.test(v)) {
        return "Password must include at least one number";
      }
      return "";
    case "confirmNewPassword":
      if (!v) return "Please confirm your new password";
      if (v !== String(formData.newPassword || "")) {
        return "Passwords do not match";
      }
      return "";
    default:
      return "";
  }
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  const emailError = getLoginFieldError("email", email);
  const passwordError = getLoginFieldError("password", password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return errors;
}

export function validateForgotPasswordForm({
  resetEmail,
  newPassword,
  confirmNewPassword,
}) {
  const errors = {};
  const emailError = getLoginFieldError("resetEmail", resetEmail);
  const passwordError = getLoginFieldError("newPassword", newPassword);
  const confirmError = getLoginFieldError("confirmNewPassword", confirmNewPassword, {
    newPassword,
  });
  if (emailError) errors.resetEmail = emailError;
  if (passwordError) errors.newPassword = passwordError;
  if (confirmError) errors.confirmNewPassword = confirmError;
  return errors;
}
