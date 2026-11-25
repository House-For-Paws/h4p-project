/**
 * =============================================================================
 * FILE: server/controllers/blockController.js
 * ROLE: Block / unblock users; optional chat report attached to the block
 * =============================================================================
 */
const { query, run } = require("../config/db");

const BLOCK_REASONS = [
  "Harassment / bullying",
  "Spam / scam",
  "Inappropriate messages",
  "Threats / abuse",
  "Other",
];

// ======================== LIST ========================
/** GET /api/blocks — users I blocked. */
exports.getMyBlocks = async (req, res, next) => {
  try {
    const rows = await query(
      `
        SELECT
          b.id,
          b.blockedId,
          b.reason,
          b.description,
          b.relatedReportId,
          b.createdAt,
          u.username,
          u.firstName,
          u.lastName,
          u.profile_picture AS avatar
        FROM user_blocks b
        LEFT JOIN users u ON u.id = b.blockedId
        WHERE b.blockerId = ?
        ORDER BY b.createdAt DESC
      `,
      [req.user.id],
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// ======================== BLOCK ========================
/**
 * POST /api/blocks
 * Body: { userId, reason?, description?, attachReport?, threadId? }
 */
exports.blockUser = async (req, res, next) => {
  try {
    const blockedId = Number(req.body?.userId);
    const blockerId = Number(req.user.id);
    const reason = String(req.body?.reason || "Other").trim();
    const description = String(req.body?.description || "").trim();
    const attachReport = Boolean(req.body?.attachReport);
    const threadId = Number(req.body?.threadId) || null;

    if (!blockedId) {
      return res.status(400).json({ message: "userId is required" });
    }
    if (blockedId === blockerId) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }
    if (!BLOCK_REASONS.includes(reason)) {
      return res.status(400).json({
        message: `Reason must be one of: ${BLOCK_REASONS.join(", ")}`,
      });
    }
    if (description.length > 1000) {
      return res.status(400).json({ message: "Description is too long" });
    }

    const users = await query(
      "SELECT id, username, role FROM users WHERE id = ? LIMIT 1",
      [blockedId],
    );
    if (!users[0]) {
      return res.status(404).json({ message: "User not found" });
    }
    if (String(users[0].role || "").toLowerCase() === "admin") {
      return res.status(400).json({ message: "You cannot block an admin" });
    }

    const existing = await query(
      `
        SELECT id FROM user_blocks
        WHERE blockerId = ? AND blockedId = ?
        LIMIT 1
      `,
      [blockerId, blockedId],
    );
    if (existing[0]) {
      return res.status(409).json({ message: "You already blocked this user" });
    }

    let relatedReportId = null;
    let relatedPetId = null;

    if (attachReport) {
      let threadRows = [];
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
          [threadId, blockerId, blockedId, blockedId, blockerId],
        );
      }
      if (!threadRows[0]) {
        threadRows = await query(
          `
            SELECT id, petId
            FROM message_threads
            WHERE
              (ownerId = ? AND participantId = ?)
              OR (ownerId = ? AND participantId = ?)
            ORDER BY lastMessageAt DESC
            LIMIT 1
          `,
          [blockerId, blockedId, blockedId, blockerId],
        );
      }

      relatedPetId = threadRows[0]?.petId || null;
      const relatedThreadId = threadRows[0]?.id || null;

      const pendingReport = await query(
        `
          SELECT id FROM content_reports
          WHERE reporterId = ?
            AND targetType = 'user'
            AND targetId = ?
            AND LOWER(status) = 'pending'
          LIMIT 1
        `,
        [blockerId, blockedId],
      );

      if (pendingReport[0]) {
        relatedReportId = pendingReport[0].id;
      } else {
        const reportResult = await run(
          `
            INSERT INTO content_reports
              (reporterId, targetType, targetId, reason, description, relatedThreadId, status, createdAt)
            VALUES (?, 'user', ?, ?, ?, ?, 'pending', ?)
          `,
          [
            blockerId,
            blockedId,
            reason,
            description || "Blocked user from messaging",
            relatedThreadId,
            new Date(),
          ],
        );
        relatedReportId = reportResult.insertId;

        const admins = await query(
          "SELECT id FROM users WHERE LOWER(role) = 'admin' AND (isBanned IS NULL OR isBanned = 0)",
        );
        const display =
          String(users[0].username || "").trim() || `user #${blockedId}`;
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
              "chat_report",
              "New messaging report",
              `Someone blocked and reported user "${display}": ${reason}${
                description ? ` — ${description}` : ""
              }`,
              relatedPetId,
              null,
              relatedThreadId,
              0,
              now,
            ],
          );
        }
      }
    }

    const result = await run(
      `
        INSERT INTO user_blocks
          (blockerId, blockedId, reason, description, relatedReportId, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        blockerId,
        blockedId,
        reason,
        description || null,
        relatedReportId,
        new Date(),
      ],
    );

    res.status(201).json({
      message: attachReport
        ? "User blocked and report submitted for admin review."
        : "User blocked. They can no longer message you.",
      id: result.insertId,
      relatedReportId,
    });
  } catch (error) {
    next(error);
  }
};

// ======================== UNBLOCK ========================
/** DELETE /api/blocks/:userId */
exports.unblockUser = async (req, res, next) => {
  try {
    const blockedId = Number(req.params.userId);
    if (!blockedId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const result = await run(
      "DELETE FROM user_blocks WHERE blockerId = ? AND blockedId = ?",
      [req.user.id, blockedId],
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Block not found" });
    }
    res.json({ message: "User unblocked", userId: blockedId });
  } catch (error) {
    next(error);
  }
};
