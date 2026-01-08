/**
 * Auto-Sync Service
 *
 * Automatically syncs pending submissions when:
 * 1. User comes back online (event listener)
 * 2. On interval while online (every 2 minutes)
 * 3. After form submission (triggered manually)
 *
 * Smart Features:
 * - Only syncs when online (checks navigator.onLine)
 * - Implements 3 automatic retry attempts with exponential backoff
 * - Prevents concurrent syncs (debouncing)
 * - Logs all attempts for debugging
 *
 */

import { syncUserSubmissions } from "./syncSubmission";

/**
 * Auto-sync configuration
 */
const AUTO_SYNC_CONFIG = {
  INTERVAL: 2 * 60 * 1000, // 2 minutes
  MAX_AUTO_RETRIES: 3, // 3 automatic retry attempts
  RETRY_DELAYS: [
    1 * 60 * 1000, // 1st retry: 1 minute
    5 * 60 * 1000, // 2nd retry: 5 minutes
    15 * 60 * 1000, // 3rd retry: 15 minutes
  ],
};

let syncInterval = null;
let isSyncing = false;

/**
 * Check if device is online
 * @returns {boolean} Online status
 */
const isOnline = () => {
  return navigator.onLine;
};

/**
 * Perform sync with online check
 * Prevents multiple concurrent syncs
 * @param {string} trigger - What triggered the sync (for logging)
 * @returns {Promise<Object>} Sync result
 */
export const performSync = async (trigger = "manual") => {
  // Guard: Check if already syncing
  if (isSyncing) {
    console.log(`⏭️  Sync skipped: Already syncing (trigger: ${trigger})`);
    return { success: false, message: "Sync already in progress" };
  }

  // Guard: Check if online
  if (!isOnline()) {
    console.log(`⚠️  Sync skipped: Device offline (trigger: ${trigger})`);
    return { success: false, message: "Device is offline" };
  }

  // Perform sync
  isSyncing = true;
  console.log(`🔄 Starting sync... (trigger: ${trigger})`);

  try {
    const result = await syncUserSubmissions();
    console.log(
      `✅ Sync completed: ${result.syncedCount} submissions (trigger: ${trigger})`
    );
    return result;
  } catch (error) {
    console.error(`❌ Sync failed (trigger: ${trigger}):`, error);
    return { success: false, message: error.message };
  } finally {
    isSyncing = false;
  }
};

/**
 * Start auto-sync service
 * Sets up interval and event listeners
 */
export const startAutoSync = () => {
  console.log("🚀 Auto-sync service started");

  // 1. Set up periodic sync (every 2 minutes)
  if (!syncInterval) {
    syncInterval = setInterval(() => {
      performSync("interval");
    }, AUTO_SYNC_CONFIG.INTERVAL);
  }

  // 2. Listen for online event (sync when connection restored)
  window.addEventListener("online", handleOnlineEvent);

  // 3. Initial sync if online
  if (isOnline()) {
    setTimeout(() => performSync("startup"), 2000); // Wait 2s after startup
  }
};

/**
 * Stop auto-sync service
 * Clean up intervals and event listeners
 */
export const stopAutoSync = () => {
  console.log("🛑 Auto-sync service stopped");

  // Clear interval
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }

  // Remove event listener
  window.removeEventListener("online", handleOnlineEvent);
};

/**
 * Handle online event
 * Debounced to prevent multiple rapid syncs
 */
let onlineTimeout = null;
const handleOnlineEvent = () => {
  console.log("🌐 Network restored - scheduling sync...");

  // Clear previous timeout if exists
  if (onlineTimeout) {
    clearTimeout(onlineTimeout);
  }

  // Debounce: Wait 3 seconds after online event before syncing
  // (Network might be unstable right after reconnect)
  onlineTimeout = setTimeout(() => {
    performSync("network-restored");
    onlineTimeout = null;
  }, 3000);
};

/**
 * Check if submission should be retried based on retry count and time
 * Implements exponential backoff strategy
 *
 * @param {Object} submission - Submission object
 * @returns {boolean} Whether to retry this submission
 */
export const shouldRetrySubmission = (submission) => {
  // If not failed, don't retry
  if (submission.synced !== "failed") {
    return false;
  }

  // If exceeded max retries, don't auto-retry (user must manually retry)
  if (submission.retryCount >= AUTO_SYNC_CONFIG.MAX_AUTO_RETRIES) {
    return false;
  }

  // If no last attempt recorded, retry
  if (!submission.lastSyncAttempt) {
    return true;
  }

  // Calculate time since last attempt
  const timeSinceLastAttempt =
    Date.now() - new Date(submission.lastSyncAttempt).getTime();

  // Get delay for current retry count (0-indexed)
  const requiredDelay =
    AUTO_SYNC_CONFIG.RETRY_DELAYS[submission.retryCount] ||
    AUTO_SYNC_CONFIG.RETRY_DELAYS[2];

  // Retry if enough time has passed
  return timeSinceLastAttempt >= requiredDelay;
};

/**
 * Get next retry time for failed submission
 * @param {Object} submission - Submission object
 * @returns {number|null} Timestamp of next retry, or null if no retry
 */
export const getNextRetryTime = (submission) => {
  if (
    submission.synced !== "failed" ||
    submission.retryCount >= AUTO_SYNC_CONFIG.MAX_AUTO_RETRIES
  ) {
    return null;
  }

  if (!submission.lastSyncAttempt) {
    return Date.now();
  }

  const lastAttempt = new Date(submission.lastSyncAttempt).getTime();
  const delay =
    AUTO_SYNC_CONFIG.RETRY_DELAYS[submission.retryCount] ||
    AUTO_SYNC_CONFIG.RETRY_DELAYS[2];

  return lastAttempt + delay;
};

export default {
  startAutoSync,
  stopAutoSync,
  performSync,
  shouldRetrySubmission,
  getNextRetryTime,
  AUTO_SYNC_CONFIG,
};
