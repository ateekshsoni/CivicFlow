import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllAvailableForms } from "../services/fetchForms";

const ServiceForms = () => {
  const [receivedData, setReceivedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadForms() {
      try {
        const data = await getAllAvailableForms();
        setReceivedData(data);
        setError(null);
        console.log(
          "Service Forms response:",
          data,
          data["forms"].map((form) => form.id)
        );
      } catch (error) {
        console.error("Error fetching service forms:", error);
        setError("Failed to load forms. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadForms();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-gray-600 font-medium">
            Loading available forms...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Error Loading Forms
          </h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600 mb-4">
            Available Service Forms
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our collection of civic service forms. Quick, easy, and
            secure.
          </p>
          {receivedData.count && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full">
              <span className="text-indigo-700 font-semibold">
                {receivedData.count} Forms Available
              </span>
            </div>
          )}
        </div>

        {/* Forms Grid */}
        {receivedData.forms?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receivedData.forms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col transform hover:-translate-y-1"
              >
                {/* Form Icon/Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-linear-to-br from-indigo-500 to-purple-500 rounded-lg p-3">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  {form.fieldCount && (
                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                      {form.fieldCount} fields
                    </span>
                  )}
                </div>

                {/* Form Content */}
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {form.title}
                </h2>
                <p className="text-gray-600 text-sm mb-6 grow">
                  {form.description}
                </p>

                {/* Action Button */}
                <Link
                  to={`/forms/${form.id}`}
                  className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform transition duration-200 text-center flex items-center justify-center gap-2"
                >
                  <span>Fill Out Form</span>
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          // Empty state
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md mx-auto">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Forms Available
            </h3>
            <p className="text-gray-600">
              There are no forms available at the moment. Please check back
              later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceForms;
