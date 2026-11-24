/**
 * =============================================================================
 * FILE: server/controllers/applicationController.js
 * ROLE: Adoption requests — create, list, owner approve/reject
 * =============================================================================
 * Sections: CREATE | INCOMING | MINE | UPDATE STATUS
 * =============================================================================
 */
const { query, run } = require("../config/db");

// ======================== CREATE APPLICATION ========================
/** POST /api/applications — applicant submits interest; notifies owner. */
exports.createApplication = async (req, res, next) => {
  const { petId, fullName, email, phone, message } = req.body;
  const cleanName = String(fullName || "").trim();
  const cleanEmail = String(email || "")
    .trim()
    .toLowerCase();
  const cleanPhone = String(phone || "").trim();
  const cleanMessage = String(message || "").trim();
  const numericPetId = Number(petId);

  if (!numericPetId || !cleanName || !cleanEmail || !cleanMessage) {
    return res.status(400).json({
      message: "Pet, full name, email, and message are required",
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
    return res.status(400).json({ message: "Enter a valid email address" });
  }

  try {
    const pets = await query("SELECT * FROM pets WHERE id = ? LIMIT 1", [
      numericPetId,
    ]);
    const pet = pets[0];

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    if (!pet.ownerId) {
      return res
        .status(400)
        .json({ message: "This pet has no owner to notify" });
    }

    if (Number(pet.ownerId) === Number(req.user.id)) {
      return res
        .status(400)
        .json({ message: "You cannot request to adopt your own pet" });
    }

    const result = await run(
      `
        INSERT INTO adoption_applications
          (petId, ownerId, applicantId, fullName, email, phone, message, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        pet.id,
        pet.ownerId,
        req.user.id,
        cleanName,
        cleanEmail,
        cleanPhone,
        cleanMessage,
        "pending",
        new Date(),
      ],
    );

    const owners = await query(
      "SELECT id, notify_application_updates FROM users WHERE id = ? LIMIT 1",
      [pet.ownerId],
    );
    const owner = owners[0];
    const shouldNotify =
      !owner ||
      owner.notify_application_updates === null ||
      Number(owner.notify_application_updates) === 1;

    if (shouldNotify) {
      await run(
        `
          INSERT INTO notifications
            (userId, type, title, body, relatedPetId, relatedApplicationId, isRead, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          pet.ownerId,
          "adoption_request",
          `New adoption request for ${pet.name}`,
          `${cleanName} wants to adopt ${pet.name}: ${cleanMessage}`,
          pet.id,
          result.insertId,
          0,
          new Date(),
        ],
      );
    }

    res.status(201).json({
      message: "Adoption request sent successfully",
      applicationId: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};

// ======================== INCOMING (owner inbox) ========================
exports.getIncomingApplications = async (req, res, next) => {
  try {
    const rows = await query(
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
          p.image AS petImage,
          p.type AS petType,
          p.breed AS petBreed
        FROM adoption_applications a
        JOIN pets p ON p.id = a.petId
        WHERE a.ownerId = ?
        ORDER BY a.createdAt DESC
      `,
      [req.user.id],
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// ======================== MINE (applicant) ========================
exports.getMyApplications = async (req, res, next) => {
  try {
    const rows = await query(
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
          p.image AS petImage,
          p.type AS petType,
          p.breed AS petBreed,
          p.status AS petStatus,
          owner.username AS ownerUsername,
          owner.firstName AS ownerFirstName,
          owner.lastName AS ownerLastName,
          owner.email AS ownerEmail
        FROM adoption_applications a
        JOIN pets p ON p.id = a.petId
        LEFT JOIN users owner ON owner.id = a.ownerId
        WHERE a.applicantId = ?
        ORDER BY a.createdAt DESC
      `,
      [req.user.id],
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

const OWNER_DECISION_STATUSES = ["approved", "rejected", "pending"];

/**
 * PATCH /api/applications/:id/status
 * Pet owner approves/rejects (or reopens) a request for their own pet.
 */
// ======================== OWNER DECISION ========================
exports.updateMyIncomingApplicationStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const status = String(req.body?.status || "")
      .trim()
      .toLowerCase();

    if (!id) {
      return res.status(400).json({ message: "Invalid application id" });
    }
    if (!OWNER_DECISION_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${OWNER_DECISION_STATUSES.join(", ")}`,
      });
    }

    const rows = await query(
      `
        SELECT a.*, p.name AS petName
        FROM adoption_applications a
        LEFT JOIN pets p ON p.id = a.petId
        WHERE a.id = ?
        LIMIT 1
      `,
      [id],
    );
    const application = rows[0];

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    if (Number(application.ownerId) !== Number(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only the pet owner can update this request" });
    }

    await run("UPDATE adoption_applications SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    if (status === "approved" && application.petId) {
      await run("UPDATE pets SET status = ? WHERE id = ?", [
        "adopted",
        application.petId,
      ]);
    }

    if (
      (status === "rejected" || status === "pending") &&
      application.petId
    ) {
      const otherApproved = await query(
        `
          SELECT COUNT(*) AS count
          FROM adoption_applications
          WHERE petId = ? AND id <> ? AND LOWER(status) = 'approved'
        `,
        [application.petId, id],
      );
      if (!Number(otherApproved[0]?.count || 0)) {
        await run(
          "UPDATE pets SET status = ? WHERE id = ? AND LOWER(status) = 'adopted'",
          ["available", application.petId],
        );
      }
    }

    // Mark related owner notifications as read.
    await run(
      `
        UPDATE notifications
        SET isRead = 1
        WHERE userId = ? AND relatedApplicationId = ? AND isRead = 0
      `,
      [req.user.id, id],
    );

    // Notify the applicant about the decision.
    if (application.applicantId && status !== "pending") {
      const applicants = await query(
        "SELECT id, notify_application_updates FROM users WHERE id = ? LIMIT 1",
        [application.applicantId],
      );
      const applicant = applicants[0];
      const shouldNotify =
        !applicant ||
        applicant.notify_application_updates === null ||
        Number(applicant.notify_application_updates) === 1;

      if (shouldNotify) {
        const petLabel = application.petName || "the pet";
        const title =
          status === "approved"
            ? `Your adoption request for ${petLabel} was approved`
            : `Your adoption request for ${petLabel} was rejected`;
        const body =
          status === "approved"
            ? `Great news — the owner approved your request to adopt ${petLabel}. They may contact you next.`
            : `The owner declined your request to adopt ${petLabel}.`;

        await run(
          `
            INSERT INTO notifications
              (userId, type, title, body, relatedPetId, relatedApplicationId, isRead, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            application.applicantId,
            "application_update",
            title,
            body,
            application.petId || null,
            id,
            0,
            new Date(),
          ],
        );
      }
    }

    res.json({ message: "Request updated", id, status });
  } catch (error) {
    next(error);
  }
};
