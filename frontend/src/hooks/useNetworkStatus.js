/**
 * Network Status Hook
 *
 * Provides real-time online/offline status for React components.
 * Listens to browser network events and updates state accordingly.
 *
 * For Microsoft Imagine Cup demo: Shows reliability and UX focus
 *
 * @returns {Object} Network status
 * @returns {boolean} isOnline - Current network status
 * @returns {number} lastOnlineAt - Timestamp when last went online
 * @returns {number} lastOfflineAt - Timestamp when last went offline
 *
 * @example
 * function MyComponent() {
 *   const { isOnline } = useNetworkStatus();
 *   return <div>{isOnline ? 'Connected' : 'Offline'}</div>;
 * }
 */

import { useState, useEffect } from "react";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnlineAt, setLastOnlineAt] = useState(Date.now());
  const [lastOfflineAt, setLastOfflineAt] = useState(null);

  useEffect(() => {
    // Handler for when user goes online
    const handleOnline = () => {
      console.log("🟢 Network: Online");
      setIsOnline(true);
      setLastOnlineAt(Date.now());
    };

    // Handler for when user goes offline
    const handleOffline = () => {
      console.log("🔴 Network: Offline");
      setIsOnline(false);
      setLastOfflineAt(Date.now());
    };

    // Register event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, lastOnlineAt, lastOfflineAt };
};
