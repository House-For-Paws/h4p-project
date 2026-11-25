/**
 * =============================================================================
 * FILE: client/src/pages/CreateAdoptionPost.jsx
 * ROLE: Create or edit an adoption listing (POST/PATCH /api/pets)
 * =============================================================================
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import styles from "../styles/createAdoptionPost.module.css";
import { createPet, getPet, updatePet } from "../services/userService";
import {
  emptyPetTraits,
  getBreedOptionsForType,
  getCreatePetFieldError,
  ISRAEL_CITY_OPTIONS,
  normalizePetTraits,
  PET_AGE_OPTIONS,
  PET_TRAIT_OPTIONS,
  validateCreatePetForm,
} from "../utils/createPetValidation";

function getCurrentUserId() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id != null ? Number(payload.id) : null;
  } catch {
    return null;
  }
}

function petImages(pet) {
  if (Array.isArray(pet?.images) && pet.images.length) {
    return pet.images.filter(Boolean);
  }
  return [pet?.image].filter(Boolean);
}

const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 4_000_000;
const MAX_IMAGE_EDGE = 900;
const JPEG_QUALITY = 0.72;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

/** Compress/resize image so multi-photo galleries fit in DB and carousel works. */
function compressImageDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      try {
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Could not process image"));
    img.src = dataUrl;
  });
}

function CreateAdoptionPost() {
  const navigate = useNavigate();
  const { id: editIdParam } = useParams();
  const editId = editIdParam ? Number(editIdParam) : null;
  const isEditMode = Boolean(editId);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    location: "",
    type: "dog",
    gender: "Male",
    details: "",
    traits: emptyPetTraits(),
    images: [],
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEditMode);
  const [isAuthed, setIsAuthed] = useState(
    () => Boolean(localStorage.getItem("token")),
  );
  const [ageMenuOpen, setAgeMenuOpen] = useState(false);
  const [breedMenuOpen, setBreedMenuOpen] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [breedFilter, setBreedFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const ageMenuRef = useRef(null);
  const breedMenuRef = useRef(null);
  const locationMenuRef = useRef(null);

  const ageOptions = useMemo(() => {
    if (formData.age && !PET_AGE_OPTIONS.includes(formData.age)) {
      return [formData.age, ...PET_AGE_OPTIONS];
    }
    return PET_AGE_OPTIONS;
  }, [formData.age]);

  const breedOptions = useMemo(() => {
    const options = getBreedOptionsForType(formData.type);
    if (formData.breed && !options.includes(formData.breed)) {
      return [formData.breed, ...options];
    }
    return options;
  }, [formData.type, formData.breed]);

  const cityOptions = useMemo(() => {
    if (formData.location && !ISRAEL_CITY_OPTIONS.includes(formData.location)) {
      return [formData.location, ...ISRAEL_CITY_OPTIONS];
    }
    return ISRAEL_CITY_OPTIONS;
  }, [formData.location]);

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem("token"));
    setIsAuthed(hasToken);
    if (!hasToken) {
      navigate("/login", {
        replace: true,
        state: {
          from: isEditMode ? `/edit-post/${editId}` : "/create-post",
        },
      });
    }
  }, [navigate, isEditMode, editId]);

  useEffect(() => {
    if (!isEditMode || !isAuthed) return undefined;
    let cancelled = false;

    const loadListing = async () => {
      setIsLoadingEdit(true);
      setFormError("");
      try {
        const res = await getPet(editId);
        const pet = res.data;
        if (cancelled) return;
        const currentUserId = getCurrentUserId();
        if (
          !pet ||
          currentUserId == null ||
          Number(pet.ownerId) !== currentUserId
        ) {
          setFormError("You can only edit your own listing.");
          setTimeout(() => navigate(`/adopt/${editId}`, { replace: true }), 1200);
          return;
        }
        setFormData({
          name: pet.name || "",
          breed: pet.breed || "",
          age: pet.age || "",
          location: pet.location || "",
          type: pet.type || "dog",
          gender: pet.gender || "Male",
          details: pet.details || "",
          traits: normalizePetTraits(pet.traits),
          images: petImages(pet),
        });
      } catch (err) {
        if (cancelled) return;
        setFormError(
          err.response?.data?.message || "Could not load this listing.",
        );
      } finally {
        if (!cancelled) setIsLoadingEdit(false);
      }
    };

    loadListing();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, isAuthed, editId, navigate]);

  useEffect(() => {
    if (!ageMenuOpen && !breedMenuOpen && !locationMenuOpen) return undefined;
    const onPointerDown = (event) => {
      if (ageMenuOpen && !ageMenuRef.current?.contains(event.target)) {
        setAgeMenuOpen(false);
        setTouched((prev) => ({ ...prev, age: true }));
        setFieldErrors((prev) => ({
          ...prev,
          age: getCreatePetFieldError("age", formData.age, formData),
        }));
      }
      if (breedMenuOpen && !breedMenuRef.current?.contains(event.target)) {
        setBreedMenuOpen(false);
        setTouched((prev) => ({ ...prev, breed: true }));
        setFieldErrors((prev) => ({
          ...prev,
          breed: getCreatePetFieldError("breed", formData.breed, formData),
        }));
      }
      if (
        locationMenuOpen &&
        !locationMenuRef.current?.contains(event.target)
      ) {
        setLocationMenuOpen(false);
        setTouched((prev) => ({ ...prev, location: true }));
        setFieldErrors((prev) => ({
          ...prev,
          location: getCreatePetFieldError(
            "location",
            formData.location,
            formData,
          ),
        }));
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setAgeMenuOpen(false);
        setBreedMenuOpen(false);
        setLocationMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ageMenuOpen, breedMenuOpen, locationMenuOpen, formData]);

  const filteredBreeds = breedOptions.filter((breed) =>
    breed.toLowerCase().includes(breedFilter.trim().toLowerCase()),
  );

  const filteredCities = cityOptions.filter((city) =>
    city.toLowerCase().includes(locationFilter.trim().toLowerCase()),
  );

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      let next = { ...prev, [field]: value };
      // Switching dog/cat resets breed when it no longer fits the type list.
      if (field === "type") {
        const allowed = getBreedOptionsForType(value);
        if (prev.breed && !allowed.includes(prev.breed)) {
          next = { ...next, breed: "" };
        }
      }
      if (touched[field] || fieldErrors[field] || field === "type") {
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          [field]: getCreatePetFieldError(field, next[field], next),
          ...(field === "type"
            ? { breed: getCreatePetFieldError("breed", next.breed, next) }
            : {}),
        }));
      }
      return next;
    });
    setFormError("");
  };

  const selectAge = (value) => {
    const next = { ...formData, age: value };
    setFormData(next);
    setTouched((prev) => ({ ...prev, age: true }));
    setFieldErrors((prev) => ({
      ...prev,
      age: getCreatePetFieldError("age", value, next),
    }));
    setAgeMenuOpen(false);
    setFormError("");
  };

  const selectBreed = (value) => {
    const next = { ...formData, breed: value };
    setFormData(next);
    setTouched((prev) => ({ ...prev, breed: true }));
    setFieldErrors((prev) => ({
      ...prev,
      breed: getCreatePetFieldError("breed", value, next),
    }));
    setBreedMenuOpen(false);
    setBreedFilter("");
    setFormError("");
  };

  const selectLocation = (value) => {
    const next = { ...formData, location: value };
    setFormData(next);
    setTouched((prev) => ({ ...prev, location: true }));
    setFieldErrors((prev) => ({
      ...prev,
      location: getCreatePetFieldError("location", value, next),
    }));
    setLocationMenuOpen(false);
    setLocationFilter("");
    setFormError("");
  };

  const toggleTrait = (traitId) => {
    setFormData((prev) => ({
      ...prev,
      traits: {
        ...prev.traits,
        [traitId]: !prev.traits?.[traitId],
      },
    }));
    setFormError("");
  };

  const closeOtherMenus = (keep) => {
    if (keep !== "age") setAgeMenuOpen(false);
    if (keep !== "breed") setBreedMenuOpen(false);
    if (keep !== "location") setLocationMenuOpen(false);
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldErrors((prev) => ({
      ...prev,
      [field]: getCreatePetFieldError(field, formData[field], formData),
    }));
  };

  const inputClass = (field) =>
    `${styles.input}${fieldErrors[field] ? ` ${styles.inputInvalid}` : ""}`;

  const handleImagesSelected = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setFormError("");
    const remainingSlots = MAX_IMAGES - formData.images.length;
    if (remainingSlots <= 0) {
      setFormError("You can upload up to 3 photos.");
      event.target.value = "";
      return;
    }

    const selected = files.slice(0, remainingSlots);
    try {
      const nextImages = [...formData.images];
      for (const file of selected) {
        if (!file.type.startsWith("image/")) {
          throw new Error("Please choose image files only.");
        }
        if (file.size > MAX_IMAGE_BYTES) {
          throw new Error("Each image must be under ~4MB before compression.");
        }
        const rawDataUrl = await readFileAsDataUrl(file);
        if (!rawDataUrl.startsWith("data:image/")) {
          throw new Error("Invalid image format.");
        }
        const dataUrl = await compressImageDataUrl(rawDataUrl);
        nextImages.push(dataUrl);
      }

      const next = { ...formData, images: nextImages };
      setFormData(next);
      setTouched((prev) => ({ ...prev, images: true }));
      setFieldErrors((prev) => ({
        ...prev,
        images: getCreatePetFieldError("images", nextImages, next),
      }));
    } catch (err) {
      setFormError(err.message || "Could not load images.");
    } finally {
      event.target.value = "";
    }
  };

  const removeImage = (index) => {
    const nextImages = formData.images.filter((_, i) => i !== index);
    const next = { ...formData, images: nextImages };
    setFormData(next);
    setFieldErrors((prev) => ({
      ...prev,
      images: getCreatePetFieldError("images", nextImages, next),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payloadForm = formData;
    const errors = validateCreatePetForm(payloadForm);
    setFieldErrors(errors);
    setTouched({
      name: true,
      breed: true,
      age: true,
      location: true,
      type: true,
      gender: true,
      details: true,
      images: true,
    });

    if (Object.keys(errors).length) {
      setFormError(
        isEditMode
          ? "Please fix the highlighted fields before saving."
          : "Please fix the highlighted fields before publishing.",
      );
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    const payload = {
      name: payloadForm.name.trim(),
      breed: payloadForm.breed.trim(),
      age: payloadForm.age.trim(),
      location: payloadForm.location.trim(),
      type: payloadForm.type,
      gender: payloadForm.gender,
      details: String(payloadForm.details || "").trim(),
      traits: normalizePetTraits(payloadForm.traits),
      image: payloadForm.images[0],
      images: payloadForm.images,
    };

    try {
      if (isEditMode) {
        await updatePet(editId, payload);
        navigate(`/adopt/${editId}`, { replace: true });
      } else {
        await createPet(payload);
        navigate("/", { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setFormError("Please log in again to continue.");
        navigate("/login", {
          replace: true,
          state: {
            from: isEditMode ? `/edit-post/${editId}` : "/create-post",
          },
        });
      } else if (err.response?.status === 403) {
        setFormError(
          err.response?.data?.message || "You can only edit your own listing.",
        );
      } else {
        setFormError(
          err.response?.data?.message ||
            (isEditMode ? "Could not save changes." : "Could not create post."),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthed) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <p className={styles.eyebrow}>Adoption listing</p>
            <h1>{isEditMode ? "Edit listing" : "Create Adoption Post"}</h1>
            <p>
              {isEditMode
                ? "Update details or photos for your listing."
                : "Share a pet looking for a home — add details and up to 3 photos."}
            </p>
          </div>

          {isLoadingEdit ? (
            <p className={styles.uploadHint}>Loading your listing…</p>
          ) : null}

          <form
            className={styles.form}
            onSubmit={handleSubmit}
            style={isLoadingEdit ? { opacity: 0.55, pointerEvents: "none" } : undefined}
          >
            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>Pet name *</label>
                <input
                  className={inputClass("name")}
                  value={formData.name}
                  onChange={handleChange("name")}
                  onBlur={handleBlur("name")}
                  placeholder="Max"
                />
                {fieldErrors.name && (
                  <p className={styles.fieldError}>{fieldErrors.name}</p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Type *</label>
                <select
                  className={inputClass("type")}
                  value={formData.type}
                  onChange={handleChange("type")}
                  onBlur={handleBlur("type")}
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                </select>
                {fieldErrors.type && (
                  <p className={styles.fieldError}>{fieldErrors.type}</p>
                )}
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>Breed *</label>
                <div className={styles.dropdown} ref={breedMenuRef}>
                  <button
                    type="button"
                    className={`${styles.dropdownTrigger} ${inputClass("breed")}`}
                    aria-haspopup="listbox"
                    aria-expanded={breedMenuOpen}
                    onClick={() => {
                      setBreedMenuOpen((open) => !open);
                      closeOtherMenus("breed");
                      if (!breedMenuOpen) setBreedFilter("");
                    }}
                  >
                    <span>{formData.breed || "Select breed"}</span>
                    <span className={styles.dropdownCaret} aria-hidden="true">
                      ▾
                    </span>
                  </button>
                  {breedMenuOpen ? (
                    <div className={styles.dropdownPanel}>
                      <input
                        type="text"
                        className={styles.dropdownSearch}
                        value={breedFilter}
                        onChange={(e) => setBreedFilter(e.target.value)}
                        placeholder="Search breed..."
                        aria-label="Search breed"
                        autoFocus
                      />
                      <ul
                        className={styles.dropdownMenu}
                        role="listbox"
                        aria-label="Pet breed"
                      >
                        {filteredBreeds.length ? (
                          filteredBreeds.map((breed) => (
                            <li key={breed}>
                              <button
                                type="button"
                                role="option"
                                aria-selected={formData.breed === breed}
                                className={`${styles.dropdownOption}${
                                  formData.breed === breed
                                    ? ` ${styles.dropdownOptionActive}`
                                    : ""
                                }`}
                                onClick={() => selectBreed(breed)}
                              >
                                {breed}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className={styles.dropdownEmpty}>
                            No breeds match
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : null}
                </div>
                {fieldErrors.breed && (
                  <p className={styles.fieldError}>{fieldErrors.breed}</p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Gender *</label>
                <select
                  className={inputClass("gender")}
                  value={formData.gender}
                  onChange={handleChange("gender")}
                  onBlur={handleBlur("gender")}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {fieldErrors.gender && (
                  <p className={styles.fieldError}>{fieldErrors.gender}</p>
                )}
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>Age *</label>
                <div className={styles.dropdown} ref={ageMenuRef}>
                  <button
                    type="button"
                    className={`${styles.dropdownTrigger} ${inputClass("age")}`}
                    aria-haspopup="listbox"
                    aria-expanded={ageMenuOpen}
                    onClick={() => {
                      setAgeMenuOpen((open) => !open);
                      closeOtherMenus("age");
                    }}
                  >
                    <span>
                      {formData.age || "Select age"}
                    </span>
                    <span className={styles.dropdownCaret} aria-hidden="true">
                      ▾
                    </span>
                  </button>
                  {ageMenuOpen ? (
                    <div className={styles.dropdownPanel}>
                      <ul
                        className={styles.dropdownMenu}
                        role="listbox"
                        aria-label="Pet age"
                      >
                        {ageOptions.map((option) => (
                          <li key={option}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={formData.age === option}
                              className={`${styles.dropdownOption}${
                                formData.age === option
                                  ? ` ${styles.dropdownOptionActive}`
                                  : ""
                              }`}
                              onClick={() => selectAge(option)}
                            >
                              {option}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
                {fieldErrors.age && (
                  <p className={styles.fieldError}>{fieldErrors.age}</p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Location *</label>
                <div className={styles.dropdown} ref={locationMenuRef}>
                  <button
                    type="button"
                    className={`${styles.dropdownTrigger} ${inputClass("location")}`}
                    aria-haspopup="listbox"
                    aria-expanded={locationMenuOpen}
                    onClick={() => {
                      setLocationMenuOpen((open) => !open);
                      closeOtherMenus("location");
                      if (!locationMenuOpen) setLocationFilter("");
                    }}
                  >
                    <span>{formData.location || "Select city"}</span>
                    <span className={styles.dropdownCaret} aria-hidden="true">
                      ▾
                    </span>
                  </button>
                  {locationMenuOpen ? (
                    <div className={styles.dropdownPanel}>
                      <input
                        type="text"
                        className={styles.dropdownSearch}
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        placeholder="Search city..."
                        aria-label="Search city"
                        autoFocus
                      />
                      <ul
                        className={styles.dropdownMenu}
                        role="listbox"
                        aria-label="City in Israel"
                      >
                        {filteredCities.length ? (
                          filteredCities.map((city) => (
                            <li key={city}>
                              <button
                                type="button"
                                role="option"
                                aria-selected={formData.location === city}
                                className={`${styles.dropdownOption}${
                                  formData.location === city
                                    ? ` ${styles.dropdownOptionActive}`
                                    : ""
                                }`}
                                onClick={() => selectLocation(city)}
                              >
                                {city}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className={styles.dropdownEmpty}>No cities match</li>
                        )}
                      </ul>
                    </div>
                  ) : null}
                </div>
                {fieldErrors.location && (
                  <p className={styles.fieldError}>{fieldErrors.location}</p>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>About this animal</label>
              <textarea
                className={`${styles.input} ${styles.textarea}${
                  fieldErrors.details ? ` ${styles.inputInvalid}` : ""
                }`}
                value={formData.details}
                onChange={handleChange("details")}
                onBlur={handleBlur("details")}
                rows={5}
                maxLength={2000}
                placeholder="Personality, habits, medical notes, why they need a home — write freely."
              />
              <p className={styles.uploadHint}>
                Optional · {String(formData.details || "").length}/2000
              </p>
              {fieldErrors.details && (
                <p className={styles.fieldError}>{fieldErrors.details}</p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Extra details</label>
              <p className={styles.uploadHint}>
                Optional — check what applies so adopters know more at a glance.
              </p>
              <div className={styles.traitGrid}>
                {PET_TRAIT_OPTIONS.map((trait) => (
                  <label key={trait.id} className={styles.traitCheck}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.traits?.[trait.id])}
                      onChange={() => toggleTrait(trait.id)}
                    />
                    <span>{trait.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Photos * (up to 3)</label>
              <div className={styles.uploadRow}>
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={formData.images.length >= MAX_IMAGES || isSubmitting}
                >
                  Add photos
                </button>
                <span className={styles.uploadHint}>
                  {formData.images.length}/{MAX_IMAGES} selected · auto-compressed
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className={styles.hiddenFile}
                  onChange={handleImagesSelected}
                />
              </div>
              {fieldErrors.images && (
                <p className={styles.fieldError}>{fieldErrors.images}</p>
              )}

              {formData.images.length > 0 && (
                <div className={styles.previewGrid}>
                  {formData.images.map((src, index) => (
                    <div key={`${index}-${src.slice(0, 24)}`} className={styles.previewCard}>
                      <img src={src} alt={`Pet preview ${index + 1}`} />
                      {index === 0 && (
                        <span className={styles.coverBadge}>Cover</span>
                      )}
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeImage(index)}
                        aria-label={`Remove photo ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {formError && <p className={styles.formError}>{formError}</p>}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() =>
                  navigate(isEditMode ? `/adopt/${editId}` : "/")
                }
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting || isLoadingEdit}
              >
                {isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Publishing..."
                  : isEditMode
                    ? "Save changes"
                    : "Publish post"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CreateAdoptionPost;
