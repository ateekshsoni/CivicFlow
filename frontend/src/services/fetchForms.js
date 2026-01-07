import axios from "axios";
import { dbPromise } from "../db/db";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const FORMS_CACHE_KEY = "__forms_list__";

/**
 * Validate forms list response structure
 * @param {Object} data - The response data from backend
 * @returns {boolean} - True if valid, false otherwise
 */

const isValidFormsResponse = (data) => {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.forms) &&
    typeof data.count === "number"
  );
};

/**
 * Get all available forms from backend with caching
 * Automatically caches successful responses for offline access
 * Falls back to cache if backend is unavailable
 *
 * @returns {Object} - { success: boolean, data: Object, message: string, cached: boolean }
 */
export const getAllAvailableForms = async () => {
  try {
    console.log("📡 Fetching all available forms from backend...");

    // Fetch from backend
    const response = await axios.get(`${API_BASE_URL}/forms`, {
      timeout: 10000, // 10 second timeout
    });

    // Validate response structure
    if (!isValidFormsResponse(response.data)) {
      throw new Error("Invalid forms response format from server");
    }

    const data = response.data;

    // Cache the response for offline access
    await saveFormsToCache(data);

    console.log(`✅ Retrieved ${data.count} forms from backend`);

    return {
      success: true,
      data: data,
      message: "Forms loaded successfully",
      cached: false,
    };
  } catch (err) {
    console.error("❌ Failed to fetch forms from backend:", err.message);

    // Try to load from cache as fallback
    try {
      const cachedForms = await getFormsFromCache();

      console.log(`📦 Retrieved ${cachedForms.count} forms from cache`);

      return {
        success: true,
        data: cachedForms,
        message: "Loaded from cache (backend unavailable)",
        cached: true,
      };
    } catch (cacheErr) {
      console.error("❌ Cache fallback failed:", cacheErr.message);

      // Both backend and cache failed
      return {
        success: false,
        data: null,
        message: "Unable to load forms. Please check your connection.",
        error: err.message,
      };
    }
  }
};

/**
 * Save forms list to IndexedDB cache
 * @param {Object} forms - The forms data to cache
 * @returns {boolean} - True if cached successfully, false otherwise
 */
export const saveFormsToCache = async (forms) => {
  try {
    // Validate before caching
    if (!isValidFormsResponse(forms)) {
      console.warn("⚠️ Invalid forms data, skipping cache");
      return false;
    }

    const db = await dbPromise;
    await db.put("forms", forms, FORMS_CACHE_KEY);

    console.log(`💾 Cached ${forms.count} forms successfully`);
    return true;
  } catch (err) {
    console.error("❌ Failed to cache forms:", err);
    // Don't throw - caching failure shouldn't break the app
    return false;
  }
};

/**
 * Get forms list from IndexedDB cache
 * @returns {Object} - Cached forms data
 * @throws {Error} - If no forms found in cache
 */
export const getFormsFromCache = async () => {
  try {
    const db = await dbPromise;
    const forms = await db.get("forms", FORMS_CACHE_KEY);

    if (!forms) {
      throw new Error("No forms found in cache");
    }

    // Validate cached data
    if (!isValidFormsResponse(forms)) {
      throw new Error("Cached forms data is corrupted");
    }

    console.log(`📦 Loaded ${forms.count} forms from cache`);
    return forms;
  } catch (err) {
    console.error("❌ Failed to get forms from cache:", err.message);
    throw err;
  }
};

/**
 * Clear forms cache
 * @returns {boolean} - True if cleared successfully
 */
export const clearFormsCache = async () => {
  try {
    const db = await dbPromise;
    await db.delete("forms", FORMS_CACHE_KEY);
    console.log("🗑️ Forms cache cleared");
    return true;
  } catch (err) {
    console.error("❌ Failed to clear forms cache:", err);
    return false;
  }
};
