/**
 * Factory: returns middleware that allows only listed roles (after authMiddleware).
 * Admin shortcuts: "admin" also allows administrator/superadmin for compatibility.
 * @param {...string} allowedRoles — e.g. roleMiddleware("admin")
 */
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const normalizeRole = (role) => String(role || "").trim().toLowerCase();
    const currentRole = normalizeRole(req.user.role);
    const normalizedAllowed = allowedRoles.map(normalizeRole);

    // Accept common admin variants to avoid casing/data inconsistency lockouts.
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
