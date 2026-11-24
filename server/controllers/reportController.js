/**
 * =============================================================================
 * FILE: server/controllers/reportController.js
 * ROLE: User reports for listings / comments → admin queue + admin notify
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

const TARGET_TYPES = ["pet", "comment"];

// ======================== CREATE REPORT ========================
/** POST /api/reports — auth required. */
exports.createReport = async (req, res, next) => {
  try {
    const targetType = String(req.body?.targetType || "")
      .trim()
      .toLowerCase();
    const targetId = Number(req.body?.targetId);
    const reason = String(req.body?.reason || "").trim();
    const description = String(req.body?.description || "").trim();

    if (!TARGET_TYPES.includes(targetType)) {
      return res
        .status(400)
        .json({ message: "targetType must be pet or comment" });
    }
    if (!targetId) {
      return res.status(400).json({ message: "Invalid target id" });
    }
    if (!REPORT_REASONS.includes(reason)) {
      return res.status(400).json({
        message: `Reason must be one of: ${REPORT_REASONS.join(", ")}`,
      });
    }
    if (description.length > 1000) {
      return res.status(400).json({ message: "Description is too long" });
    }

    if (targetType === "pet") {
      const pets = await query("SELECT id, ownerId FROM pets WHERE id = ? LIMIT 1", [
        targetId,
      ]);
      if (!pets[0]) {
        return res.status(404).json({ message: "Pet listing not found" });
      }
      if (Number(pets[0].ownerId) === Number(req.user.id)) {
        return res
          .status(400)
          .json({ message: "You cannot report your own listing" });
      }
    } else {
      const comments = await query(
        "SELECT id, userId FROM pet_comments WHERE id = ? LIMIT 1",
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
    }

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
      return res
        .status(409)
        .json({ message: "You already reported this and it's pending review" });
    }

    const result = await run(
      `
        INSERT INTO content_reports
          (reporterId, targetType, targetId, reason, description, status, createdAt)
        VALUES (?, ?, ?, ?, ?, 'pending', ?)
      `,
      [
        req.user.id,
        targetType,
        targetId,
        reason,
        description || null,
        new Date(),
      ],
    );

    // Notify all admins about the new report.
    let relatedPetId = null;
    let targetLabel = targetType === "comment" ? "a comment" : "a listing";
    if (targetType === "pet") {
      relatedPetId = targetId;
      const pets = await query("SELECT name FROM pets WHERE id = ? LIMIT 1", [
        targetId,
      ]);
      if (pets[0]?.name) targetLabel = `listing "${pets[0].name}"`;
    } else {
      const comments = await query(
        "SELECT petId, text FROM pet_comments WHERE id = ? LIMIT 1",
        [targetId],
      );
      relatedPetId = comments[0]?.petId || null;
      targetLabel = "a comment";
    }

    const admins = await query(
      "SELECT id FROM users WHERE LOWER(role) = 'admin' AND (isBanned IS NULL OR isBanned = 0)",
    );
    const title = "New content report";
    const body = `Someone reported ${targetLabel}: ${reason}${
      description ? ` — ${description}` : ""
    }`;
    const now = new Date();
    for (const admin of admins) {
      await run(
        `
          INSERT INTO notifications
            (userId, type, title, body, relatedPetId, relatedApplicationId, isRead, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          admin.id,
          "content_report",
          title,
          body,
          relatedPetId,
          null,
          0,
          now,
        ],
      );
    }

    res.status(201).json({
      message: "Report submitted. An admin will review it.",
      id: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};
