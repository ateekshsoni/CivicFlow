import { openDB } from "idb";

export const dbPromise = openDB("civicflow-db", 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("schemas")) {
      db.createObjectStore("schemas");
    }
  },
});
