/**
 * =============================================================================
 * FILE: server/controllers/reportController.js
 * ROLE: User reports for listings / comments / users / bugs → admin queue
 * =============================================================================
 */
const { query, run } = require("../config/db");

const REPORT_REASONS = [
  "Spam",
  "Inappropriate content",
  "Harassment",
  "Misleading information",
  "Scam / fraud",
  "Other",
];

const BUG_REASONS = [
  "Broken page / crash",
  "Something looks wrong",
  "Feature not working",
  "Performance issue",
  "Other",
];

const MESSAGE_USER_REASONS = [
  "Harassment / bullying",
  "Spam / scam",
  "Inappropriate messages",
  "Threats / abuse",
  "Other",
];

const TARGET_TYPES = ["pet", "comment", "bug", "user"];
/** Sentinel targetId for site-wide bug reports (no pet/comment entity). */
const SITE_BUG_TARGET_ID = 1;
const MAX_SCREENSHOT_CHARS = 2_000_000;

// ======================== CREATE REPORT ========================
/** POST /api/reports — auth required. targetType: pet | comment | bug | user */
exports.createReport = async (req, res, next) => {
  try {
    const targetType = String(req.body?.targetType || "")
      .trim()
      .toLowerCase();
    const reason = String(req.body?.reason || "").trim();
    const description = String(req.body?.description || "").trim();
    const isBug = targetType === "bug";
    const isUser = targetType === "user";
    const targetId = isBug ? SITE_BUG_TARGET_ID : Number(req.body?.targetId);
    const threadId = Number(req.body?.threadId) || null;
    const screenshotRaw = String(req.body?.screenshot || "").trim();
    let screenshot = null;

    if (!TARGET_TYPES.includes(targetType)) {
      return res.status(400).json({
        message: "targetType must be pet, comment, bug, or user",
      });
    }
    if (!isBug && !targetId) {
      return res.status(400).json({ message: "Invalid target id" });
    }

    const allowedReasons = isBug
      ? BUG_REASONS
      : isUser
        ? MESSAGE_USER_REASONS
        : REPORT_REASONS;
    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({
        message: `Reason must be one of: ${allowedReasons.join(", ")}`,
      });
    }
    if (description.length > 1200) {
      return res.status(400).json({ message: "Description is too long" });
    }
    if (isBug && description.length < 10) {
      return res.status(400).json({
        message: "Please describe the bug in at least a few words",
      });
    }

    if (screenshotRaw) {
      if (!isBug) {
        return res
          .status(400)
          .json({ message: "Screenshots are only allowed on bug reports" });
      }
      if (
        !/^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(screenshotRaw)
      ) {
        return res.status(400).json({
          message: "Invalid screenshot format (use JPEG, PNG, WebP, or GIF)",
        });
      }
      if (screenshotRaw.length > MAX_SCREENSHOT_CHARS) {
        return res.status(400).json({ message: "Screenshot is too large" });
      }
      screenshot = screenshotRaw;
    }

    let relatedPetId = null;
    let relatedThreadId = null;
    let targetLabel = "a listing";
    let notifTitle = "New content report";
    let storedDescription = description || null;

    if (targetType === "pet") {
      const pets = await query(
        "SELECT id, ownerId, name FROM pets WHERE id = ? LIMIT 1",
        [targetId],
      );
      if (!pets[0]) {
        return res.status(404).json({ message: "Pet listing not found" });
      }
      if (Number(pets[0].ownerId) === Number(req.user.id)) {
        return res
          .status(400)
          .json({ message: "You cannot report your own listing" });
      }
      relatedPetId = targetId;
      targetLabel = pets[0].name
        ? `listing "${pets[0].name}"`
        : "a listing";
    } else if (targetType === "comment") {
      const comments = await query(
        "SELECT id, userId, petId FROM pet_comments WHERE id = ? LIMIT 1",
        [targetId],
      );
      if (!comments[0]) {
        return res.status(404).json({ message: "Comment not found" });
      }
      if (Number(comments[0].userId) === Number(req.user.id)) {
        return res
          .status(400)
          .json({ message: "You cannot report your own comment" });
      }
      relatedPetId = comments[0].petId || null;
      targetLabel = "a comment";
    } else if (isUser) {
      if (Number(targetId) === Number(req.user.id)) {
        return res
          .status(400)
          .json({ message: "You cannot report yourself" });
      }

      const users = await query(
        "SELECT id, username, firstName, lastName FROM users WHERE id = ? LIMIT 1",
        [targetId],
      );
      if (!users[0]) {
        return res.status(404).json({ message: "User not found" });
      }

      // Must share a messaging thread (optionally the one being viewed).
      let threadRows;
      if (threadId) {
        threadRows = await query(
          `
            SELECT id, petId, ownerId, participantId
            FROM message_threads
            WHERE id = ?
              AND (
                (ownerId = ? AND participantId = ?)
                OR (ownerId = ? AND participantId = ?)
              )
            LIMIT 1
          `,
          [threadId, req.user.id, targetId, targetId, req.user.id],
        );
      } else {
        threadRows = await query(
          `
            SELECT id, petId, ownerId, participantId
            FROM message_threads
            WHERE
              (ownerId = ? AND participantId = ?)
              OR (ownerId = ? AND participantId = ?)
            ORDER BY lastMessageAt DESC
            LIMIT 1
          `,
          [req.user.id, targetId, targetId, req.user.id],
        );
      }

      if (!threadRows[0]) {
        return res.status(400).json({
          message:
            "You can only report someone you have messaged about a listing",
        });
      }

      relatedPetId = threadRows[0].petId || null;
      relatedThreadId = Number(threadRows[0].id) || null;
      const display =
        `${users[0].firstName || ""} ${users[0].lastName || ""}`.trim() ||
        users[0].username ||
        `user #${targetId}`;
      targetLabel = `user "${display}" (messaging)`;
      notifTitle = "New messaging report";
      storedDescription = description || null;
    } else if (isBug) {
      targetLabel = "a site bug";
      notifTitle = "New bug report";
    }

    // Content / user reports: one pending per target. Bugs: allow multiple.
    if (!isBug) {
      const existing = await query(
        `
          SELECT id FROM content_reports
          WHERE reporterId = ? AND targetType = ? AND targetId = ?
            AND LOWER(status) = 'pending'
          LIMIT 1
        `,
        [req.user.id, targetType, targetId],
      );
      if (existing[0]) {
        return res.status(409).json({
          message: "You already reported this and it's pending review",
        });
      }
    }

    const result = await run(
      `
        INSERT INTO content_reports
          (reporterId, targetType, targetId, reason, description, screenshot, relatedThreadId, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `,
      [
        req.user.id,
        targetType,
        targetId,
        reason,
        storedDescription,
        screenshot,
        relatedThreadId,
        new Date(),
      ],
    );

    const admins = await query(
      "SELECT id FROM users WHERE LOWER(role) = 'admin' AND (isBanned IS NULL OR isBanned = 0)",
    );
    const body = `Someone reported ${targetLabel}: ${reason}${
      description ? ` — ${description}` : ""
    }`;
    const notifType = isUser
      ? "chat_report"
      : isBug
        ? "bug_report"
        : "content_report";
    const now = new Date();
    for (const admin of admins) {
      await run(
        `
          INSERT INTO notifications
            (userId, type, title, body, relatedPetId, relatedApplicationId, relatedThreadId, isRead, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          admin.id,
          notifType,
          notifTitle,
          body,
          relatedPetId,
          null,
          relatedThreadId,
          0,
          now,
        ],
      );
    }

    res.status(201).json({
      message: isBug
        ? "Bug report submitted. Thanks — an admin will look into it."
        : isUser
          ? "User report submitted. An admin will review their messaging."
          : "Report submitted. An admin will review it.",
      id: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};
