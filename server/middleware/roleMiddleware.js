/**
 * =============================================================================
 * FILE: server/middleware/roleMiddleware.js
 * ROLE: Role gate — use AFTER authMiddleware
 * =============================================================================
 * Example: router.get("/stats", authMiddleware, roleMiddleware("admin"), …)
 * "admin" also accepts administrator / superadmin.
 * =============================================================================
 */
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const normalizeRole = (role) => String(role || "").trim().toLowerCase();
    const currentRole = normalizeRole(req.user.role);
    const normalizedAllowed = allowedRoles.map(normalizeRole);

    if (
      normalizedAllowed.includes("admin") &&
      (currentRole === "administrator" || currentRole === "superadmin")
    ) {
      return next();
    }

    if (!normalizedAllowed.includes(currentRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};
