/**
 * =============================================================================
 * FILE: client/src/pages/AdoptPet.jsx
 * ROLE: Pet detail — gallery, like/favorite, comments, adopt request, report
 * =============================================================================
 * Sections: LOAD PET | LIKE / FAVORITE | COMMENTS | REMOVE | REPORT | RENDER
 * =============================================================================
 */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import PetImageCarousel from "../Components/features/PetImageCarousel";
import {
  addPetComment,
  deletePet,
  deletePetComment,
  getPet,
  getPetStats,
  recordPetView,
  togglePetFavorite,
  togglePetLike,
} from "../services/userService";
import { createAdoptionApplication } from "../services/applicationService";
import { getProfile } from "../services/authService";
import { createReport } from "../services/reportService";
import { useMessageChat } from "../contexts/MessageChatContext";
import styles from "../styles/adoptPet.module.css";
import { PET_TRAIT_OPTIONS } from "../utils/createPetValidation";

const REPORT_REASON_OPTIONS = [
  "Spam",
  "Inappropriate content",
  "Harassment",
  "Misleading information",
  "Scam / fraud",
  "Other",
];

function getStatusLabel(status) {
  const value = String(status || "").toLowerCase();
  if (value === "available") return "Looking for a home";
  if (value === "pending") return "Meetups in progress";
  if (value === "adopted") return "Found a loving home";
  return status || "Unknown";
}

/** Capitalize only the first letter (e.g. cat -> Cat). */
function capitalizeFirst(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function petOwnerLabel(pet) {
  const first = pet?.ownerFirstName || "";
  const last = pet?.ownerLastName || "";
  const full = `${first} ${last}`.trim();
  return full || pet?.ownerUsername || "";
}

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

function AdoptPet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openChat } = useMessageChat();

  const [pet, setPet] = useState(null);
  const currentUserId = getCurrentUserId();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestForm, setRequestForm] = useState({
    phone: "",
    message: "",
  });
  const [accountLabel, setAccountLabel] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [isCommenting, setIsCommenting] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState(REPORT_REASON_OPTIONS[0]);
  const [reportDescription, setReportDescription] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const images = useMemo(() => {
    if (!pet) return [];
    if (Array.isArray(pet.images) && pet.images.length) return pet.images;
    return [pet.image].filter(Boolean);
  }, [pet]);

  const isLiked = Boolean(pet?.likedByMe);
  const isFavorited = Boolean(pet?.favoritedByMe);
  const hasRequested = Boolean(pet?.requestedByMe);
  const isOwnPet =
    pet?.ownerId != null &&
    currentUserId != null &&
    Number(pet.ownerId) === Number(currentUserId);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true, state: { from: `/adopt/${id}` } });
      return;
    }

    let active = true;
    const loadPet = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getPet(id);
        if (!active) return;
        setPet(res.data);
        setComments(res.data?.comments || []);
        setLikeCount(Number(res.data?.likeCount || 0));

        // Count at most one view per pet per browser tab session
        // (also avoids React Strict Mode double-mount counting twice).
        const viewKey = `petViewCounted:${id}`;
        if (!sessionStorage.getItem(viewKey)) {
          sessionStorage.setItem(viewKey, "1");
          // Bump immediately so the counter feels live.
          setPet((prev) =>
            prev
              ? { ...prev, viewCount: Number(prev.viewCount || 0) + 1 }
              : prev,
          );
          try {
            const viewRes = await recordPetView(id);
            if (!active) return;
            setPet((prev) =>
              prev
                ? {
                    ...prev,
                    viewCount: Number(
                      viewRes.data?.viewCount ?? prev.viewCount ?? 0,
                    ),
                  }
                : prev,
            );
          } catch {
            sessionStorage.removeItem(viewKey);
            setPet((prev) =>
              prev
                ? {
                    ...prev,
                    viewCount: Math.max(0, Number(prev.viewCount || 0) - 1),
                  }
                : prev,
            );
          }
        }
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || "Could not load this pet.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPet();

    const loadAccount = async () => {
      try {
        const res = await getProfile();
        if (!active) return;
        const user = res.data?.user;
        if (!user) return;
        const name =
          `${user.firstName || user.firstname || ""} ${user.lastName || user.lastname || ""}`.trim() ||
          user.username ||
          "your account";
        const email = String(user.email || "").trim();
        setAccountLabel(email ? `${name} · ${email}` : name);
        if (user.phone) {
          setRequestForm((prev) =>
            prev.phone ? prev : { ...prev, phone: String(user.phone) },
          );
        }
      } catch {
        // Form still works — server fills name/email from the session.
      }
    };
    loadAccount();

    return () => {
      active = false;
    };
  }, [id, navigate]);

  // Keep views (and other engagement) fresh while the page stays open.
  useEffect(() => {
    if (!id || loading || error || !pet?.id) return undefined;

    let active = true;
    const syncStats = async () => {
      try {
        const res = await getPetStats(id);
        if (!active) return;
        const nextViews = Number(res.data?.viewCount);
        const nextLikes = Number(res.data?.likeCount);
        const nextComments = Number(res.data?.commentCount);
        setPet((prev) => {
          if (!prev) return prev;
          const patch = {};
          if (Number.isFinite(nextViews) && nextViews !== Number(prev.viewCount || 0)) {
            patch.viewCount = nextViews;
          }
          if (
            Number.isFinite(nextComments) &&
            nextComments !== Number(prev.commentCount || 0)
          ) {
            patch.commentCount = nextComments;
          }
          return Object.keys(patch).length ? { ...prev, ...patch } : prev;
        });
        if (Number.isFinite(nextLikes)) {
          setLikeCount((prev) => (prev === nextLikes ? prev : nextLikes));
        }
      } catch {
        // Ignore transient poll errors.
      }
    };

    const intervalId = window.setInterval(syncStats, 3000);
    const onFocus = () => {
      syncStats();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") syncStats();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [id, loading, error, pet?.id]);

  // ======================== LIKE ========================
  const toggleLike = async () => {
    if (!pet || isLiking) return;
    setIsLiking(true);
    const wasLiked = isLiked;
    setLikeCount((prev) => Math.max(0, prev + (wasLiked ? -1 : 1)));
    setPet((prev) => (prev ? { ...prev, likedByMe: !wasLiked } : prev));

    try {
      const res = await togglePetLike(pet.id);
      setLikeCount(Number(res.data?.likeCount || 0));
      setPet((prev) =>
        prev ? { ...prev, likedByMe: Boolean(res.data?.liked) } : prev,
      );
    } catch {
      setLikeCount((prev) => Math.max(0, prev + (wasLiked ? 1 : -1)));
      setPet((prev) => (prev ? { ...prev, likedByMe: wasLiked } : prev));
    } finally {
      setIsLiking(false);
    }
  };

  // ======================== FAVORITE ========================
  const toggleFavorite = async () => {
    if (!pet || isFavoriting) return;
    setIsFavoriting(true);
    const wasFavorited = isFavorited;
    setPet((prev) =>
      prev ? { ...prev, favoritedByMe: !wasFavorited } : prev,
    );

    try {
      const res = await togglePetFavorite(pet.id);
      setPet((prev) =>
        prev
          ? { ...prev, favoritedByMe: Boolean(res.data?.favorited) }
          : prev,
      );
    } catch {
      setPet((prev) =>
        prev ? { ...prev, favoritedByMe: wasFavorited } : prev,
      );
    } finally {
      setIsFavoriting(false);
    }
  };

  // ======================== COMMENTS ========================
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) {
      setCommentError("Write a short comment first.");
      return;
    }
    setIsCommenting(true);
    setCommentError("");
    try {
      const res = await addPetComment(pet.id, text);
      if (res.data?.comment) {
        setComments((prev) => [res.data.comment, ...prev]);
      }
      setPet((prev) =>
        prev
          ? {
              ...prev,
              commentCount: Number(
                res.data?.commentCount ?? Number(prev.commentCount || 0) + 1,
              ),
            }
          : prev,
      );
      setCommentText("");
    } catch (err) {
      setCommentError(
        err.response?.data?.message || "Could not post comment.",
      );
    } finally {
      setIsCommenting(false);
    }
  };

  const commentAuthor = (comment) => {
    const first = comment?.firstName || "";
    const last = comment?.lastName || "";
    const full = `${first} ${last}`.trim();
    return full || comment?.username || "User";
  };

  const handleRemoveComment = async (comment) => {
    if (!pet?.id || !comment?.id || deletingCommentId) return;
    const ok = window.confirm("Remove this comment?");
    if (!ok) return;
    setDeletingCommentId(comment.id);
    setCommentError("");
    try {
      const res = await deletePetComment(pet.id, comment.id);
      setComments((prev) => prev.filter((item) => item.id !== comment.id));
      setPet((prev) =>
        prev
          ? {
              ...prev,
              commentCount: Number(
                res.data?.commentCount ??
                  Math.max(0, Number(prev.commentCount || 0) - 1),
              ),
            }
          : prev,
      );
    } catch (err) {
      setCommentError(
        err.response?.data?.message || "Could not remove comment.",
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  // ======================== REMOVE LISTING ========================
  const handleRemoveListing = async () => {
    if (!pet?.id) return;
    setIsRemoving(true);
    setRemoveError("");
    try {
      await deletePet(pet.id);
      setShowRemoveConfirm(false);
      navigate("/", { replace: true });
    } catch (err) {
      setRemoveError(
        err.response?.data?.message || "Could not remove this listing.",
      );
    } finally {
      setIsRemoving(false);
    }
  };

  // ======================== REPORT ========================
  const openReport = (targetType, targetId, label) => {
    setReportTarget({ targetType, targetId, label });
    setReportReason(REPORT_REASON_OPTIONS[0]);
    setReportDescription("");
    setReportError("");
    setReportSuccess("");
  };

  const closeReport = () => {
    if (isReporting) return;
    setReportTarget(null);
    setReportError("");
  };

  const handleSubmitReport = async () => {
    if (!reportTarget) return;
    const reason = String(reportReason || "").trim();
    const description = String(reportDescription || "").trim();
    if (!reason) {
      setReportError("Choose a reason.");
      return;
    }

    setIsReporting(true);
    setReportError("");
    try {
      await createReport({
        targetType: reportTarget.targetType,
        targetId: reportTarget.targetId,
        reason,
        description,
      });
      setReportSuccess("Report submitted. An admin will review it.");
      setTimeout(() => {
        setReportTarget(null);
        setReportSuccess("");
      }, 1200);
    } catch (err) {
      setReportError(
        err.response?.data?.message || "Could not submit report.",
      );
    } finally {
      setIsReporting(false);
    }
  };

  const handleRequestChange = (field) => (e) => {
    setRequestForm((prev) => ({ ...prev, [field]: e.target.value }));
    setRequestError("");
    setRequestSuccess("");
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const message = requestForm.message.trim();

    if (!message) {
      setRequestError("Please write a short message for the owner.");
      return;
    }

    setIsSending(true);
    setRequestError("");
    setRequestSuccess("");

    try {
      await createAdoptionApplication({
        petId: pet.id,
        phone: requestForm.phone.trim(),
        message,
      });
      setPet((prev) =>
        prev
          ? {
              ...prev,
              requestedByMe: true,
              myApplicationStatus: "pending",
            }
          : prev,
      );
      setRequestSuccess(
        `Thanks! Your adoption request for ${pet.name} was sent to the owner.`,
      );
      setRequestForm((prev) => ({ ...prev, message: "" }));
    } catch (err) {
      setRequestError(
        err.response?.data?.message || "Could not send adoption request.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate("/")}
          >
            <span className={styles.backIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 6 9 12l6 6"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Back to pets
          </button>

          {loading && <div className={styles.stateCard}>Loading pet details...</div>}
          {!loading && error && (
            <div className={styles.stateCard}>
              <p>{error}</p>
              <button type="button" onClick={() => navigate("/")}>
                Browse pets
              </button>
            </div>
          )}

          {!loading && !error && pet && (
            <div className={styles.layout}>
              <div className={styles.leftColumn}>
                <section className={styles.galleryCard}>
                  <div className={styles.gallery}>
                    <PetImageCarousel
                      images={images}
                      alt={pet.name}
                      className={styles.galleryCarousel}
                    />
                  </div>
                </section>

                <section className={styles.commentsSection}>
                  <h2>Comments ({comments.length})</h2>
                  <form
                    className={styles.commentForm}
                    onSubmit={handleCommentSubmit}
                  >
                    <textarea
                      rows={3}
                      placeholder={`Share a thought about ${pet.name}...`}
                      value={commentText}
                      onChange={(e) => {
                        setCommentText(e.target.value);
                        setCommentError("");
                      }}
                    />
                    {commentError && (
                      <p className={styles.requestError}>{commentError}</p>
                    )}
                    <button
                      type="submit"
                      className={styles.commentSubmit}
                      disabled={isCommenting}
                    >
                      {isCommenting ? "Posting..." : "Post comment"}
                    </button>
                  </form>

                  {comments.length === 0 ? (
                    <p className={styles.commentsEmpty}>
                      No comments yet. Be the first to leave one.
                    </p>
                  ) : (
                    <>
                      {(() => {
                        const ownerId = pet?.ownerId != null ? Number(pet.ownerId) : null;
                        const myComments = comments.filter(
                          (c) =>
                            currentUserId != null &&
                            Number(c.userId) === Number(currentUserId),
                        );
                        const othersOnMyPost = isOwnPet
                          ? comments.filter(
                              (c) =>
                                Number(c.userId) !== Number(currentUserId),
                            )
                          : comments.filter(
                              (c) =>
                                !(
                                  currentUserId != null &&
                                  Number(c.userId) === Number(currentUserId)
                                ),
                            );

                        const renderComment = (comment) => {
                          const isMine =
                            currentUserId != null &&
                            Number(comment.userId) === Number(currentUserId);
                          const isOwnerComment =
                            ownerId != null &&
                            Number(comment.userId) === ownerId;
                          return (
                            <li
                              key={comment.id}
                              className={`${styles.commentItem} ${
                                isMine
                                  ? styles.commentItemMine
                                  : isOwnerComment
                                    ? styles.commentItemOwner
                                    : styles.commentItemOther
                              }`}
                            >
                              <div className={styles.commentHeader}>
                                {comment.avatar ? (
                                  <img
                                    src={comment.avatar}
                                    alt=""
                                    className={styles.commentAvatar}
                                  />
                                ) : (
                                  <div className={styles.commentAvatarFallback}>
                                    {commentAuthor(comment)
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}
                                <div className={styles.commentMeta}>
                                  <div className={styles.commentNameRow}>
                                    <strong>{commentAuthor(comment)}</strong>
                                    {isMine ? (
                                      <span className={styles.commentBadgeYou}>
                                        You
                                      </span>
                                    ) : null}
                                    {!isMine && isOwnerComment ? (
                                      <span
                                        className={styles.commentBadgeOwner}
                                      >
                                        Listing owner
                                      </span>
                                    ) : null}
                                  </div>
                                  <span>
                                    {comment.createdAt
                                      ? new Date(
                                          comment.createdAt,
                                        ).toLocaleString()
                                      : ""}
                                  </span>
                                </div>
                              </div>
                              <p>{comment.text}</p>
                              {isMine ? (
                                <button
                                  type="button"
                                  className={styles.removeCommentBtn}
                                  disabled={deletingCommentId === comment.id}
                                  onClick={() => handleRemoveComment(comment)}
                                >
                                  {deletingCommentId === comment.id
                                    ? "Removing…"
                                    : "Remove comment"}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className={styles.reportLinkBtn}
                                  onClick={() =>
                                    openReport(
                                      "comment",
                                      comment.id,
                                      `comment by ${commentAuthor(comment)}`,
                                    )
                                  }
                                >
                                  Report comment
                                </button>
                              )}
                            </li>
                          );
                        };

                        if (isOwnPet) {
                          return (
                            <div className={styles.commentGroups}>
                              <div>
                                <h3 className={styles.commentGroupTitle}>
                                  Comments on your listing (
                                  {othersOnMyPost.length})
                                </h3>
                                {othersOnMyPost.length === 0 ? (
                                  <p className={styles.commentsEmpty}>
                                    No comments from others yet.
                                  </p>
                                ) : (
                                  <ul className={styles.commentList}>
                                    {othersOnMyPost.map(renderComment)}
                                  </ul>
                                )}
                              </div>
                              <div>
                                <h3 className={styles.commentGroupTitle}>
                                  Your comments ({myComments.length})
                                </h3>
                                {myComments.length === 0 ? (
                                  <p className={styles.commentsEmpty}>
                                    You haven&apos;t commented on this listing
                                    yet.
                                  </p>
                                ) : (
                                  <ul className={styles.commentList}>
                                    {myComments.map(renderComment)}
                                  </ul>
                                )}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className={styles.commentGroups}>
                            {myComments.length > 0 ? (
                              <div>
                                <h3 className={styles.commentGroupTitle}>
                                  Your comments ({myComments.length})
                                </h3>
                                <ul className={styles.commentList}>
                                  {myComments.map(renderComment)}
                                </ul>
                              </div>
                            ) : null}
                            <div>
                              {myComments.length > 0 ? (
                                <h3 className={styles.commentGroupTitle}>
                                  Other comments ({othersOnMyPost.length})
                                </h3>
                              ) : null}
                              <ul className={styles.commentList}>
                                {othersOnMyPost.map(renderComment)}
                              </ul>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </section>
              </div>

              <section className={styles.detailsCard}>
                <div className={styles.titleRow}>
                  <div>
                    <p className={styles.eyebrow}>
                      {capitalizeFirst(pet.type)} · {capitalizeFirst(pet.gender)}
                    </p>
                    <h1>{pet.name}</h1>
                    <p className={styles.breed}>{pet.breed}</p>
                  </div>
                  <div className={styles.engagementActions}>
                    <div className={styles.likeWrap}>
                      <button
                        type="button"
                        className={`${styles.favoriteBtn} ${
                          isFavorited ? styles.favorited : ""
                        }`}
                        onClick={toggleFavorite}
                        disabled={isFavoriting}
                        aria-label={
                          isFavorited
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill={isFavorited ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>
                    <div className={styles.likeWrap}>
                      <button
                        type="button"
                        className={`${styles.likeBtn} ${isLiked ? styles.liked : ""}`}
                        onClick={toggleLike}
                        disabled={isLiking}
                        aria-label={isLiked ? "Unlike" : "Like"}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill={isLiked ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                      <span className={styles.likeCount}>{likeCount}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.statsRow}>
                  <span>{likeCount} likes</span>
                  <span>{Number(pet.commentCount || comments.length)} comments</span>
                  <span>{Number(pet.viewCount || 0)} views</span>
                </div>

                <span
                  className={`${styles.statusBadge} ${
                    String(pet.status || "").toLowerCase() === "available"
                      ? styles.statusAvailable
                      : styles.statusOther
                  }`}
                >
                  {getStatusLabel(pet.status)}
                </span>

                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <span>Age</span>
                    <strong>{pet.age}</strong>
                  </div>
                  <div className={styles.metaItem}>
                    <span>Location</span>
                    <strong>{pet.location}</strong>
                  </div>
                  <div className={styles.metaItem}>
                    <span>Type</span>
                    <strong>{capitalizeFirst(pet.type)}</strong>
                  </div>
                  <div className={styles.metaItem}>
                    <span>Gender</span>
                    <strong>{capitalizeFirst(pet.gender)}</strong>
                  </div>
                  {petOwnerLabel(pet) ? (
                    <div className={styles.metaItem}>
                      <span>Posted by</span>
                      <div className={styles.postedByRow}>
                        {pet.ownerAvatar ? (
                          <img
                            src={pet.ownerAvatar}
                            alt=""
                            className={styles.postedByAvatar}
                          />
                        ) : (
                          <div className={styles.postedByAvatarFallback}>
                            {petOwnerLabel(pet).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <strong>{petOwnerLabel(pet)}</strong>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className={styles.aboutBlock}>
                  <h2>About {pet.name}</h2>
                  {String(pet.details || "").trim() ? (
                    <p className={styles.aboutDetails}>
                      {String(pet.details).trim()}
                    </p>
                  ) : (
                    <p>
                      {pet.name} is a {String(pet.age || "").toLowerCase()}{" "}
                      {pet.breed} looking for a loving home in {pet.location}.
                      {!isOwnPet &&
                        " If this feels like the right match, send an adoption request below and we'll help connect you."}
                    </p>
                  )}
                  {PET_TRAIT_OPTIONS.some((trait) => pet.traits?.[trait.id]) ? (
                    <ul className={styles.traitList}>
                      {PET_TRAIT_OPTIONS.filter(
                        (trait) => pet.traits?.[trait.id],
                      ).map((trait) => (
                        <li key={trait.id}>{trait.label}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                {isOwnPet && (
                  <div className={styles.ownerActions}>
                    <p className={styles.ownerActionsHint}>
                      This is your listing. You can edit details or remove it
                      anytime.
                    </p>
                    {removeError ? (
                      <p className={styles.requestError}>{removeError}</p>
                    ) : null}
                    <div className={styles.ownerActionRow}>
                      <button
                        type="button"
                        className={styles.editListingBtn}
                        onClick={() => navigate(`/edit-post/${pet.id}`)}
                      >
                        Edit listing
                      </button>
                      <button
                        type="button"
                        className={styles.removeListingBtn}
                        onClick={() => {
                          setRemoveError("");
                          setShowRemoveConfirm(true);
                        }}
                      >
                        Remove listing
                      </button>
                    </div>
                  </div>
                )}

                {!isOwnPet && pet?.ownerId != null && (
                  <div className={styles.messageOwnerWrap}>
                    <button
                      type="button"
                      className={styles.messageOwnerBtn}
                      onClick={() => {
                        if (!localStorage.getItem("token")) {
                          navigate("/login");
                          return;
                        }
                        openChat({ petId: pet.id });
                      }}
                    >
                      Message owner
                    </button>
                    <p className={styles.messageOwnerHint}>
                      Ask a question about {pet.name} before you apply.
                    </p>
                  </div>
                )}

                {!isOwnPet && (
                  <div className={styles.reportListingWrap}>
                    <button
                      type="button"
                      className={styles.reportLinkBtn}
                      onClick={() =>
                        openReport(
                          "pet",
                          pet.id,
                          `listing for ${pet.name}`,
                        )
                      }
                    >
                      Report this listing
                    </button>
                  </div>
                )}

                {!isOwnPet && hasRequested ? (
                  <div className={styles.requestedBox}>
                    <span className={styles.requestedTag}>Requested</span>
                    <p className={styles.requestedCopy}>
                      You already sent an adoption request for {pet.name}. The
                      owner will review it and update you.
                    </p>
                    {requestSuccess ? (
                      <p className={styles.requestSuccess}>{requestSuccess}</p>
                    ) : null}
                  </div>
                ) : null}

                {!isOwnPet && !hasRequested ? (
                  <form
                    className={styles.requestForm}
                    onSubmit={handleRequestSubmit}
                  >
                    <h2>Request to adopt</h2>
                    {accountLabel ? (
                      <p className={styles.requestAccountNote}>
                        Sending as <strong>{accountLabel}</strong>
                      </p>
                    ) : null}
                    <input
                      type="tel"
                      placeholder="Phone (optional)"
                      value={requestForm.phone}
                      onChange={handleRequestChange("phone")}
                    />
                    <textarea
                      placeholder={`Tell us why you'd like to adopt ${pet.name} *`}
                      rows={4}
                      value={requestForm.message}
                      onChange={handleRequestChange("message")}
                    />

                    {requestError && (
                      <p className={styles.requestError}>{requestError}</p>
                    )}
                    {requestSuccess && (
                      <p className={styles.requestSuccess}>{requestSuccess}</p>
                    )}

                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={isSending}
                    >
                      {isSending ? "Sending..." : `Adopt ${pet.name}`}
                    </button>
                  </form>
                ) : null}
              </section>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {showRemoveConfirm &&
        createPortal(
          <div
            className={styles.confirmOverlay}
            onClick={() => (!isRemoving ? setShowRemoveConfirm(false) : null)}
            role="presentation"
          >
            <div
              className={styles.confirmModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="adopt-remove-title"
              onClick={(e) => e.stopPropagation()}
            >
              <p className={styles.confirmEyebrow}>Remove listing</p>
              <h2 id="adopt-remove-title" className={styles.confirmTitle}>
                Remove {pet?.name || "this pet"}?
              </h2>
              <p className={styles.confirmBody}>
                This will permanently remove the adoption post and any related
                requests. This can&apos;t be undone.
              </p>
              {removeError ? (
                <p className={styles.requestError}>{removeError}</p>
              ) : null}
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.confirmKeepBtn}
                  disabled={isRemoving}
                  onClick={() => setShowRemoveConfirm(false)}
                >
                  Keep listing
                </button>
                <button
                  type="button"
                  className={styles.confirmRemoveBtn}
                  disabled={isRemoving}
                  onClick={handleRemoveListing}
                >
                  {isRemoving ? "Removing..." : "Remove listing"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {reportTarget &&
        createPortal(
          <div
            className={styles.confirmOverlay}
            onClick={closeReport}
            role="presentation"
          >
            <div
              className={styles.confirmModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="report-title"
              onClick={(e) => e.stopPropagation()}
            >
              <p className={styles.confirmEyebrow}>Report</p>
              <h2 id="report-title" className={styles.confirmTitle}>
                Report {reportTarget.label}
              </h2>
              <p className={styles.confirmBody}>
                Choose a reason. An admin will review this report.
              </p>

              <label className={styles.reportField}>
                <span>Reason</span>
                <select
                  value={reportReason}
                  onChange={(e) => {
                    setReportReason(e.target.value);
                    setReportError("");
                  }}
                  disabled={isReporting}
                >
                  {REPORT_REASON_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.reportField}>
                <span>Details (optional)</span>
                <textarea
                  rows={3}
                  placeholder="Add more context..."
                  value={reportDescription}
                  onChange={(e) => {
                    setReportDescription(e.target.value);
                    setReportError("");
                  }}
                  disabled={isReporting}
                />
              </label>

              {reportError ? (
                <p className={styles.requestError}>{reportError}</p>
              ) : null}
              {reportSuccess ? (
                <p className={styles.requestSuccess}>{reportSuccess}</p>
              ) : null}

              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.confirmKeepBtn}
                  disabled={isReporting}
                  onClick={closeReport}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.confirmRemoveBtn}
                  disabled={isReporting}
                  onClick={handleSubmitReport}
                >
                  {isReporting ? "Sending..." : "Submit report"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default AdoptPet;
