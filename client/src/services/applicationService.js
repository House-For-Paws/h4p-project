/**
 * =============================================================================
 * FILE: client/src/services/applicationService.js
 * ROLE: Adoption request API wrappers
 * =============================================================================
 */
import API from "./api";

export const createAdoptionApplication = (payload) =>
  API.post("/applications", payload);

export const getIncomingApplications = () => API.get("/applications/incoming");

export const getMyApplications = () => API.get("/applications/mine");

export const updateIncomingApplicationStatus = (id, status) =>
  API.patch(`/applications/${id}/status`, { status });
