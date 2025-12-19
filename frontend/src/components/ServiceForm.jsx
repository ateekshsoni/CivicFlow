import { useEffect, useState } from "react";
import { getFormSchema } from "../services/fetchSechemaService";
import { dbPromise } from "../db/db";
import { useParams } from "react-router-dom";

const ServiceForm = () => {
  const [schema, setSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { formId } = useParams();

  useEffect(() => {
    async function loadSchema() {
      try {
        const result = await getFormSchema(formId);
        console.log("Schema fetch result:", result);
        if (result.success) {
          setSchema(result.data);
          setError(null);
        } else {
          if (result.data) {
            setSchema(result.data);
            setError(result.message);
          } else {
            setError(result.message || "Failed to load form");
          }
        }
      } catch (err) {
        setError(err.message || "An error occurred while loading the form");
      } finally {
        setLoading(false);
      }
    }
    loadSchema();
  }, [formId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitted(true);
    try {
      const db = await dbPromise;

      if (!db) {
        console.error("IndexedDB is not initialized");
        setIsSubmitting(false);
        setError("Internal error: Unable to save submission");
        return;
      }

      if (db.get("submissions", { serviceId: schema.id, data: formData })) {
        console.log("Duplicate submission detected. Skipping save.");
        setIsSubmitting(false);
        return;
      }

      await db.put(
        "submissions",
        {
          serviceId: schema.id,
          data: formData,
          status: "completed",
          synced: false,
          completedAt: new Date().toISOString(),
        },
        `submission-${Date.now()}`
      );

      console.log("Form submitted:", formData);
      // Add your submit logic here
    } catch (err) {
      console.error("Form submission error:", err);
      setError("Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  // Error state with no schema
  if (!schema) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
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
            Error Loading Form
          </h3>
          <p className="text-red-600 text-center text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Thank You!</h2>
          <p className="text-gray-600">Your submission has been received.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600 mb-2">
            {schema.title}
          </h2>
          {error && (
            <div className="mt-3 flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <svg
                className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {schema.fields &&
            schema.fields.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={field.key}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  id={field.key}
                  type={field.type || "text"}
                  name={field.key}
                  placeholder={
                    field.placeholder || `Enter ${field.label.toLowerCase()}`
                  }
                  value={formData[field.key] || ""}
                  onChange={handleChange}
                  required={field.required}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 placeholder:text-gray-400 disabled:bg-gray-100"
                />
              </div>
            ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Completing Service...
              </>
            ) : (
              "Complete Service"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
