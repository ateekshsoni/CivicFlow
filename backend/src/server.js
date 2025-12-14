import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

//SERVER CONFRIGRATION

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// START SERVER

const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running!`);
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log(`🌐 Port: ${PORT}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
    });
    return server;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const server = startServer();

// GRACEFUL SHUTDOWN

process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  server.then((srv) => {
    srv.close(() => {
      process.exit(1);
    });
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully...");
  server.then((srv) => {
    srv.close(() => {
      console.log("💥 Process terminated!");
    });
  });
});

// Handle Ctrl+C
process.on("SIGINT", () => {
  console.log("\n👋 SIGINT RECEIVED. Shutting down gracefully...");
  server.then((srv) => {
    srv.close(() => {
      console.log("💥 Server closed!");
      process.exit(0);
    });
  });
});
