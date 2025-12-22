import axios from "axios";
import { dbPromise } from "../db/db";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Delay utility for retry logic
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Resolves after delay
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Validate schema structure
 * @param {Object} schema - The schema object to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidSchema = (schema) => {
  return (
    schema &&
    typeof schema === "object" &&
    schema.id &&
    schema.title &&
    Array.isArray(schema.fields)
  );
};

/**
 * Get user-friendly error messages based on error type
 * @param {Error} err - The error object
 * @returns {string} - User-friendly error message
 */
const getErrorMessage = (err) => {
  if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
    return "Request timeout. Please check your connection.";
  }
  if (err.response?.status === 404) {
    return "Form not found.";
  }
  if (err.response?.status >= 500) {
    return "Server error. Please try again later.";
  }
  if (!navigator.onLine) {
    return "You are offline. Please check your internet connection.";
  }
  return "Unable to load form. Please try again.";
};

/**
 * Fetch schema from backend with retry logic
 * @param {string} formId - The form ID to fetch
 * @param {number} retryCount - Current retry attempt (internal use)
 * @returns {Object} - Schema data or cached response
 * @throws {Error} - If all retries fail
 */
export async function fetchSchemaFromBackend(formId, retryCount = 0) {
  try {
    // Validate input
    if (!formId || typeof formId !== "string") {
      throw new Error("Invalid form ID");
    }

    console.log(
      `📡 Fetching schema for form: ${formId} (Attempt ${retryCount + 1}/${
        MAX_RETRIES + 1
      })`
    );

    const res = await axios.get(`${API_BASE_URL}/forms/${formId}`, {
      timeout: 10000, // 10 second timeout
    });

    // Validate response
    if (!isValidSchema(res.data)) {
      throw new Error("Invalid schema format received from server");
    }

    console.log(`✅ Schema loaded successfully: ${formId}`);
    return res.data;
  } catch (err) {
    console.error(`❌ Fetch attempt ${retryCount + 1} failed:`, err.message);

    // First error: check cache before retrying
    if (retryCount === 0) {
      try {
        const cachedSchema = await getSchemaFromCache(formId);
        if (cachedSchema && isValidSchema(cachedSchema)) {
          console.log("📦 Using cached schema due to fetch error");
          return { data: cachedSchema, fromCache: true };
        }
      } catch (cacheErr) {
        console.log("⚠️ No cached schema available, will retry");
      }
    }

    // If no cache or subsequent retries, proceed with retry logic
    if (retryCount < MAX_RETRIES) {
      const retryDelay = RETRY_DELAY * (retryCount + 1); // exponential backoff
      console.log(`🔄 Retrying in ${retryDelay}ms...`);
      await delay(retryDelay);
      return fetchSchemaFromBackend(formId, retryCount + 1);
    }

    // All retries exhausted
    throw err;
  }
}

/**
 * Save schema to IndexedDB cache
 * @param {Object} schema - The schema object to cache
 * @returns {boolean} - True if cached successfully, false otherwise
 */
export async function saveSchemaToCache(schema) {
  try {
    // Validate before caching
    if (!isValidSchema(schema)) {
      console.warn("⚠️ Invalid schema, skipping cache");
      return false;
    }

    const db = await dbPromise;
    await db.put("schemas", schema, schema.id);

    console.log(`💾 Schema cached successfully: ${schema.id}`);
    return true;
  } catch (err) {
    console.error("❌ Failed to cache schema:", err);
    // Don't throw - caching failure shouldn't break the app
    return false;
  }
}

/**
 * Get schema from IndexedDB cache
 * @param {string} formId - The form ID to retrieve
 * @returns {Object|null} - Cached schema or null if not found
 */
export async function getSchemaFromCache(formId) {
  try {
    // Validate input
    if (!formId || typeof formId !== "string") {
      throw new Error("Invalid form ID");
    }

    const db = await dbPromise;
    const schema = await db.get("schemas", formId);

    if (!schema) {
      throw new Error(`No cached schema found for: ${formId}`);
    }

    // Validate cached data
    if (!isValidSchema(schema)) {
      throw new Error("Cached schema is corrupted");
    }

    console.log(`📦 Retrieved cached schema: ${formId}`);
    return schema;
  } catch (err) {
    console.error("❌ Failed to get schema from cache:", err.message);
    throw err;
  }
}

/**
 * Get form schema with offline support and retry logic
 * Main entry point for loading form schemas
 *
 * @param {string} formId - The form ID to load
 * @returns {Object} - { success: boolean, data: Object, message: string, cached: boolean }
 */
export async function getFormSchema(formId) {
  try {
    // Validate input
    if (!formId || typeof formId !== "string") {
      return {
        success: false,
        data: null,
        message: "Invalid form ID provided",
      };
    }

    // Check if online
    if (navigator.onLine) {
      try {
        const result = await fetchSchemaFromBackend(formId);

        // Handle cached response from retry logic
        if (result.fromCache) {
          return {
            success: true,
            data: result.data,
            message: "Loaded from cache (backend unavailable)",
            cached: true,
          };
        }

        // Fresh data from server - cache it
        await saveSchemaToCache(result);

        return {
          success: true,
          data: result,
          message: "Schema loaded successfully",
          cached: false,
        };
      } catch (err) {
        console.error("❌ Failed to fetch schema:", err.message);

        // Final fallback to cache
        try {
          const cachedSchema = await getSchemaFromCache(formId);
          return {
            success: true,
            data: cachedSchema,
            message: "Loaded from cache (server unavailable)",
            cached: true,
          };
        } catch (cacheErr) {
          console.error("❌ Cache fallback failed:", cacheErr.message);
        }

        return {
          success: false,
          data: null,
          message: getErrorMessage(err),
        };
      }
    } else {
      // Offline mode - only use cache
      console.log("📴 Offline mode detected");

      try {
        const cachedSchema = await getSchemaFromCache(formId);
        return {
          success: true,
          data: cachedSchema,
          message: "Offline mode - loaded from cache",
          cached: true,
        };
      } catch (err) {
        console.error("❌ Failed to retrieve schema from cache:", err.message);
        return {
          success: false,
          data: null,
          message: "No cached data available for offline use",
        };
      }
    }
  } catch (err) {
    console.error("❌ Unexpected error in getFormSchema:", err);
    return {
      success: false,
      data: null,
      message: "An unexpected error occurred",
    };
  }
}

/**
 * Clear a specific schema from cache
 * @param {string} formId - The form ID to clear
 * @returns {boolean} - True if cleared successfully
 */
export async function clearSchemaCache(formId) {
  try {
    if (!formId || typeof formId !== "string") {
      console.error("❌ Invalid form ID");
      return false;
    }

    const db = await dbPromise;
    await db.delete("schemas", formId);

    console.log(`🗑️ Schema cache cleared: ${formId}`);
    return true;
  } catch (err) {
    console.error("❌ Failed to clear schema cache:", err);
    return false;
  }
}

/**
 * Clear all schemas from cache
 * @returns {boolean} - True if cleared successfully
 */
export async function clearAllSchemasCache() {
  try {
    const db = await dbPromise;
    await db.clear("schemas");

    console.log("🗑️ All schemas cache cleared");
    return true;
  } catch (err) {
    console.error("❌ Failed to clear all schemas cache:", err);
    return false;
  }
}
