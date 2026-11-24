/**
 * =============================================================================
 * FILE: client/src/pages/CreateAdoptionPost.jsx
 * ROLE: Create a new adoption listing (POST /api/pets)
 * =============================================================================
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import styles from "../styles/createAdoptionPost.module.css";
import { createPet } from "../services/userService";
import {
  getCreatePetFieldError,
  validateCreatePetForm,
} from "../utils/createPetValidation";

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
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    location: "",
    type: "dog",
    gender: "Male",
    images: [],
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthed, setIsAuthed] = useState(
    () => Boolean(localStorage.getItem("token")),
  );

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem("token"));
    setIsAuthed(hasToken);
    if (!hasToken) {
      navigate("/login", { replace: true, state: { from: "/create-post" } });
    }
  }, [navigate]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (touched[field] || fieldErrors[field]) {
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          [field]: getCreatePetFieldError(field, value, next),
        }));
      }
      return next;
    });
    setFormError("");
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
    const errors = validateCreatePetForm(formData);
    setFieldErrors(errors);
    setTouched({
      name: true,
      breed: true,
      age: true,
      location: true,
      type: true,
      gender: true,
      images: true,
    });

    if (Object.keys(errors).length) {
      setFormError("Please fix the highlighted fields before publishing.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      await createPet({
        name: formData.name.trim(),
        breed: formData.breed.trim(),
        age: formData.age.trim(),
        location: formData.location.trim(),
        type: formData.type,
        gender: formData.gender,
        image: formData.images[0],
        images: formData.images,
      });
      navigate("/", { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setFormError("Please log in again to publish a post.");
        navigate("/login", { replace: true, state: { from: "/create-post" } });
      } else {
        setFormError(err.response?.data?.message || "Could not create post.");
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
            <h1>Create Adoption Post</h1>
            <p>
              Share a pet looking for a home — add details and up to 3 photos.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
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
                <label className={styles.label}>Breed *</label>
                <input
                  className={inputClass("breed")}
                  value={formData.breed}
                  onChange={handleChange("breed")}
                  onBlur={handleBlur("breed")}
                  placeholder="Golden Retriever"
                />
                {fieldErrors.breed && (
                  <p className={styles.fieldError}>{fieldErrors.breed}</p>
                )}
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>Age *</label>
                <input
                  className={inputClass("age")}
                  value={formData.age}
                  onChange={handleChange("age")}
                  onBlur={handleBlur("age")}
                  placeholder="2 years"
                />
                {fieldErrors.age && (
                  <p className={styles.fieldError}>{fieldErrors.age}</p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Location *</label>
                <input
                  className={inputClass("location")}
                  value={formData.location}
                  onChange={handleChange("location")}
                  onBlur={handleBlur("location")}
                  placeholder="Tel Aviv"
                />
                {fieldErrors.location && (
                  <p className={styles.fieldError}>{fieldErrors.location}</p>
                )}
              </div>
            </div>

            <div className={styles.grid}>
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
                onClick={() => navigate("/")}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publishing..." : "Publish post"}
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
