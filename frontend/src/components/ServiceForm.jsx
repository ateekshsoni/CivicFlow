import { useEffect, useState, useRef, useCallback } from "react";
import { getFormSchema } from "../services/fetchSechemaService";
import { saveSubmission } from "../services/fetchSubmissions";
import { useParams } from "react-router-dom";
import { dbPromise } from "../db/db";

/**
 * ServiceForm Component
 *
 * Dynamically renders a form based on a schema fetched from the backend
 * Features:
 * - Dynamic field generation from schema
 * - Form validation (required fields)
 * - Offline submission support via IndexedDB
 * - Loading, error, and success states
 * - Schema caching for offline access
 *
 * @example
 * // Used in routing:
 * <Route path="/forms/:formId" element={<ServiceForm />} />
 */
const ServiceForm = () => {
  const [schema, setSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const { formId } = useParams();
  const autoSaveTimerRef = useRef(null);

  /**
   * Auto-save form data to IndexedDB (debounced)
   * Prevents data loss on refresh or accidental navigation
   * Uses a 1-second debounce to avoid excessive writes
   */
  const autoSaveFormData = useCallback(
    async (data) => {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Debounce: save after 1 second of inactivity
      autoSaveTimerRef.current = setTimeout(async () => {
        // Only save if there's actual data
        if (Object.keys(data).length === 0) return;

        try {
          setIsAutoSaving(true);
          const db = await dbPromise;
          const draftKey = `draft_${formId}`;

          // Save draft with metadata
          await db.put(
            "forms",
            {
              formData: data,
              savedAt: new Date().toISOString(),
              formId: formId,
            },
            draftKey
          );

          setLastSavedAt(new Date());
          console.log(`💾 Auto-saved draft for form: ${formId}`);
        } catch (err) {
          console.error("❌ Auto-save failed:", err);
        } finally {
          setIsAutoSaving(false);
        }
      }, 1000); // 1 second debounce
    },
    [formId]
  );

  /**
   * Load draft data from IndexedDB on component mount
   * Restores user's work if they refresh or navigate away
   */
  useEffect(() => {
    async function loadDraft() {
      try {
        const db = await dbPromise;
        const draftKey = `draft_${formId}`;
        const draft = await db.get("forms", draftKey);

        if (draft && draft.formData) {
          setFormData(draft.formData);
          setIsDraftLoaded(true);
          setLastSavedAt(new Date(draft.savedAt));
          console.log(`📂 Loaded draft for form: ${formId}`);
        }
      } catch (err) {
        console.error("❌ Failed to load draft:", err);
      }
    }

    if (formId) {
      loadDraft();
    }

    // Cleanup: clear timer on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formId]);

  useEffect(() => {
    /**
     * Load form schema from backend or cache
     * Handles both successful and cached schema responses
     */
    async function loadSchema() {
      try {
        const result = await getFormSchema(formId);
        console.log(`📋 Schema fetch result:`, result);

        if (result.success) {
          setSchema(result.data);
          setIsCached(result.cached || false);
          setError(null);
        } else {
          // Even if not success, might have cached data
          if (result.data) {
            setSchema(result.data);
            setIsCached(true);
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

  /**
   * Handle form field changes
   * Updates formData state and triggers auto-save
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedData);

    // Trigger auto-save (debounced)
    autoSaveFormData(updatedData);
  };

  /**
   * Handle form submission
   * Saves to IndexedDB and shows success/error state
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use the improved saveSubmission service
      const result = await saveSubmission(schema, formData);

      if (result.success) {
        console.log("✅ Submission successful:", result.submissionId);
        setSubmitted(true);
        setError(null);

        // Clear the form after successful submission
        setFormData({});

        // Delete the draft from IndexedDB
        try {
          const db = await dbPromise;
          const draftKey = `draft_${formId}`;
          await db.delete("forms", draftKey);
          console.log("🗑️ Draft cleared after successful submission");
        } catch (err) {
          console.error("⚠️ Failed to clear draft:", err);
        }

        // Optional: Show success message for a few seconds, then redirect
        // setTimeout(() => {
        //   navigate('/my-submissions');
        // }, 2000);
      } else {
        console.error("❌ Submission failed:", result.message);
        setError(result.message || "Failed to save submission");
        setSubmitted(false);
      }
    } catch (err) {
      console.error("❌ Unexpected error during submission:", err);
      setError("An unexpected error occurred. Please try again.");
      setSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-6 font-sans text-neutral-900">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xs">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
          </div>
          <p className="text-neutral-500 font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  // Error state with no schema
  if (!schema) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-6 font-sans text-neutral-900">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xs">
          <div className="flex justify-center mb-4 text-red-500">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Error Loading Form</h3>
          <p className="text-neutral-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-6 font-sans text-neutral-900">
        <div className="bg-white border border-neutral-200 rounded-3xl p-12 max-w-md w-full text-center shadow-xs">
          <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-500 border border-neutral-100">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-900 mb-2 font-display">Thank You!</h2>
          <p className="text-neutral-500">Your submission has been securely received.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-6 font-sans text-neutral-900">
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-neutral-200/60 rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-4 font-display tracking-tight">
            {schema.title}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {isDraftLoaded && (
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/60 rounded-lg px-3 py-1.5 shadow-xs">
                <span className="text-xs text-blue-700 font-medium">
                  📂 Draft restored from {lastSavedAt?.toLocaleTimeString()}
                </span>
              </div>
            )}

            {isCached && !error && (
              <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200/60 rounded-lg px-3 py-1.5 shadow-xs">
                <span className="text-xs text-yellow-700 font-medium">
                  📦 Offline mode (cached)
                </span>
              </div>
            )}

            {!isSubmitting && formData && Object.keys(formData).length > 0 && (
              <div className="inline-flex items-center gap-2 bg-neutral-50 border border-neutral-200/60 rounded-lg px-3 py-1.5 shadow-xs">
                {isAutoSaving ? (
                  <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-neutral-400"></div>
                    Saving...
                  </span>
                ) : lastSavedAt ? (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved {lastSavedAt.toLocaleTimeString()}
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-3 bg-yellow-50 border border-yellow-200/60 rounded-xl p-4 text-left">
              <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-yellow-700 leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {schema?.fields?.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label htmlFor={field.key} className="block text-sm font-semibold text-neutral-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                id={field.key}
                type={field.type || "text"}
                name={field.key}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                value={formData[field.key] || ""}
                onChange={handleChange}
                required={field.required}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed shadow-xs"
              />
            </div>
          ))}

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3.5 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Completing Service...</span>
                </>
              ) : (
                <span>Complete Service</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
