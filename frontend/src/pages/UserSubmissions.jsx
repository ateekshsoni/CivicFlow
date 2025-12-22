import { useEffect, useState } from "react";
import {
  getUserSubmissions,
  deleteSubmission,
} from "../services/fetchSubmissions";

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-gray-600 font-medium">
            Loading your submissions...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
            Error Loading Submissions
          </h3>
          <p className="text-red-600 text-center text-sm">{error}</p>
          <button
            onClick={loadSubmissions}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
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
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center mb-4">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Submissions Yet
          </h3>
          <p className="text-gray-600 mb-6">
            You haven't submitted any forms. Get started by filling out a civic
            service form.
          </p>
          <a
            href="/service-forms"
            className="inline-block bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
          >
            Browse Forms
          </a>
        </div>
      </div>
    );
  }

  // Main submissions list
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600 mb-2">
            My Submissions
          </h1>
          <p className="text-gray-600">
            {submissions.length} submission{submissions.length !== 1 ? "s" : ""}{" "}
            saved locally
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((submission) => (
            <div
              key={submission.submissionId}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden"
            >
              <div className="bg-linear-to-r from-indigo-500 to-purple-500 p-4">
                <h3 className="text-white font-semibold text-lg truncate">
                  {submission.formTitle || "Untitled Form"}
                </h3>
                <p className="text-indigo-100 text-sm">
                  Form ID: {submission.formId}
                </p>
              </div>

              <div className="p-4">
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{formatDate(submission.submittedAt)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      📦 Pending Sync
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                    Form Data:
                  </p>
                  {Object.entries(submission.formData || {})
                    .slice(0, 3)
                    .map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="text-gray-600 font-medium">
                          {key}:
                        </span>{" "}
                        <span className="text-gray-800">
                          {String(value).substring(0, 30)}
                          {String(value).length > 30 ? "..." : ""}
                        </span>
                      </div>
                    ))}
                  {Object.keys(submission.formData || {}).length > 3 && (
                    <p className="text-xs text-gray-500 italic">
                      +{Object.keys(submission.formData).length - 3} more field
                      {Object.keys(submission.formData).length - 3 !== 1
                        ? "s"
                        : ""}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(submission.submissionId)}
                  disabled={deletingId === submission.submissionId}
                  className="mt-4 w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deletingId === submission.submissionId ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
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
