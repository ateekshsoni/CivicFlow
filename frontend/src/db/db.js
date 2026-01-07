import { openDB } from "idb";

export const dbPromise = openDB("civicflow-db", 4, {
  upgrade(db, oldVersion) {
    // Create schemas store if it doesn't exist
    if (!db.objectStoreNames.contains("schemas")) {
      db.createObjectStore("schemas");
    }

    // Create forms store if it doesn't exist
    if (!db.objectStoreNames.contains("forms")) {
      db.createObjectStore("forms");
    }

    // Handle submissions store - no keyPath, we provide keys manually
    if (oldVersion < 4) {
      // Delete old submissions store if it exists
      if (db.objectStoreNames.contains("submissions")) {
        db.deleteObjectStore("submissions");
      }
      // Create new submissions store without keyPath (keys provided manually)
      db.createObjectStore("submissions");
    }
  },
});
