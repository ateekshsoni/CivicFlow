/**
 * Sync Submission Service
 *
 * Handles syncing of locally stored submissions to the backend server
 * Implements a two-field status system:
 * - status: Tracks submission lifecycle ("complete")
 * - synced: Tracks backend sync state ("pending" | "synced" | "failed")
 *
 * Features:
 * - Filters submissions that need syncing (status: "complete", synced: "pending")
 * - Batch sync to backend API endpoint
 * - Updates local IndexedDB after successful/failed sync
 * - Tracks retry attempts for failed syncs
 * - Idempotent - can be called multiple times safely
 */

import axios from "axios";
import { getUserSubmissions, updateSubmissionStatus } from "./fetchSubmissions";

/**
 * Sync user submissions to backend server
 *
 * This function:
 * 1. Retrieves all user submissions from IndexedDB
 * 2. Filters for submissions that need syncing (complete + pending)
 * 3. Sends them to backend API in batch
 * 4. Updates local IndexedDB with sync results
 * 5. Handles both successful and failed syncs individually
 *
 * @returns {Promise<Object>} Sync result object
 * @returns {boolean} result.success - Whether sync operation succeeded
 * @returns {string} result.message - Human-readable result message
 * @returns {number} result.syncedCount - Number of successfully synced submissions
 * @returns {Array<string>} result.syncedIds - Array of successfully synced submission IDs
 *
 * @example
 * const result = await syncUserSubmissions();
 * if (result.success) {
 *   console.log(`Synced ${result.syncedCount} submissions`);
 * }
 */
export const syncUserSubmissions = async () => {
  try {
    // Step 1: Retrieve all submissions for current user from IndexedDB
    const userSubmissionsResponse = await getUserSubmissions();
    const userSubmissions = userSubmissionsResponse.data;

    // Step 2: Filter for submissions that need syncing
    // Only sync submissions that are:
    // - Complete (user has submitted the form)
    // - Pending sync (not yet synced to backend)
    const pendingSubmissions = userSubmissions.filter(
      (sub) => sub.status === "complete" && sub.synced === "pending"
    );

    // Step 3: Early return if nothing to sync
    // Prevents unnecessary API calls when all submissions are already synced
    if (pendingSubmissions.length === 0) {
      console.log("📭 No pending submissions to sync.");
      return {
        success: true,
        message: "No pending submissions to sync.",
        syncedCount: 0,
        syncedIds: [],
      };
    }

    // Step 4: Log sync attempt
    console.log(
      `📤 Syncing ${pendingSubmissions.length} pending submission${
        pendingSubmissions.length !== 1 ? "s" : ""
      } to backend...`
    );

    // Step 5: Send submissions to backend API
    // Backend will save them as JSON files in submissions/ directory
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/sync-submissions`,
      {
        submissions: [...pendingSubmissions], // Spread to create clean copy
      }
    );

    // Step 6: Process sync results
    if (response.data.success) {
      // Step 6a: Update successfully synced submissions in local IndexedDB
      // Mark them as "synced" so they won't be re-synced on next attempt
      for (const submissionId of response.data.syncedIds) {
        await updateSubmissionStatus(submissionId, {
          synced: "synced", // Change status from "pending" to "synced"
          syncedAt: new Date().toISOString(), // Record when sync happened
        });
      }

      // Step 6b: Handle failed syncs (if any)
      // Some submissions might fail validation or have other errors
      if (response.data.failedSyncs) {
        for (const failed of response.data.failedSyncs) {
          // Find the original submission to get current retry count
          const submission = pendingSubmissions.find(
            (sub) => sub.submissionId === failed.submissionId
          );

          // Update submission with failure details
          await updateSubmissionStatus(failed.submissionId, {
            synced: "failed", // Mark as failed (UI will show retry count)
            syncError: failed.error, // Store error message for debugging
            lastSyncAttempt: new Date().toISOString(), // Track last attempt time
            retryCount: (submission?.retryCount || 0) + 1, // Increment retry counter
          });
        }
      }

      console.log("✅ User submissions synced successfully.");
    }

    // Step 7: Return result to caller
    return {
      success: response.data.success,
      message: response.data.message || "User submissions synced successfully",
      syncedCount: response.data.syncedCount || 0,
      syncedIds: response.data.syncedIds || [],
    };
  } catch (err) {
    // Step 8: Handle network errors, server errors, etc.
    // This catches errors like:
    // - Network connection failure
    // - Server timeout
    // - Backend server not running
    // - Invalid backend URL
    console.error("❌ Failed to sync user submissions:", err);

    return {
      success: false,
      message: err.message || "Failed to sync user submissions",
    };
  }
};
