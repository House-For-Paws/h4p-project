/**
 * =============================================================================
 * FILE: client/src/utils/createPetValidation.js
 * ROLE: Client-side validation for Create Adoption Post
 * =============================================================================
 */

const NAME_REGEX = /^[A-Za-z\u0590-\u05FF][A-Za-z\u0590-\u05FF0-9\s'-]{1,49}$/;
const LOCATION_REGEX = /^[A-Za-z\u0590-\u05FF0-9\s,.'-]{2,80}$/;
const AGE_REGEX = /^[A-Za-z0-9\s-]{1,40}$/;

export function getCreatePetFieldError(field, value, formData = {}) {
  const v = String(value ?? "").trim();

  switch (field) {
    case "name":
      if (!v) return "Pet name is required";
      if (!NAME_REGEX.test(v)) return "Use 2–50 letters/numbers for the name";
      return "";
    case "breed":
      if (!v) return "Breed is required";
      if (v.length < 2) return "Breed must be at least 2 characters";
      return "";
    case "age":
      if (!v) return "Age is required";
      if (!AGE_REGEX.test(v)) return "Enter age like '2 years' or '8 months'";
      return "";
    case "location":
      if (!v) return "Location is required";
      if (!LOCATION_REGEX.test(v)) return "Enter a valid city/location";
      return "";
    case "type":
      if (!v) return "Select dog or cat";
      if (!["dog", "cat"].includes(v)) return "Type must be dog or cat";
      return "";
    case "gender":
      if (!v) return "Select a gender";
      if (!["Male", "Female"].includes(v)) return "Select Male or Female";
      return "";
    case "images": {
      const images = Array.isArray(formData.images) ? formData.images : [];
      if (!images.length) return "Add at least one photo";
      if (images.length > 3) return "You can upload up to 3 photos";
      return "";
    }
    default:
      return "";
  }
}

export function validateCreatePetForm(formData) {
  const fields = ["name", "breed", "age", "location", "type", "gender", "images"];
  const errors = {};
  fields.forEach((field) => {
    const message = getCreatePetFieldError(field, formData[field], formData);
    if (message) errors[field] = message;
  });
  return errors;
}
