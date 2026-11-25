/**
 * =============================================================================
 * FILE: server/utils/userBlocks.js
 * ROLE: Shared helpers for user_blocks (messaging gates)
 * =============================================================================
 */
const { query } = require("../config/db");

async function isBlockedBetween(userA, userB) {
  const a = Number(userA);
  const b = Number(userB);
  if (!a || !b || a === b) return false;
  const rows = await query(
    `
      SELECT id
      FROM user_blocks
      WHERE (blockerId = ? AND blockedId = ?)
         OR (blockerId = ? AND blockedId = ?)
      LIMIT 1
    `,
    [a, b, b, a],
  );
  return Boolean(rows[0]);
}

module.exports = {
  isBlockedBetween,
};
