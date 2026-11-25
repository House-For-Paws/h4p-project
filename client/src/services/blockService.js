/**
 * =============================================================================
 * FILE: client/src/services/blockService.js
 * ROLE: Block / unblock users API
 * =============================================================================
 */
import API from "./api";

export const getMyBlocks = () => API.get("/blocks");

export const blockUser = (payload) => API.post("/blocks", payload);

export const unblockUser = (userId) => API.delete(`/blocks/${userId}`);
