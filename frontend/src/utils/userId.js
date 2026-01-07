/**
 * User ID Management Utility
 *
 * Simple anonymous user ID system using browser's built-in crypto.randomUUID()
 * The ID persists in localStorage across sessions on the same device/browser.
 */

const USER_ID_KEY = "civicflow_user_id";

/**
 * Get or create a unique user ID
 * Uses crypto.randomUUID() - standard UUID v4 format
 * Example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *
 * @returns {string} - UUID v4 format user ID
 */
export const getUserId = () => {
  // Check if user already has an ID
  let userId = localStorage.getItem(USER_ID_KEY);

  // If not, create a new UUID and save it
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
    console.log("🆕 New user created:", userId);
  }

  return userId;
};
