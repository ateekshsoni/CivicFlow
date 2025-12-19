import { openDB } from "idb";

export const dbPromise = openDB("civicflow-db", 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("schemas")) {
      db.createObjectStore("schemas");
    }
    if (!db.objectStoreNames.contains("forms")) {
      db.createObjectStore("forms");
    }
    if (!db.objectStoreNames.contains("submissions")) {
      db.createObjectStore("submissions", {
        keyPath: "id",
        autoIncrement: true,
      });
    }
  },
});
