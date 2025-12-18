import axios from "axios";
import { dbPromise } from "../db/db";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Validate schema structure
const isValidSchema = (schema) => {
  return schema && typeof schema === "object" && schema.id && schema.title;
};

export async function fetchSchemaFromBackend(formId, retryCount = 0) {
  try {
    const res = await axios.get(`${API_BASE_URL}/forms/${formId}`, {
      timeout: 10000, // 10 second timeout
    });

    // Validate response
    if (!isValidSchema(res.data)) {
      throw new Error("Invalid schema format received from server");
    }

    return res.data;
  } catch (err) {
    // First error: check cache before retrying
    if (retryCount === 0) {
      try {
        const cachedSchema = await getSchemaFromCache(formId);
        if (cachedSchema && isValidSchema(cachedSchema)) {
          console.log("Using cached schema due to fetch error:", err.message);
          return { data: cachedSchema, fromCache: true };
        }
      } catch (cacheErr) {
        console.log(cacheErr.message);
        console.log("No cached schema available, will retry");
      }
    }

    // If no cache or subsequent retries, proceed with retry logic
    if (retryCount < MAX_RETRIES) {
      console.log(
        `Retrying... Attempt ${retryCount + 1}/${MAX_RETRIES}`,
        err.message
      );
      await delay(RETRY_DELAY * (retryCount + 1)); // exponential backoff
      return fetchSchemaFromBackend(formId, retryCount + 1);
    }
    throw err;
  }
}

export async function saveSchemaToCache(schema) {
  try {
    const db = await dbPromise;
    await db.put("schemas", schema, schema.id);
    console.log(`Schema ${schema.id} cached successfully`);
  } catch (err) {
    console.error("Failed to cache schema:", err);
    // Don't throw - caching failure shouldn't break the app
  }
}

export async function getSchemaFromCache(formId) {
  const db = await dbPromise;
  return db.get("schemas", formId);
}

// User-friendly error messages
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
  return "Unable to load form. Please try again.";
};

export async function getFormSchema(formId) {
  if (navigator.onLine) {
    try {
      const result = await fetchSchemaFromBackend(formId);

      // Handle cached response
      if (result.fromCache) {
        return {
          success: true,
          data: result.data,
          message: "Loaded from cache",
          cached: true,
        };
      }

      // Fresh data from server
      await saveSchemaToCache(result);
      return { success: true, data: result, cached: false };
    } catch (err) {
      console.error("Failed to fetch schema:", err);

      // Final fallback to cache
      try {
        const cachedSchema = await getSchemaFromCache(formId);
        if (cachedSchema && isValidSchema(cachedSchema)) {
          return {
            success: true,
            data: cachedSchema,
            message: "Loaded from cache (server unavailable)",
            cached: true,
          };
        }
      } catch (cacheErr) {
        console.error("Cache fallback failed:", cacheErr);
      }

      return {
        success: false,
        data: null,
        message: getErrorMessage(err),
      };
    }
  } else {
    // Offline mode
    try {
      const cachedSchema = await getSchemaFromCache(formId);
      if (cachedSchema && isValidSchema(cachedSchema)) {
        return {
          success: true,
          data: cachedSchema,
          message: "Offline mode",
          cached: true,
        };
      }
      return {
        success: false,
        data: null,
        message: "No cached data available for offline use",
      };
    } catch (err) {
      console.error("Failed to retrieve schema from cache:", err);
      return {
        success: false,
        data: null,
        message: "Unable to access cached data",
      };
    }
  }
}
