import { openDB } from "idb";

export const dbPromise = openDB("civicflow-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("forms")) {
      db.createObjectStore("forms");
    }
  },
});
