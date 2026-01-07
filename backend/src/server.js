/**
 * CivicFlow Backend Server
 *
 * Main entry point for the Express server
 * Handles server startup, graceful shutdown, and process signals
 *
 * Features:
 * - Environment configuration via dotenv
 * - Graceful shutdown on SIGTERM, SIGINT, and unhandled rejections
 * - Detailed startup logging
 * - Error handling for server initialization
 */

import dotenv from "dotenv";
import app from "./app.js";

// Load environment variables
dotenv.config();

// SERVER CONFIGURATION
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * Start the Express server
 * @returns {Promise<Server>} The HTTP server instance
 */
const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log("\n" + "=".repeat(50));
      console.log(`🚀 CivicFlow Server Started Successfully!`);
      console.log("=".repeat(50));
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log(`🌐 Port: ${PORT}`);
      console.log(`🔗 Local URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`📋 API Status: http://localhost:${PORT}/status`);
      console.log("=".repeat(50) + "\n");
    });

    return server;
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
};

// Start the server
const server = startServer();

// GRACEFUL SHUTDOWN HANDLERS

/**
 * Handle unhandled promise rejections
 * Logs the error and gracefully shuts down the server
 */
process.on("unhandledRejection", (err) => {
  console.error("\n" + "=".repeat(50));
  console.error("❌ UNHANDLED REJECTION! Shutting down...");
  console.error("=".repeat(50));
  console.error("Error Name:", err.name);
  console.error("Error Message:", err.message);
  console.error("Stack Trace:", err.stack);
  console.error("=".repeat(50) + "\n");

  server.then((srv) => {
    srv.close(() => {
      console.log("💥 Server closed due to unhandled rejection");
      process.exit(1);
    });
  });
});

/**
 * Handle SIGTERM signal (e.g., from process managers like PM2)
 * Gracefully shuts down the server
 */
process.on("SIGTERM", () => {
  console.log("\n👋 SIGTERM RECEIVED. Shutting down gracefully...");
  server.then((srv) => {
    srv.close(() => {
      console.log("✅ Server closed gracefully");
      console.log("💥 Process terminated!");
      process.exit(0);
    });
  });
});

/**
 * Handle SIGINT signal (Ctrl+C)
 * Gracefully shuts down the server
 */
process.on("SIGINT", () => {
  console.log("\n👋 SIGINT RECEIVED (Ctrl+C). Shutting down gracefully...");
  server.then((srv) => {
    srv.close(() => {
      console.log("✅ Server closed gracefully");
      console.log("💥 Goodbye!\n");
      process.exit(0);
    });
  });
});
