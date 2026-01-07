import { dbPromise } from "../db/db";
import { getUserId } from "../utils/userId";

/**
 * Generate a unique submission ID
 * Format: formId-timestamp-random
 * Example: scholarship-2026-1703155200000-a7b3c2
 */

const generateSubmissionId = (formId) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${formId}-${timestamp}-${random}`;
};

/**
 * Save a form submission to IndexedDB
 * @param {Object} schema - The form schema (contains id, title, description)
 * @param {Object} formData - The user's form responses (key-value pairs)
 * @returns {Object} - { success: boolean, submissionId: string, message: string }
 */

export const saveSubmission = async (schema, formData) => {
  try {
    // Validate inputs
    if (!schema || !schema.id || !schema.title) {
      throw new Error("Invalid schema: missing id or title");
    }

    if (!formData || Object.keys(formData).length === 0) {
      throw new Error("Form data is empty");
    }

    // Get user ID (creates one if doesn't exist)
    const userId = getUserId();

    // Generate unique submission ID
    const submissionId = generateSubmissionId(schema.id);

    // Create submission object with all metadata
    const submission = {
      // Unique identifiers
      id: submissionId,
      submissionId: submissionId, // Backup for queries

      // User tracking
      userId: userId,

      // Form metadata
      formId: schema.id,
      formTitle: schema.title,
      formDescription: schema.description || "",

      // User's form data
      formData: formData,

      // Status tracking (two separate concerns)
      status: "complete", // Submission lifecycle: "complete" (form submitted)
      synced: "pending", // Backend sync state: "pending" | "synced" | "failed"

      // Timestamps
      submittedAt: new Date().toISOString(),
      syncedAt: null,

      // Sync metadata (for future backend sync)
      retryCount: 0,
      lastSyncAttempt: null,
      syncError: null,
    };

    // Save to IndexedDB
    const db = await dbPromise;
    await db.put("submissions", submission, submissionId);

    console.log("✅ Submission saved to IndexedDB:", {
      submissionId,
      userId,
      formTitle: schema.title,
      timestamp: submission.submittedAt,
    });

    // Return success response
    return {
      success: true,
      submissionId: submissionId,
      message: "Submission saved successfully",
      data: submission,
    };
  } catch (err) {
    console.error("❌ Failed to save submission:", err);

    // Return failure response
    return {
      success: false,
      submissionId: null,
      message: err.message || "Failed to save submission",
      error: err,
    };
  }
};

/**
 * Get all submissions from IndexedDB
 * @returns {Array} - Array of submission objects, sorted by newest first
 */
export const getAllSubmissions = async () => {
  try {
    const db = await dbPromise;
    const submissions = await db.getAll("submissions");

    // Sort by submission date (newest first)
    const sorted = submissions.sort((a, b) => {
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });

    console.log(`📋 Retrieved ${sorted.length} submissions from IndexedDB`);
    return sorted;
  } catch (err) {
    console.error("❌ Failed to get submissions:", err);
    return [];
  }
};

/**
 * Get a specific submission by ID
 * @param {string} submissionId - The unique submission ID
 * @returns {Object|null} - The submission object or null if not found
 */
export const getSubmissionById = async (submissionId) => {
  try {
    const db = await dbPromise;
    const submission = await db.get("submissions", submissionId);

    if (!submission) {
      console.warn(`⚠️ Submission not found: ${submissionId}`);
      return null;
    }

    console.log(`✅ Retrieved submission: ${submissionId}`);
    return submission;
  } catch (err) {
    console.error("❌ Failed to get submission:", err);
    return null;
  }
};

/**
 * Delete a submission from IndexedDB
 * @param {string} submissionId - The unique submission ID
 * @returns {Object} - { success: boolean, message: string }
 */
export const deleteSubmission = async (submissionId) => {
  try {
    const db = await dbPromise;
    await db.delete("submissions", submissionId);
    console.log(`🗑️ Deleted submission: ${submissionId}`);
    return {
      success: true,
      message: "Submission deleted successfully",
    };
  } catch (err) {
    console.error("❌ Failed to delete submission:", err);
    return {
      success: false,
      message: err.message || "Failed to delete submission",
    };
  }
};

export const updateSubmissionStatus = async (submissionId, statusUpdate) => {
  try {
    const submission = await getSubmissionById(submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    // Update fields
    const updatedSubmission = {
      ...submission,
      ...statusUpdate,
    };

    const db = await dbPromise;
    await db.put("submissions", updatedSubmission, submissionId);

    console.log(`✅ Updated submission status: ${submissionId}`, statusUpdate);

    return {
      success: true,
      message: "Submission updated successfully",
      data: updatedSubmission,
    };
  } catch (err) {
    console.error("❌ Failed to update submission status:", err);
    return {
      success: false,
      message: err.message || "Failed to update submission",
      error: err,
    };
  }
};

/**
 * Get submissions for current user only
 * @returns {Object} - { success: boolean, data: Array, message: string }
 */
export const getUserSubmissions = async () => {
  try {
    const userId = getUserId();
    const allSubmissions = await getAllSubmissions();

    // Filter by current user
    const userSubmissions = allSubmissions.filter(
      (sub) => sub.userId === userId
    );

    console.log(
      `👤 Retrieved ${userSubmissions.length} submissions for user ${userId}`
    );

    return {
      success: true,
      data: userSubmissions,
      message: "Submissions retrieved successfully",
    };
  } catch (err) {
    console.error("❌ Failed to get user submissions:", err);
    return {
      success: false,
      data: [],
      message: err.message || "Failed to retrieve submissions",
    };
  }
};
