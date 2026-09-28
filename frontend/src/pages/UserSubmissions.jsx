import { useEffect, useState } from "react";
import {
  getUserSubmissions,
  deleteSubmission,
} from "../services/fetchSubmissions";
import { syncUserSubmissions } from "../services/syncSubmission";

/**
 * UserSubmissions Component
 *
 * Displays all submissions made by the current user
 * Features:
 * - Auto-loads user submissions on mount
 * - Shows submission cards with metadata
 * - Delete functionality for each submission
 * - Empty state when no submissions exist
 * - Responsive grid layout
 */
const UserSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  /**
   * Load user's submissions from IndexedDB
   */
  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const result = await getUserSubmissions();

      if (result.success) {
        setSubmissions(result.data);
        console.log(
          `📋 Loaded ${result.data.length} user submission${
            result.data.length !== 1 ? "s" : ""
          }`
        );
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("❌ Error loading submissions:", err);
      setError("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a submission
   * @param {string} submissionId - ID of submission to delete
   */
  const handleDelete = async (submissionId) => {
    if (!confirm("Are you sure you want to delete this submission?")) {
      return;
    }

    try {
      setDeletingId(submissionId);
      const result = await deleteSubmission(submissionId);

      if (result.success) {
        console.log("✅ Submission deleted:", submissionId);
        // Remove from state
        setSubmissions((prev) =>
          prev.filter((sub) => sub.submissionId !== submissionId)
        );
      } else {
        alert(result.message || "Failed to delete submission");
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("Failed to delete submission");
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Format timestamp to readable date
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} Formatted date
   */
  const formatDate = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  /**
   * Sync pending submissions to backend
   */
  const handleSync = async () => {
    try {
      setSyncing(true);
      setSyncMessage(null);

      console.log("🔄 Starting manual sync...");
      const result = await syncUserSubmissions();

      if (result.success) {
        // Reload submissions to show updated sync status
        await loadSubmissions();

        // Show success message
        setSyncMessage({
          type: "success",
          text:
            result.syncedCount > 0
              ? `✅ ${result.syncedCount} submission${
                  result.syncedCount !== 1 ? "s" : ""
                } synced successfully!`
              : "✅ All submissions are already synced",
        });

        // Clear message after 5 seconds
        setTimeout(() => setSyncMessage(null), 5000);
      } else {
        setSyncMessage({
          type: "error",
          text: `❌ ${result.message}`,
        });
      }
    } catch (err) {
      console.error("❌ Sync error:", err);
      setSyncMessage({
        type: "error",
        text: "❌ Failed to sync submissions. Please try again.",
      });
    } finally {
      setSyncing(false);
    }
  };

  /**
   * Get sync status badge component
   * @param {Object} submission - Submission object
   */
  const getSyncStatusBadge = (submission) => {
    if (submission.synced === "synced") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ Synced
        </span>
      );
    }

    if (submission.synced === "pending") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          ⏳ Pending Sync
        </span>
      );
    }

    if (submission.synced === "failed") {
      const retries = submission.retryCount || 0;
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          ⚠️ Sync Failed (Retry {retries}/3)
        </span>
      );
    }

    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-6 font-sans text-neutral-900">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xs">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
          </div>
          <p className="text-neutral-500 font-medium">Loading your submissions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-6 font-sans text-neutral-900">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xs">
          <div className="flex items-center justify-center mb-4 text-red-500">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Error Loading Submissions</h3>
          <p className="text-neutral-500 text-sm mb-6">{error}</p>
          <button
            onClick={loadSubmissions}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-3 px-4 rounded-xl transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (submissions.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-6 font-sans text-neutral-900">
        <div className="bg-white border border-neutral-200 rounded-3xl p-12 max-w-md w-full text-center shadow-xs">
          <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-neutral-400 border border-neutral-100">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Submissions Yet</h3>
          <p className="text-neutral-500 mb-8 leading-relaxed">
            You haven't submitted any forms. Get started by filling out a civic service form.
          </p>
          <a
            href="/service-forms"
            className="inline-block w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-3 px-6 rounded-xl transition duration-200"
          >
            Browse Forms
          </a>
        </div>
      </div>
    );
  }

  // Main submissions list
  return (
    <div className="min-h-screen bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-neutral-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 mb-2 font-display">
              My Submissions
            </h1>
            <p className="text-neutral-500">
              {submissions.length} submission{submissions.length !== 1 ? "s" : ""} saved locally
            </p>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-xs"
          >
            {syncing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Sync to Backend</span>
              </>
            )}
          </button>
        </div>

        {syncMessage && (
          <div
            className={`mb-8 p-4 rounded-xl border ${
              syncMessage.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {syncMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((submission) => (
            <div
              key={submission.submissionId}
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs hover:border-neutral-300 transition-colors flex flex-col"
            >
              <div className="bg-neutral-50 border-b border-neutral-100 p-5">
                <h3 className="text-neutral-900 font-semibold text-lg truncate mb-1">
                  {submission.formTitle || "Untitled Form"}
                </h3>
                <p className="text-neutral-500 text-xs font-mono">
                  ID: {submission.formId}
                </p>
              </div>

              <div className="p-5 grow flex flex-col">
                <div className="mb-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatDate(submission.submittedAt)}</span>
                  </div>
                  <div className="flex items-center">
                    {getSyncStatusBadge(submission)}
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-4 mb-6 space-y-2 grow">
                  <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold mb-3">
                    Form Data
                  </p>
                  {Object.entries(submission.formData || {})
                    .slice(0, 3)
                    .map(([key, value]) => (
                      <div key={key} className="text-sm flex justify-between gap-4">
                        <span className="text-neutral-500 truncate min-w-0">{key}:</span>
                        <span className="text-neutral-900 font-medium truncate min-w-0">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  {Object.keys(submission.formData || {}).length > 3 && (
                    <p className="text-xs text-neutral-400 italic pt-2">
                      +{Object.keys(submission.formData).length - 3} more field{Object.keys(submission.formData).length - 3 !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(submission.submissionId)}
                  disabled={deletingId === submission.submissionId}
                  className="w-full bg-white hover:bg-red-50 text-red-600 font-medium py-2.5 px-4 rounded-xl border border-neutral-200 hover:border-red-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {deletingId === submission.submissionId ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Submission
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSubmissions;
