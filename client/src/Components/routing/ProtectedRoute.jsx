/**
 * =============================================================================
 * FILE: client/src/Components/routing/ProtectedRoute.jsx
 * ROLE: Require login (and optionally admin) before rendering a page
 * =============================================================================
 */
import { Navigate, useLocation } from "react-router-dom";

function readTokenRole() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return String(payload?.role || "").toLowerCase();
  } catch {
    return "";
  }
}

function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (adminOnly) {
    const role = readTokenRole();
    const isAdmin =
      role === "admin" || role === "administrator" || role === "superadmin";
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
