/**
 * =============================================================================
 * FILE: client/src/services/adminService.js
 * ROLE: Admin dashboard API wrappers (admin JWT required)
 * =============================================================================
 */
import API from "./api";

// ----- Stats / users -----
export const getAdminStats = () => API.get("/admin/stats");
export const getAdminUsers = () => API.get("/admin/users");
export const setAdminUserBanned = (id, { banned, reason, description } = {}) =>
  API.patch(`/admin/users/${id}/ban`, { banned, reason, description });
export const warnAdminUser = (id, { reason, message } = {}) =>
  API.post(`/admin/users/${id}/warn`, { reason, message });

// ----- Reports -----
export const getAdminReports = () => API.get("/admin/reports");
export const getAdminPendingReportsCount = () =>
  API.get("/admin/reports/pending-count");
export const getAdminReportMessages = (id) =>
  API.get(`/admin/reports/${id}/messages`);
export const updateAdminReportStatus = (id, status) =>
  API.patch(`/admin/reports/${id}`, { status });
export const deleteAdminReport = (id) => API.delete(`/admin/reports/${id}`);

// ----- Content moderation -----
export const getAdminComments = () => API.get("/admin/comments");
export const deleteAdminComment = (id) => API.delete(`/admin/comments/${id}`);
export const getAdminApplications = () => API.get("/admin/applications");
export const updateAdminApplicationStatus = (id, status) =>
  API.patch(`/admin/applications/${id}`, { status });
export const deleteAdminApplication = (id) =>
  API.delete(`/admin/applications/${id}`);
export const deleteAdminPet = (id) => API.delete(`/admin/pets/${id}`);
