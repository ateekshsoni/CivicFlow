import axios from "axios";
import { dbPromise } from "../db/db";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchSchemaFromBackend(formId, retryCount = 0) {
  try {
    const res = await axios.get(`http://localhost:4000/forms/${formId}`, {
      timeout: 10000, // 10 second timeout
    });
    return res.data;
  } catch (err) {
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
  const db = await dbPromise;
  await db.put("schemas", schema, schema.id);
}

export async function getSchemaFromCache(formId) {
  const db = await dbPromise;
  return db.get("schemas", formId);
}

export async function getFormSchema(formId) {
  if (navigator.onLine) {
    try {
      const schema = await fetchSchemaFromBackend(formId);
      await saveSchemaToCache(schema);
      return { success: true, data: schema };
    } catch (err) {
      console.error(
        "Failed to fetch schema after retries, falling back to cache:",
        err
      );
      try {
        const cachedSchema = await getSchemaFromCache(formId);
        if (cachedSchema) {
          return {
            success: false,
            data: cachedSchema,
            message: "Using cached data",
          };
        }
        return { success: false, data: null, message: err.message };
      } catch (cacheErr) {
        console.error("Failed to retrieve schema from cache:", cacheErr);
        return { success: false, data: null, message: err.message };
      }
    }
  } else {
    try {
      const cachedSchema = await getSchemaFromCache(formId);
      return { success: false, data: cachedSchema, message: "Offline mode" };
    } catch (err) {
      console.error("Failed to retrieve schema from cache:", err);
      return {
        success: false,
        data: null,
        message: "No cached data available",
      };
    }
  }
}
