import { uuidv7 } from 'uuidv7';

/**
 * Generate UUID v7 (time-sortable, sync-ready)
 * UUIDs are sortable by creation time which is important for:
 * - Maintaining chronological order
 * - Efficient database indexing
 * - Future sync functionality (Version 2.0)
 */
export function generateUUID() {
  return uuidv7(); // Returns UUID v7 (time-sortable)
}

/**
 * Validate if a string is a valid UUID
 */
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
