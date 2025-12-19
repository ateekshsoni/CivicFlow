import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [backendStatus, setbackendStatus] = useState("");
  const checkBackendStatus = async () => {
    try {
      let response = await axios.get(`${import.meta.env.VITE_API_URL}/status`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setbackendStatus("connected");
      }
    } catch (error) {
      console.error("Error fetching backend status:", error);
      console.log("Backend is not running or unreachable.");
      setbackendStatus("disconnected");
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
          <div>
            <h2>Your Submissions </h2>
          </div>

          <div className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Backend Connection Status
            </p>
            <button
              onClick={checkBackendStatus}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Check Backend Status
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
