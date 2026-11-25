/**
 * =============================================================================
 * FILE: client/src/utils/createPetValidation.js
 * ROLE: Client-side validation for Create Adoption Post
 * =============================================================================
 */

const NAME_REGEX = /^[A-Za-z\u0590-\u05FF][A-Za-z\u0590-\u05FF0-9\s'-]{1,49}$/;

/** Scrollable age choices for the create-listing form. */
export const PET_AGE_OPTIONS = [
  "Under 3 months",
  "3 months",
  "6 months",
  "9 months",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5 years",
  "6 years",
  "7 years",
  "8 years",
  "9 years",
  "10 years",
  "11 years",
  "12 years",
  "13 years",
  "14 years",
  "15+ years",
];

/** Shared breed choices (any pet type). */
export const SHARED_BREED_OPTIONS = ["Mixed"];

/** Common dog breeds (alphabetical). */
export const DOG_BREED_OPTIONS = [
  "Akita",
  "Alaskan Malamute",
  "American Bulldog",
  "American Pit Bull Terrier",
  "American Staffordshire Terrier",
  "Australian Shepherd",
  "Basset Hound",
  "Beagle",
  "Belgian Malinois",
  "Bernese Mountain Dog",
  "Bichon Frise",
  "Border Collie",
  "Boxer",
  "Bull Terrier",
  "Bulldog",
  "Cane Corso",
  "Cavalier King Charles Spaniel",
  "Chihuahua",
  "Chow Chow",
  "Cocker Spaniel",
  "Corgi",
  "Dachshund",
  "Dalmatian",
  "Doberman",
  "English Springer Spaniel",
  "French Bulldog",
  "German Shepherd",
  "Golden Retriever",
  "Great Dane",
  "Greyhound",
  "Havanese",
  "Husky",
  "Jack Russell Terrier",
  "Labrador Retriever",
  "Lhasa Apso",
  "Maltese",
  "Miniature Pinscher",
  "Miniature Schnauzer",
  "Newfoundland",
  "Pekingese",
  "Pitbull",
  "Pointer",
  "Pomeranian",
  "Poodle",
  "Pug",
  "Rhodesian Ridgeback",
  "Rottweiler",
  "Saint Bernard",
  "Samoyed",
  "Shar Pei",
  "Shiba Inu",
  "Shih Tzu",
  "Staffordshire Bull Terrier",
  "Vizsla",
  "Weimaraner",
  "Whippet",
  "Yorkshire Terrier",
];

/** Common cat breeds (alphabetical). */
export const CAT_BREED_OPTIONS = [
  "Abyssinian",
  "American Shorthair",
  "Bengal",
  "Birman",
  "British Shorthair",
  "Burmese",
  "Domestic Longhair",
  "Domestic Shorthair",
  "Maine Coon",
  "Norwegian Forest Cat",
  "Oriental Shorthair",
  "Persian",
  "Ragdoll",
  "Russian Blue",
  "Scottish Fold",
  "Siamese",
  "Sphynx",
  "Tabby",
  "Turkish Angora",
];

/** Breed list for the selected animal type (Mixed first). */
export function getBreedOptionsForType(type) {
  const breeds =
    String(type || "").toLowerCase() === "cat"
      ? CAT_BREED_OPTIONS
      : DOG_BREED_OPTIONS;
  return [...SHARED_BREED_OPTIONS, ...breeds];
}

/** Optional adoption checkboxes (id → label). */
export const PET_TRAIT_OPTIONS = [
  { id: "fromStreet", label: "Found / rescued from the street" },
  { id: "forAdoption", label: "Ready for adoption now" },
  { id: "vaccinated", label: "Vaccinated" },
  { id: "neutered", label: "Neutered / spayed" },
  { id: "microchipped", label: "Microchipped" },
  { id: "houseTrained", label: "House-trained" },
  { id: "goodWithKids", label: "Good with children" },
  { id: "goodWithPets", label: "Good with other animals" },
  { id: "specialNeeds", label: "Has special needs" },
];

export function emptyPetTraits() {
  return Object.fromEntries(PET_TRAIT_OPTIONS.map((item) => [item.id, false]));
}

export function normalizePetTraits(raw) {
  const base = emptyPetTraits();
  let source = raw;
  if (typeof raw === "string" && raw.trim()) {
    try {
      source = JSON.parse(raw);
    } catch {
      source = {};
    }
  }
  if (!source || typeof source !== "object") return base;
  PET_TRAIT_OPTIONS.forEach((item) => {
    base[item.id] = Boolean(source[item.id]);
  });
  return base;
}

/** Israeli cities for the location dropdown (alphabetical). */
export const ISRAEL_CITY_OPTIONS = [
  "Afula",
  "Akko",
  "Arad",
  "Ariel",
  "Ashdod",
  "Ashkelon",
  "Bat Yam",
  "Be'er Sheva",
  "Beit Shean",
  "Beit Shemesh",
  "Bnei Brak",
  "Dimona",
  "Eilat",
  "Givatayim",
  "Hadera",
  "Haifa",
  "Herzliya",
  "Hod HaSharon",
  "Holon",
  "Jerusalem",
  "Karmiel",
  "Kfar Saba",
  "Kiryat Ata",
  "Kiryat Bialik",
  "Kiryat Gat",
  "Kiryat Malakhi",
  "Kiryat Motzkin",
  "Kiryat Ono",
  "Kiryat Shmona",
  "Kiryat Yam",
  "Lod",
  "Ma'ale Adumim",
  "Ma'alot-Tarshiha",
  "Migdal HaEmek",
  "Modi'in",
  "Modi'in Illit",
  "Nahariya",
  "Nazareth",
  "Ness Ziona",
  "Netanya",
  "Netivot",
  "Ofakim",
  "Or Akiva",
  "Or Yehuda",
  "Petah Tikva",
  "Ra'anana",
  "Rahat",
  "Ramat Gan",
  "Ramat HaSharon",
  "Ramla",
  "Rehovot",
  "Rishon LeZion",
  "Rosh HaAyin",
  "Safed",
  "Sderot",
  "Tel Aviv",
  "Tiberias",
  "Tirat Carmel",
  "Umm al-Fahm",
  "Yavne",
  "Yehud",
  "Yokneam",
];

export function getCreatePetFieldError(field, value, formData = {}) {
  const v = String(value ?? "").trim();

  switch (field) {
    case "name":
      if (!v) return "Pet name is required";
      if (!NAME_REGEX.test(v)) return "Use 2–50 letters/numbers for the name";
      return "";
    case "breed":
      if (!v) return "Select a breed";
      return "";
    case "age":
      if (!v) return "Select an age";
      return "";
    case "location":
      if (!v) return "Select a city";
      return "";
    case "type":
      if (!v) return "Select dog or cat";
      if (!["dog", "cat"].includes(v)) return "Type must be dog or cat";
      return "";
    case "gender":
      if (!v) return "Select a gender";
      if (!["Male", "Female"].includes(v)) return "Select Male or Female";
      return "";
    case "details":
      if (v.length > 2000) return "Keep details under 2000 characters";
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
  const fields = [
    "name",
    "breed",
    "age",
    "location",
    "type",
    "gender",
    "details",
    "images",
  ];
  const errors = {};
  fields.forEach((field) => {
    const message = getCreatePetFieldError(field, formData[field], formData);
    if (message) errors[field] = message;
  });
  return errors;
}
