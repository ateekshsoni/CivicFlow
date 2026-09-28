import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllAvailableForms } from "../services/fetchForms";

/**
 * ServiceForms Component
 *
 * Displays a grid of all available civic service forms
 * Handles loading, error, and empty states
 * Supports offline mode with cached data
 *
 * Features:
 * - Fetches forms list from backend
 * - Falls back to cache when offline
 * - Shows loading spinner during fetch
 * - Displays error messages on failure
 * - Responsive grid layout
 * - Form cards with metadata (title, description, field count)
 */
const ServiceForms = () => {
  // State management
  const [formsData, setFormsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCached, setIsCached] = useState(false);

  /**
   * Load forms on component mount
   * Handles both online and offline scenarios
   */
  useEffect(() => {
    const loadForms = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getAllAvailableForms();

        // Check if service call was successful
        if (result.success) {
          setFormsData(result.data);
          setIsCached(result.cached);
          console.log(
            `📋 Loaded ${result.data.count} forms${
              result.cached ? " from cache" : ""
            }`
          );
        } else {
          // Service returned failure
          setError(result.message || "Failed to load forms");
          console.error("❌ Failed to load forms:", result.message);
        }
      } catch (err) {
        // Unexpected error (shouldn't happen with proper service)
        console.error("❌ Unexpected error loading forms:", err);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, []); // Empty dependency array - load once on mount

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-6 font-sans text-neutral-900">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xs">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
          </div>
          <p className="text-neutral-500 font-medium">Loading available forms...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-6 font-sans text-neutral-900">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xs">
          <div className="flex justify-center mb-4 text-red-500">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Error Loading Forms</h3>
          <p className="text-neutral-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-neutral-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 mb-4 font-display">
            Available Service Forms
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            Choose from our collection of civic service forms. Designed for resilience.
          </p>
          {isCached && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full shadow-xs">
              <span className="text-yellow-700 font-medium text-sm">
                📦 Viewing cached data (offline mode)
              </span>
            </div>
          )}
          {formsData?.count !== undefined && (
            <div className="mt-4 ml-2 inline-flex items-center px-4 py-2 bg-neutral-100 border border-neutral-200 rounded-full shadow-xs">
              <span className="text-neutral-700 font-medium text-sm">
                {formsData.count} Form{formsData.count !== 1 ? "s" : ""} Available
              </span>
            </div>
          )}
        </div>

        {formsData?.forms?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formsData.forms.map((form) => (
              <div
                key={form.id}
                className="group relative flex flex-col justify-between p-6 bg-white border border-neutral-200 hover:border-neutral-300 rounded-2xl transition-all duration-300 hover:shadow-xs overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-neutral-100 border border-neutral-200/60 rounded-xl flex items-center justify-center text-neutral-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  {form.fieldCount && (
                    <span className="bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs font-medium px-3 py-1 rounded-full">
                      {form.fieldCount} field{form.fieldCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="grow">
                  <h2 className="text-xl font-semibold text-neutral-900 mb-2">{form.title}</h2>
                  <p className="text-neutral-500 text-sm mb-6 leading-relaxed">{form.description}</p>
                </div>

                <Link
                  to={`/forms/${form.id}`}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-3 px-6 rounded-xl transition duration-200 text-center flex items-center justify-center gap-2"
                >
                  <span>Fill Out Form</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xs">
            <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-neutral-400 border border-neutral-100">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Forms Available</h3>
            <p className="text-neutral-500">Check back later for new services.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceForms;
