/**
 * =============================================================================
 * FILE: server/controllers/adminController.js
 * ROLE: Admin dashboard APIs — stats, users, bans, warns, reports, moderation
 * =============================================================================
 * Sections: STATS | USERS | WARN | REPORTS | BAN
 *           POSTS / COMMENTS | APPLICATIONS | DELETE PET
 * =============================================================================
 */
const { query, run } = require("../config/db");

const APPLICATION_STATUSES = ["pending", "approved", "rejected", "cancelled"];

function monthBounds(reference = new Date()) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 1);
  return { start, end };
}

function previousMonthBounds(reference = new Date()) {
  const start = new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
  const end = new Date(reference.getFullYear(), reference.getMonth(), 1);
  return { start, end };
}

async function countBetween(table, start, end, extraWhere = "", extraParams = []) {
  const rows = await query(
    `
      SELECT COUNT(*) AS count
      FROM ${table}
      WHERE createdAt >= ? AND createdAt < ?
      ${extraWhere}
    `,
    [start, end, ...extraParams],
  );
  return Number(rows[0]?.count || 0);
}

function statusMapFromRows(rows, keys) {
  const map = Object.fromEntries(keys.map((key) => [key, 0]));
  rows.forEach((row) => {
    const key = String(row.status || "").toLowerCase();
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      map[key] = Number(row.count || 0);
    } else if (Object.prototype.hasOwnProperty.call(map, "other")) {
      map.other += Number(row.count || 0);
    }
  });
  return map;
}

// ======================== STATS ========================
/** Bundled KPIs + charts + recent lists for AdminDashboard. */
exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thisMonth = monthBounds(now);
    const lastMonth = previousMonthBounds(now);

    const [
      usersRow,
      petsRow,
      postsRow,
      commentsRow,
      applicationsRow,
      adoptedRow,
      availablePetsRow,
      animalsByStatusRows,
      applicationsByStatusRows,
      recentUsers,
      recentPets,
      recentApplications,
      allPets,
    ] = await Promise.all([
      query("SELECT COUNT(*) AS count FROM users"),
      query("SELECT COUNT(*) AS count FROM pets"),
      query("SELECT COUNT(*) AS count FROM posts"),
      query("SELECT COUNT(*) AS count FROM comments"),
      query("SELECT COUNT(*) AS count FROM adoption_applications"),
      query(
        "SELECT COUNT(*) AS count FROM pets WHERE LOWER(status) = 'adopted'",
      ),
      query(
        "SELECT COUNT(*) AS count FROM pets WHERE LOWER(status) = 'available'",
      ),
      query(
        `
          SELECT LOWER(status) AS status, COUNT(*) AS count
          FROM pets
          GROUP BY LOWER(status)
        `,
      ),
      query(
        `
          SELECT LOWER(status) AS status, COUNT(*) AS count
          FROM adoption_applications
          GROUP BY LOWER(status)
        `,
      ),
      query(
        `
          SELECT id, username, email, role, createdAt, profile_picture,
                 firstName, lastName
          FROM users
          ORDER BY createdAt DESC
          LIMIT 5
        `,
      ),
      query(
        `
          SELECT id, name, breed, type, status, image, images, createdAt
          FROM pets
          ORDER BY createdAt DESC
          LIMIT 5
        `,
      ),
      query(
        `
          SELECT
            a.id,
            a.petId,
            a.fullName,
            a.email,
            a.phone,
            a.message,
            a.status,
            a.createdAt,
            p.name AS petName,
            p.type AS petType,
            p.breed AS petBreed,
            p.image AS petImage,
            u.username AS applicantUsername,
            u.profile_picture AS applicantAvatar,
            owner.username AS ownerUsername,
            owner.firstName AS ownerFirstName,
            owner.lastName AS ownerLastName,
            owner.email AS ownerEmail,
            owner.profile_picture AS ownerAvatar
          FROM adoption_applications a
          LEFT JOIN pets p ON p.id = a.petId
          LEFT JOIN users u ON u.id = a.applicantId
          LEFT JOIN users owner ON owner.id = a.ownerId
          ORDER BY a.createdAt DESC
          LIMIT 8
        `,
      ),
      query(
        `
          SELECT
            p.id, p.name, p.breed, p.type, p.status, p.image, p.images,
            p.location, p.age, p.gender, p.ownerId, p.createdAt,
            u.username AS ownerUsername,
            u.firstName AS ownerFirstName,
            u.lastName AS ownerLastName,
            u.email AS ownerEmail,
            u.profile_picture AS ownerAvatar
          FROM pets p
          LEFT JOIN users u ON u.id = p.ownerId
          ORDER BY p.createdAt DESC
        `,
      ),
    ]);

    const [
      animalsThisMonth,
      animalsLastMonth,
      applicationsThisMonth,
      applicationsLastMonth,
      adoptionsThisMonth,
      adoptionsLastMonth,
      usersThisMonth,
      usersLastMonth,
      approvedAppsByDay,
    ] = await Promise.all([
      countBetween("pets", thisMonth.start, thisMonth.end),
      countBetween("pets", lastMonth.start, lastMonth.end),
      countBetween("adoption_applications", thisMonth.start, thisMonth.end),
      countBetween("adoption_applications", lastMonth.start, lastMonth.end),
      countBetween(
        "pets",
        thisMonth.start,
        thisMonth.end,
        "AND LOWER(status) = 'adopted'",
      ),
      countBetween(
        "pets",
        lastMonth.start,
        lastMonth.end,
        "AND LOWER(status) = 'adopted'",
      ),
      countBetween("users", thisMonth.start, thisMonth.end),
      countBetween("users", lastMonth.start, lastMonth.end),
      query(
        `
          SELECT DATE(createdAt) AS day, COUNT(*) AS count
          FROM adoption_applications
          WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
            AND LOWER(status) = 'approved'
          GROUP BY DATE(createdAt)
          ORDER BY day ASC
        `,
      ),
    ]);

    // Build 30-day series; fall back to all applications per day if no approvals yet.
    let dayCounts = approvedAppsByDay;
    if (!dayCounts.length) {
      dayCounts = await query(
        `
          SELECT DATE(createdAt) AS day, COUNT(*) AS count
          FROM adoption_applications
          WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
          GROUP BY DATE(createdAt)
          ORDER BY day ASC
        `,
      );
    }

    const countByDay = new Map(
      dayCounts.map((row) => [
        String(row.day).slice(0, 10),
        Number(row.count || 0),
      ]),
    );
    const adoptionsOverview = [];
    for (let i = 29; i >= 0; i -= 1) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");
      adoptionsOverview.push({
        date: key,
        label: date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        count: countByDay.get(key) || 0,
      });
    }

    const animalsByStatusRaw = statusMapFromRows(animalsByStatusRows, [
      "available",
      "pending",
      "adopted",
      "other",
    ]);
    const animalsByStatus = {
      available: animalsByStatusRaw.available,
      pending: animalsByStatusRaw.pending,
      adopted: animalsByStatusRaw.adopted,
      notAvailable: Math.max(
        0,
        Number(petsRow[0]?.count || 0) -
          animalsByStatusRaw.available -
          animalsByStatusRaw.pending -
          animalsByStatusRaw.adopted,
      ),
    };

    const applicationsByStatus = statusMapFromRows(applicationsByStatusRows, [
      "pending",
      "approved",
      "rejected",
      "cancelled",
    ]);

    res.json({
      stats: {
        totalUsers: Number(usersRow[0]?.count || 0),
        totalPets: Number(petsRow[0]?.count || 0),
        totalPosts: Number(postsRow[0]?.count || 0),
        totalComments: Number(commentsRow[0]?.count || 0),
        availablePets: Number(availablePetsRow[0]?.count || 0),
        totalApplications: Number(applicationsRow[0]?.count || 0),
        totalAdoptions: Number(adoptedRow[0]?.count || 0),
        deltas: {
          animals: animalsThisMonth - animalsLastMonth,
          applications: applicationsThisMonth - applicationsLastMonth,
          adoptions: adoptionsThisMonth - adoptionsLastMonth,
          users: usersThisMonth - usersLastMonth,
        },
      },
      animalsByStatus,
      applicationsByStatus,
      adoptionsOverview,
      recentUsers,
      recentPets,
      recentApplications,
      allPets,
      range: {
        start: thisMonth.start.toISOString(),
        end: thisMonth.end.toISOString(),
        label: now.toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        }),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================== USERS / BAN / WARN CONSTANTS ========================
const BAN_REASONS = [
  "Spam / abuse",
  "Inappropriate content",
  "Harassment",
  "Fake account",
  "Scam / fraud",
  "Terms of service violation",
  "Other",
];

const WARNING_REASONS = [
  "Spam / abuse",
  "Inappropriate content",
  "Harassment",
  "Misleading information",
  "Community guidelines",
  "Other",
];

const REPORT_STATUSES = ["pending", "reviewed", "dismissed"];

// ======================== LIST USERS ========================
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await query(
      `
        SELECT id, username, email, role, createdAt, profile_picture,
               firstName, lastName, phone, isBanned, banReason,
               banDescription, bannedAt, warningCount
        FROM users
        ORDER BY createdAt DESC
      `,
    );
    res.json(
      users.map((user) => ({
        ...user,
        isBanned: Boolean(Number(user.isBanned || 0)),
        banReason: user.banReason || null,
        banDescription: user.banDescription || null,
        bannedAt: user.bannedAt || null,
        warningCount: Number(user.warningCount || 0),
      })),
    );
  } catch (error) {
    next(error);
  }
};

// ======================== WARN USER ========================
/** POST /api/admin/users/:id/warn */
exports.warnUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const reason = String(req.body?.reason || "").trim();
    const message = String(req.body?.message || "").trim();

    if (!id) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    if (Number(req.user.id) === id) {
      return res
        .status(400)
        .json({ message: "You cannot warn your own account" });
    }
    if (!WARNING_REASONS.includes(reason)) {
      return res.status(400).json({
        message: `Reason must be one of: ${WARNING_REASONS.join(", ")}`,
      });
    }
    if (!message) {
      return res.status(400).json({ message: "Please add a warning message" });
    }
    if (message.length > 1000) {
      return res.status(400).json({ message: "Warning message is too long" });
    }

    const users = await query(
      "SELECT id, role, username FROM users WHERE id = ? LIMIT 1",
      [id],
    );
    const target = users[0];
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }
    if (String(target.role || "").toLowerCase() === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot be warned" });
    }

    await run("UPDATE users SET warningCount = warningCount + 1 WHERE id = ?", [
      id,
    ]);
    await run(
      `
        INSERT INTO notifications
          (userId, type, title, body, relatedPetId, relatedApplicationId, isRead, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        "admin_warning",
        `Warning before ban: ${reason}`,
        message,
        null,
        null,
        0,
        new Date(),
      ],
    );

    const counts = await query(
      "SELECT warningCount FROM users WHERE id = ? LIMIT 1",
      [id],
    );

    res.json({
      message: `Warning sent to @${target.username}`,
      id,
      warningCount: Number(counts[0]?.warningCount || 0),
      reason,
    });
  } catch (error) {
    next(error);
  }
};

// ======================== REPORTS ========================
/** GET /api/admin/reports/pending-count */
exports.getPendingReportsCount = async (req, res, next) => {
  try {
    const rows = await query(
      "SELECT COUNT(*) AS count FROM content_reports WHERE LOWER(status) = 'pending'",
    );
    res.json({ count: Number(rows[0]?.count || 0) });
  } catch (error) {
    next(error);
  }
};

/** GET /api/admin/reports — all content reports for moderation. */
exports.getAllReports = async (req, res, next) => {
  try {
    const rows = await query(
      `
        SELECT
          r.id,
          r.reporterId,
          r.targetType,
          r.targetId,
          r.reason,
          r.description,
          r.status,
          r.reviewedBy,
          r.reviewedAt,
          r.createdAt,
          reporter.username AS reporterUsername,
          reporter.firstName AS reporterFirstName,
          reporter.lastName AS reporterLastName,
          reporter.email AS reporterEmail,
          CASE
            WHEN r.targetType = 'pet' THEN p.name
            WHEN r.targetType = 'comment' THEN LEFT(c.text, 120)
            ELSE NULL
          END AS targetPreview,
          CASE
            WHEN r.targetType = 'pet' THEN p.id
            WHEN r.targetType = 'comment' THEN c.petId
            ELSE NULL
          END AS relatedPetId,
          CASE
            WHEN r.targetType = 'pet' THEN p.ownerId
            WHEN r.targetType = 'comment' THEN c.userId
            ELSE NULL
          END AS targetOwnerId
        FROM content_reports r
        LEFT JOIN users reporter ON reporter.id = r.reporterId
        LEFT JOIN pets p ON r.targetType = 'pet' AND p.id = r.targetId
        LEFT JOIN pet_comments c ON r.targetType = 'comment' AND c.id = r.targetId
        ORDER BY
          CASE WHEN LOWER(r.status) = 'pending' THEN 0 ELSE 1 END,
          r.createdAt DESC
      `,
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/admin/reports/:id — mark report reviewed/dismissed. */
exports.updateReportStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const status = String(req.body?.status || "")
      .trim()
      .toLowerCase();

    if (!id) {
      return res.status(400).json({ message: "Invalid report id" });
    }
    if (!REPORT_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${REPORT_STATUSES.join(", ")}`,
      });
    }

    const existing = await query(
      "SELECT id FROM content_reports WHERE id = ? LIMIT 1",
      [id],
    );
    if (!existing[0]) {
      return res.status(404).json({ message: "Report not found" });
    }

    await run(
      `
        UPDATE content_reports
        SET status = ?, reviewedBy = ?, reviewedAt = ?
        WHERE id = ?
      `,
      [status, req.user.id, new Date(), id],
    );

    res.json({ message: "Report updated", id, status });
  } catch (error) {
    next(error);
  }
};

// ======================== BAN / UNBAN ========================
/** PATCH /api/admin/users/:id/ban */
exports.setUserBanned = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const banned = Boolean(req.body?.banned);
    const reason = String(req.body?.reason || "").trim();
    const description = String(req.body?.description || "").trim();

    if (!id) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (Number(req.user.id) === id) {
      return res.status(400).json({ message: "You cannot ban your own account" });
    }

    const users = await query(
      "SELECT id, role, username FROM users WHERE id = ? LIMIT 1",
      [id],
    );
    const target = users[0];
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(target.role || "").toLowerCase() === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot be banned" });
    }

    if (banned) {
      if (!BAN_REASONS.includes(reason)) {
        return res.status(400).json({
          message: `Reason must be one of: ${BAN_REASONS.join(", ")}`,
        });
      }
      if (!description) {
        return res
          .status(400)
          .json({ message: "Please add a short ban description" });
      }
      if (description.length > 1000) {
        return res
          .status(400)
          .json({ message: "Ban description is too long" });
      }

      await run(
        `
          UPDATE users
          SET isBanned = 1, banReason = ?, banDescription = ?, bannedAt = ?
          WHERE id = ?
        `,
        [reason, description, new Date(), id],
      );
    } else {
      await run(
        `
          UPDATE users
          SET isBanned = 0, banReason = NULL, banDescription = NULL, bannedAt = NULL
          WHERE id = ?
        `,
        [id],
      );
    }

    res.json({
      message: banned
        ? `Banned @${target.username}`
        : `Unbanned @${target.username}`,
      id,
      isBanned: banned,
      banReason: banned ? reason : null,
      banDescription: banned ? description : null,
    });
  } catch (error) {
    next(error);
  }
};

// ======================== FORUM POSTS (legacy) ========================
exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await query(
      `
        SELECT posts.id, posts.title, posts.createdAt, posts.userId,
               COALESCE(users.username, 'Unknown') AS username
        FROM posts
        LEFT JOIN users ON users.id = posts.userId
        ORDER BY posts.createdAt DESC, posts.id DESC
      `,
    );
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// ======================== PET COMMENTS ========================
exports.getAllComments = async (req, res, next) => {
  try {
    const comments = await query(
      `
        SELECT
          c.id,
          c.petId,
          c.userId,
          c.text,
          c.createdAt,
          p.name AS petName,
          p.type AS petType,
          p.breed AS petBreed,
          p.image AS petImage,
          p.images AS petImages,
          COALESCE(u.username, 'Unknown') AS username,
          u.firstName,
          u.lastName,
          u.email,
          u.profile_picture AS avatar
        FROM pet_comments c
        LEFT JOIN pets p ON p.id = c.petId
        LEFT JOIN users u ON u.id = c.userId
        ORDER BY c.createdAt DESC, c.id DESC
      `,
    );
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/admin/comments/:id — remove a pet comment. */
exports.deleteComment = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid comment id" });
    }

    const result = await run("DELETE FROM pet_comments WHERE id = ?", [id]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json({ message: "Comment removed", id });
  } catch (error) {
    next(error);
  }
};

// ======================== APPLICATIONS ========================
exports.getAllApplications = async (req, res, next) => {
  try {
    const rows = await query(
      `
        SELECT
          a.id,
          a.petId,
          a.ownerId,
          a.applicantId,
          a.fullName,
          a.email,
          a.phone,
          a.message,
          a.status,
          a.createdAt,
          p.name AS petName,
          p.type AS petType,
          p.breed AS petBreed,
          p.image AS petImage,
          p.status AS petStatus,
          u.username AS applicantUsername,
          u.profile_picture AS applicantAvatar,
          owner.username AS ownerUsername,
          owner.firstName AS ownerFirstName,
          owner.lastName AS ownerLastName,
          owner.email AS ownerEmail,
          owner.profile_picture AS ownerAvatar
        FROM adoption_applications a
        LEFT JOIN pets p ON p.id = a.petId
        LEFT JOIN users u ON u.id = a.applicantId
        LEFT JOIN users owner ON owner.id = a.ownerId
        ORDER BY a.createdAt DESC
      `,
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

/** PATCH application status (admin moderation). */
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const status = String(req.body?.status || "")
      .trim()
      .toLowerCase();

    if (!id) {
      return res.status(400).json({ message: "Invalid application id" });
    }
    if (!APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${APPLICATION_STATUSES.join(", ")}`,
      });
    }

    const existing = await query(
      "SELECT id, petId FROM adoption_applications WHERE id = ? LIMIT 1",
      [id],
    );
    if (!existing[0]) {
      return res.status(404).json({ message: "Application not found" });
    }

    await run("UPDATE adoption_applications SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    // Keep pet status in sync when approving / reverting.
    if (status === "approved" && existing[0].petId) {
      await run("UPDATE pets SET status = ? WHERE id = ?", [
        "adopted",
        existing[0].petId,
      ]);
    }
    if (
      (status === "rejected" || status === "cancelled" || status === "pending") &&
      existing[0].petId
    ) {
      const petApps = await query(
        `
          SELECT COUNT(*) AS count
          FROM adoption_applications
          WHERE petId = ? AND LOWER(status) = 'approved'
        `,
        [existing[0].petId],
      );
      if (!Number(petApps[0]?.count || 0)) {
        await run(
          "UPDATE pets SET status = ? WHERE id = ? AND LOWER(status) = 'adopted'",
          ["available", existing[0].petId],
        );
      }
    }

    res.json({ message: "Application status updated", id, status });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/admin/applications/:id — remove an adoption request. */
exports.deleteApplication = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid application id" });
    }

    const result = await run(
      "DELETE FROM adoption_applications WHERE id = ?",
      [id],
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Application removed", id });
  } catch (error) {
    next(error);
  }
};

// ======================== DELETE PET (ADMIN) ========================
exports.deletePet = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid pet id" });
    }

    const existing = await query("SELECT id FROM pets WHERE id = ? LIMIT 1", [
      id,
    ]);
    if (!existing[0]) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // Applications / notifications cascade or clear via FK / manual cleanup.
    await run("DELETE FROM notifications WHERE relatedPetId = ?", [id]);
    await run("DELETE FROM adoption_applications WHERE petId = ?", [id]);
    await run("DELETE FROM pets WHERE id = ?", [id]);

    res.json({ message: "Pet listing removed", id });
  } catch (error) {
    next(error);
  }
};
