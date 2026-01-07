import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * HomePage Component
 *
 * Landing page for CivicFlow application
 * Features:
 * - Backend connectivity check with visual indicators
 * - Quick navigation to forms and submissions
 * - Responsive design with gradient styling
 */

const HomePage = () => {
  const [backendStatus, setBackendStatus] = useState("");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  /**
   * Check backend server connectivity
   * Makes a GET request to /status endpoint
   * Updates backendStatus state with result
   */
  const checkBackendStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/status`,
        {
          withCredentials: true,
          timeout: 5000, // 5 second timeout
        }
      );

      if (response.status === 200) {
        console.log("✅ Backend connected successfully");
        setBackendStatus("connected");
      }
    } catch (error) {
      console.error("❌ Backend connection failed:", error.message);
      setBackendStatus("disconnected");
    } finally {
      setIsCheckingStatus(false);
    }
  };
  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600 mb-4">
              Welcome to CivicFlow
            </h1>
            <p className="text-gray-600 text-lg">
              Your Civic Engagement Platform
            </p>
          </div>

          {/* Your Submissions Section */}
          <Link
            to="/user-submissions"
            className="block mb-6 bg-linear-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 hover:from-indigo-600 hover:to-purple-600 transform hover:scale-[1.02] transition duration-200 shadow-lg hover:shadow-xl group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:bg-white/30 transition">
                  <svg
                    className="w-8 h-8 text-white"
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
                <div className="text-left">
                  <h2 className="text-xl font-bold text-white mb-1">
                    Your Submissions
                  </h2>
                  <p className="text-indigo-100 text-sm">
                    View and manage your form submissions
                  </p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg group-hover:bg-white/30 group-hover:translate-x-1 transition">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>

          <div className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Backend Connection Status
            </p>
            <button
              onClick={checkBackendStatus}
              disabled={isCheckingStatus}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingStatus ? "Checking..." : "Check Backend Status"}
            </button>

            {backendStatus === "connected" && (
              <div className="mt-4 flex items-center justify-center gap-2 text-green-700 bg-green-100 py-3 px-4 rounded-lg">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">
                  Backend Status: Connected ✓
                </span>
              </div>
            )}

            {backendStatus === "disconnected" && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-700 bg-red-100 py-3 px-4 rounded-lg">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">
                  Backend Status: Disconnected ✗
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
              Quick Actions
            </h2>
            <Link
              to="/sample-form"
              className="block w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 text-center"
            >
              📝 Open Sample Form
            </Link>
            <Link
              to="/service-forms"
              className="block w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 text-center"
            >
              📝 Check Sample Service Form
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
