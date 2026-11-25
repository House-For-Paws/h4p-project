/**
 * =============================================================================
 * FILE: client/src/services/reportService.js
 * ROLE: Content / bug / messaging-user report API
 * =============================================================================
 */
import API from "./api";

export const createReport = (payload) => API.post("/reports", payload);

/** Site-wide bug report (footer). Requires auth. Optional base64 screenshot. */
export const createBugReport = ({ reason, description, screenshot }) =>
  API.post("/reports", {
    targetType: "bug",
    reason,
    description,
    screenshot: screenshot || undefined,
  });

/** Report another user from messaging. Requires a shared thread. */
export const createMessageUserReport = ({
  userId,
  threadId,
  reason,
  description,
}) =>
  API.post("/reports", {
    targetType: "user",
    targetId: userId,
    threadId,
    reason,
    description,
  });
