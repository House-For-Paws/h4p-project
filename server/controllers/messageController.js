/**
 * =============================================================================
 * FILE: server/controllers/messageController.js
 * ROLE: Pet-linked messaging — owner ↔ interested user only
 * =============================================================================
 * Sections: HELPERS | LIST THREADS | UNREAD | GET THREAD | START | SEND
 * =============================================================================
 */
const { query, run } = require("../config/db");
const { isBlockedBetween } = require("../utils/userBlocks");

const MAX_BODY = 2000;

function cleanBody(value) {
  return String(value || "").trim();
}

function isThreadMember(thread, userId) {
  const id = Number(userId);
  return (
    Number(thread.ownerId) === id || Number(thread.participantId) === id
  );
}

async function getThreadRow(threadId) {
  const rows = await query(
    `
      SELECT
        t.id,
        t.petId,
        t.ownerId,
        t.participantId,
        t.lastMessageAt,
        t.createdAt,
        p.name AS petName,
        p.image AS petImage,
        p.images AS petImages,
        p.type AS petType,
        owner.username AS ownerUsername,
        owner.firstName AS ownerFirstName,
        owner.lastName AS ownerLastName,
        owner.profile_picture AS ownerAvatar,
        participant.username AS participantUsername,
        participant.firstName AS participantFirstName,
        participant.lastName AS participantLastName,
        participant.profile_picture AS participantAvatar
      FROM message_threads t
      LEFT JOIN pets p ON p.id = t.petId
      LEFT JOIN users owner ON owner.id = t.ownerId
      LEFT JOIN users participant ON participant.id = t.participantId
      WHERE t.id = ?
      LIMIT 1
    `,
    [threadId],
  );
  return rows[0] || null;
}

async function notifyNewMessage({
  recipientId,
  senderName,
  petName,
  petId,
  threadId,
  preview,
}) {
  await run(
    `
      INSERT INTO notifications
        (userId, type, title, body, relatedPetId, relatedApplicationId, relatedThreadId, isRead, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      recipientId,
      "pet_message",
      `New message from ${senderName}`,
      preview.length > 160 ? `${preview.slice(0, 157).trim()}...` : preview,
      petId || null,
      null,
      threadId || null,
      0,
      new Date(),
    ],
  );
}

/** Mark pet_message notifications for this thread as read for the current user. */
async function markThreadNotificationsRead(userId, threadId) {
  await run(
    `
      UPDATE notifications
      SET isRead = 1
      WHERE userId = ?
        AND relatedThreadId = ?
        AND type = 'pet_message'
        AND isRead = 0
    `,
    [userId, threadId],
  );
}

// ======================== LIST THREADS ========================
/** GET /api/messages/threads — inbox for current user. */
exports.getThreads = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const rows = await query(
      `
        SELECT
          t.id,
          t.petId,
          t.ownerId,
          t.participantId,
          t.lastMessageAt,
          t.createdAt,
          p.name AS petName,
          p.image AS petImage,
          p.images AS petImages,
          p.type AS petType,
          owner.username AS ownerUsername,
          owner.firstName AS ownerFirstName,
          owner.lastName AS ownerLastName,
          owner.profile_picture AS ownerAvatar,
          participant.username AS participantUsername,
          participant.firstName AS participantFirstName,
          participant.lastName AS participantLastName,
          participant.profile_picture AS participantAvatar,
          (
            SELECT m.body
            FROM messages m
            WHERE m.threadId = t.id
            ORDER BY m.createdAt DESC, m.id DESC
            LIMIT 1
          ) AS lastMessageBody,
          (
            SELECT m.senderId
            FROM messages m
            WHERE m.threadId = t.id
            ORDER BY m.createdAt DESC, m.id DESC
            LIMIT 1
          ) AS lastMessageSenderId,
          (
            SELECT COUNT(*)
            FROM messages m
            WHERE m.threadId = t.id
              AND m.senderId <> ?
              AND m.isRead = 0
          ) AS unreadCount
        FROM message_threads t
        LEFT JOIN pets p ON p.id = t.petId
        LEFT JOIN users owner ON owner.id = t.ownerId
        LEFT JOIN users participant ON participant.id = t.participantId
        WHERE (t.ownerId = ? OR t.participantId = ?)
          AND NOT EXISTS (
            SELECT 1 FROM user_blocks b
            WHERE
              (b.blockerId = ? AND b.blockedId = IF(t.ownerId = ?, t.participantId, t.ownerId))
              OR
              (b.blockedId = ? AND b.blockerId = IF(t.ownerId = ?, t.participantId, t.ownerId))
          )
        ORDER BY t.lastMessageAt DESC, t.id DESC
      `,
      [userId, userId, userId, userId, userId, userId, userId],
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// ======================== UNREAD COUNT ========================
/** GET /api/messages/unread-count */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const rows = await query(
      `
        SELECT COUNT(*) AS count
        FROM messages m
        INNER JOIN message_threads t ON t.id = m.threadId
        WHERE m.senderId <> ?
          AND m.isRead = 0
          AND (t.ownerId = ? OR t.participantId = ?)
          AND NOT EXISTS (
            SELECT 1 FROM user_blocks b
            WHERE
              (b.blockerId = ? AND b.blockedId = IF(t.ownerId = ?, t.participantId, t.ownerId))
              OR
              (b.blockedId = ? AND b.blockerId = IF(t.ownerId = ?, t.participantId, t.ownerId))
          )
      `,
      [userId, userId, userId, userId, userId, userId, userId],
    );
    res.json({ count: Number(rows[0]?.count || 0) });
  } catch (error) {
    next(error);
  }
};

// ======================== GET THREAD ========================
/** GET /api/messages/threads/:id — thread + messages; marks incoming as read. */
exports.getThread = async (req, res, next) => {
  try {
    const threadId = Number(req.params.id);
    const userId = Number(req.user.id);
    if (!threadId) {
      return res.status(400).json({ message: "Invalid thread id" });
    }

    const thread = await getThreadRow(threadId);
    if (!thread) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!isThreadMember(thread, userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const otherId =
      Number(thread.ownerId) === userId
        ? Number(thread.participantId)
        : Number(thread.ownerId);
    if (await isBlockedBetween(userId, otherId)) {
      return res.status(403).json({
        message: "Messaging is unavailable because one of you blocked the other",
      });
    }

    await run(
      `
        UPDATE messages
        SET isRead = 1
        WHERE threadId = ?
          AND senderId <> ?
          AND isRead = 0
      `,
      [threadId, userId],
    );
    await markThreadNotificationsRead(userId, threadId);

    const messages = await query(
      `
        SELECT
          m.id,
          m.threadId,
          m.senderId,
          m.body,
          m.isRead,
          m.createdAt,
          u.username AS senderUsername,
          u.firstName AS senderFirstName,
          u.lastName AS senderLastName,
          u.profile_picture AS senderAvatar
        FROM messages m
        LEFT JOIN users u ON u.id = m.senderId
        WHERE m.threadId = ?
        ORDER BY m.createdAt ASC, m.id ASC
      `,
      [threadId],
    );

    res.json({ thread, messages });
  } catch (error) {
    next(error);
  }
};

// ======================== START / OPEN THREAD ========================
/**
 * POST /api/messages/threads
 * Body: { petId, body? }
 * Interested user: returns existing thread, or pending stub (no empty row),
 * or creates thread when first message body is sent.
 * Owner: opens most recent conversation for this pet (deep-link fallback).
 */
exports.startThread = async (req, res, next) => {
  try {
    const petId = Number(req.body?.petId);
    const body = cleanBody(req.body?.body);
    const userId = Number(req.user.id);

    if (!petId) {
      return res.status(400).json({ message: "petId is required" });
    }
    if (body && body.length > MAX_BODY) {
      return res
        .status(400)
        .json({ message: `Message must be under ${MAX_BODY} characters` });
    }

    const pets = await query(
      "SELECT id, name, ownerId, image, images, type FROM pets WHERE id = ? LIMIT 1",
      [petId],
    );
    const pet = pets[0];
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }
    if (pet.ownerId == null) {
      return res
        .status(400)
        .json({ message: "This listing has no owner to message" });
    }

    if (
      Number(pet.ownerId) !== userId &&
      (await isBlockedBetween(userId, pet.ownerId))
    ) {
      return res.status(403).json({
        message: "Messaging is unavailable because one of you blocked the other",
      });
    }

    // Owner deep-link fallback (?petId=): open newest non-blocked thread.
    if (Number(pet.ownerId) === userId) {
      const ownerThreads = await query(
        `
          SELECT id
          FROM message_threads t
          WHERE t.petId = ? AND t.ownerId = ?
            AND NOT EXISTS (
              SELECT 1 FROM user_blocks b
              WHERE
                (b.blockerId = ? AND b.blockedId = t.participantId)
                OR
                (b.blockedId = ? AND b.blockerId = t.participantId)
            )
          ORDER BY t.lastMessageAt DESC, t.id DESC
          LIMIT 1
        `,
        [petId, userId, userId, userId],
      );
      if (!ownerThreads[0]) {
        return res.status(404).json({
          message: "No messages on this listing yet",
        });
      }
      const threadId = ownerThreads[0].id;
      await markThreadNotificationsRead(userId, threadId);
      await run(
        `
          UPDATE messages
          SET isRead = 1
          WHERE threadId = ?
            AND senderId <> ?
            AND isRead = 0
        `,
        [threadId, userId],
      );
      const thread = await getThreadRow(threadId);
      const messages = await query(
        `
          SELECT
            m.id,
            m.threadId,
            m.senderId,
            m.body,
            m.isRead,
            m.createdAt,
            u.username AS senderUsername,
            u.firstName AS senderFirstName,
            u.lastName AS senderLastName,
            u.profile_picture AS senderAvatar
          FROM messages m
          LEFT JOIN users u ON u.id = m.senderId
          WHERE m.threadId = ?
          ORDER BY m.createdAt ASC, m.id ASC
        `,
        [threadId],
      );
      return res.json({ thread, messages });
    }

    const existing = await query(
      `
        SELECT id
        FROM message_threads
        WHERE petId = ? AND participantId = ?
        LIMIT 1
      `,
      [petId, userId],
    );

    let threadId = existing[0]?.id || null;

    // No empty inbox rows: wait for first message before creating a thread.
    if (!threadId && !body) {
      return res.json({
        thread: null,
        messages: [],
        pending: true,
        pet: {
          id: pet.id,
          name: pet.name,
          ownerId: pet.ownerId,
          petImage: pet.image,
          petImages: pet.images,
          petType: pet.type,
        },
      });
    }

    if (!threadId) {
      try {
        const result = await run(
          `
            INSERT INTO message_threads
              (petId, ownerId, participantId, lastMessageAt, createdAt)
            VALUES (?, ?, ?, ?, ?)
          `,
          [petId, pet.ownerId, userId, new Date(), new Date()],
        );
        threadId = result.insertId;
      } catch (err) {
        // Concurrent first-open race on UNIQUE (petId, participantId).
        if (err && (err.code === "ER_DUP_ENTRY" || err.errno === 1062)) {
          const again = await query(
            `
              SELECT id
              FROM message_threads
              WHERE petId = ? AND participantId = ?
              LIMIT 1
            `,
            [petId, userId],
          );
          threadId = again[0]?.id || null;
        } else {
          throw err;
        }
      }
    }

    if (!threadId) {
      return res.status(500).json({ message: "Could not open conversation" });
    }

    if (body) {
      await run(
        `
          INSERT INTO messages (threadId, senderId, body, isRead, createdAt)
          VALUES (?, ?, ?, ?, ?)
        `,
        [threadId, userId, body, 0, new Date()],
      );
      await run(
        "UPDATE message_threads SET lastMessageAt = ? WHERE id = ?",
        [new Date(), threadId],
      );

      const senderName =
        String(req.user.username || "").trim() ||
        `${req.user.firstname || ""} ${req.user.lastname || ""}`.trim() ||
        "Someone";

      await notifyNewMessage({
        recipientId: pet.ownerId,
        senderName,
        petName: pet.name,
        petId: pet.id,
        threadId,
        preview: body,
      });
    }

    await markThreadNotificationsRead(userId, threadId);

    const thread = await getThreadRow(threadId);
    const messages = await query(
      `
        SELECT
          m.id,
          m.threadId,
          m.senderId,
          m.body,
          m.isRead,
          m.createdAt,
          u.username AS senderUsername,
          u.firstName AS senderFirstName,
          u.lastName AS senderLastName,
          u.profile_picture AS senderAvatar
        FROM messages m
        LEFT JOIN users u ON u.id = m.senderId
        WHERE m.threadId = ?
        ORDER BY m.createdAt ASC, m.id ASC
      `,
      [threadId],
    );

    res.status(existing[0] ? 200 : 201).json({ thread, messages });
  } catch (error) {
    next(error);
  }
};

// ======================== SEND MESSAGE ========================
/** POST /api/messages/threads/:id — send a message in an existing thread. */
exports.sendMessage = async (req, res, next) => {
  try {
    const threadId = Number(req.params.id);
    const userId = Number(req.user.id);
    const body = cleanBody(req.body?.body);

    if (!threadId) {
      return res.status(400).json({ message: "Invalid thread id" });
    }
    if (!body) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }
    if (body.length > MAX_BODY) {
      return res
        .status(400)
        .json({ message: `Message must be under ${MAX_BODY} characters` });
    }

    const thread = await getThreadRow(threadId);
    if (!thread) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!isThreadMember(thread, userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const recipientId =
      Number(thread.ownerId) === userId
        ? Number(thread.participantId)
        : Number(thread.ownerId);

    if (await isBlockedBetween(userId, recipientId)) {
      return res.status(403).json({
        message: "Messaging is unavailable because one of you blocked the other",
      });
    }

    const result = await run(
      `
        INSERT INTO messages (threadId, senderId, body, isRead, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `,
      [threadId, userId, body, 0, new Date()],
    );
    await run("UPDATE message_threads SET lastMessageAt = ? WHERE id = ?", [
      new Date(),
      threadId,
    ]);

    const senderName =
      String(req.user.username || "").trim() ||
      `${req.user.firstname || ""} ${req.user.lastname || ""}`.trim() ||
      "Someone";

    await notifyNewMessage({
      recipientId,
      senderName,
      petName: thread.petName || "a pet",
      petId: thread.petId,
      threadId,
      preview: body,
    });

    const messages = await query(
      `
        SELECT
          m.id,
          m.threadId,
          m.senderId,
          m.body,
          m.isRead,
          m.createdAt,
          u.username AS senderUsername,
          u.firstName AS senderFirstName,
          u.lastName AS senderLastName,
          u.profile_picture AS senderAvatar
        FROM messages m
        LEFT JOIN users u ON u.id = m.senderId
        WHERE m.id = ?
        LIMIT 1
      `,
      [result.insertId],
    );

    res.status(201).json({ message: messages[0] });
  } catch (error) {
    next(error);
  }
};

// ======================== DELETE THREAD ========================
/** DELETE /api/messages/threads/:id — member deletes the conversation. */
exports.deleteThread = async (req, res, next) => {
  try {
    const threadId = Number(req.params.id);
    const userId = Number(req.user.id);
    if (!threadId) {
      return res.status(400).json({ message: "Invalid thread id" });
    }

    const thread = await getThreadRow(threadId);
    if (!thread) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!isThreadMember(thread, userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Keep chat history while a pending moderation report references it.
    const pendingReports = await query(
      `
        SELECT id FROM content_reports
        WHERE relatedThreadId = ?
          AND LOWER(status) = 'pending'
        LIMIT 1
      `,
      [threadId],
    );
    if (pendingReports[0]) {
      return res.status(409).json({
        message:
          "This conversation is under admin review and cannot be deleted yet.",
      });
    }

    // Only clear this user's notifications — never wipe admin chat_report alerts.
    await run(
      "DELETE FROM notifications WHERE relatedThreadId = ? AND userId = ?",
      [threadId, userId],
    );
    await run("DELETE FROM message_threads WHERE id = ?", [threadId]);

    res.json({ message: "Conversation deleted", id: threadId });
  } catch (error) {
    next(error);
  }
};
