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
      <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-6 font-sans text-neutral-900">
        <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl border border-neutral-200/60 rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-neutral-100 rounded-2xl mb-6 shadow-xs border border-neutral-200/50">
              <svg className="w-8 h-8 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 mb-4 font-display">
              CivicFlow
            </h1>
            <p className="text-neutral-500 text-lg max-w-lg mx-auto leading-relaxed">
              Resilient digital infrastructure for critical public services. Built to work even when the internet doesn't.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Action 1 */}
            <Link
              to="/service-forms"
              className="group relative flex flex-col justify-between p-6 bg-white border border-neutral-200 hover:border-neutral-300 rounded-2xl transition-all duration-300 hover:shadow-xs overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <div className="w-12 h-12 bg-neutral-100 border border-neutral-200/60 rounded-xl flex items-center justify-center mb-6 text-neutral-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">Service Forms</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">Browse and apply for available government services.</p>
              </div>
            </Link>

            {/* Action 2 */}
            <Link
              to="/user-submissions"
              className="group relative flex flex-col justify-between p-6 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-2xl transition-all duration-300 hover:shadow-xs overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center mb-6 text-neutral-300 border border-neutral-700/50">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Your Submissions</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">Track progress and auto-sync offline drafts.</p>
              </div>
            </Link>
          </div>

          {/* Backend Status Minimal */}
          <div className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                {backendStatus === "connected" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  backendStatus === "connected" ? 'bg-emerald-500' 
                  : backendStatus === "disconnected" ? 'bg-red-500' 
                  : 'bg-neutral-300'
                }`}></span>
              </div>
              <span className="text-sm font-medium text-neutral-700">
                {isCheckingStatus ? "Checking Systems..." 
                 : backendStatus === "connected" ? "Systems Operational" 
                 : backendStatus === "disconnected" ? "Systems Offline (Mocking Failures)" 
                 : "Status Unknown"}
              </span>
            </div>
            <button 
              onClick={checkBackendStatus}
              disabled={isCheckingStatus}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-50 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
            >
              Refresh Status
            </button>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default HomePage;
