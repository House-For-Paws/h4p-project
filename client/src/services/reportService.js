/**
 * =============================================================================
 * FILE: client/src/services/reportService.js
 * ROLE: Content report API (listing / comment)
 * =============================================================================
 */
import API from "./api";

export const createReport = (payload) => API.post("/reports", payload);
