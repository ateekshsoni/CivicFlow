import axios from "axios";
import { dbPromise } from "../db/db";

export const getAllAvailableForms = async () => {
  try {
    console.log("Fetching all available forms from backend...");
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/forms`);
    const data = response.data;
    await saveFormsToCache(data);
    return data;
  } catch (err) {
    console.error("Failed to fetch forms:", err);
    try {
      const cachedForms = await getFormsFromCache();
      return cachedForms;
    } catch (cacheErr) {
      console.error("Failed to fetch forms from cache:", cacheErr);
    }
    throw err;
  }
};

export const saveFormsToCache = async (forms) => {
  try {
    const db = await dbPromise;
    await db.put("forms", forms, "__forms_list__");
    console.log("Forms cached successfully");
  } catch (err) {
    console.error("Failed to cache forms:", err);
  }
};

export const getFormsFromCache = async () => {
  const db = await dbPromise;
  const forms = await db.get("forms", "__forms_list__");
  if (!forms) {
    throw new Error("No forms found in cache");
  }
  console.log("Fetched forms from cache:", forms);
  return forms;
};
