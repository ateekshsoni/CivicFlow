/**
 * CivicFlow Express Application
 *
 * Main Express app configuration with routes and middleware
 *
 * Features:
 * - CORS configuration for frontend communication
 * - JSON and URL-encoded body parsing
 * - Request logging in development mode
 * - RESTful API endpoints for forms management
 * - Health check and status endpoints
 * - 404 and error handling middleware
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

const app = express();

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV || "development";

// MIDDLEWARE CONFIGURATION

/**
 * CORS middleware
 * Allows frontend to communicate with backend
 */
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Log CORS configuration on startup
console.log(`🔒 CORS enabled for origin: ${FRONTEND_URL}`);

/**
 * Request logging middleware (development only)
 * Logs all incoming requests
 */
if (NODE_ENV !== "production") {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });
}

// API ROUTES

/**
 * GET /forms
 *
 * Retrieve all available form schemas
 * Returns metadata for each form (id, title, description, field count)
 *
 * @returns {Object} JSON response with success flag, count, and forms array
 * @example
 * {
 *   "success": true,
 *   "count": 5,
 *   "forms": [
 *     {
 *       "id": "scholarship-application",
 *       "title": "Scholarship Application",
 *       "description": "Apply for scholarships",
 *       "fieldCount": 5
 *     }
 *   ]
 * }
 */
app.get("/forms", (req, res) => {
  try {
    const formsDirectory = path.join(process.cwd(), "src/schemas");

    // Check if schemas directory exists
    if (!fs.existsSync(formsDirectory)) {
      console.error("❌ Schemas directory not found:", formsDirectory);
      return res.status(500).json({
        success: false,
        message: "Forms directory not configured",
      });
    }

    // Read all files in the schemas directory
    const files = fs.readdirSync(formsDirectory);
    console.log(`📂 Found ${files.length} file(s) in schemas directory`);

    // Filter only .json files and read their contents
    const forms = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        try {
          const filePath = path.join(formsDirectory, file);
          const fileContent = fs.readFileSync(filePath, "utf-8");
          const formData = JSON.parse(fileContent);

          // Validate required fields
          if (!formData.id || !formData.title) {
            console.warn(
              `⚠️ Form ${file} missing required fields (id or title)`
            );
            return null;
          }

          // Return essential metadata
          return {
            id: formData.id,
            title: formData.title,
            description: formData.description || "",
            fieldCount: formData.fields?.length || 0,
          };
        } catch (err) {
          console.error(`❌ Error reading form ${file}:`, err.message);
          return null;
        }
      })
      .filter((form) => form !== null); // Remove any failed reads

    console.log(`✅ Successfully loaded ${forms.length} form(s)`);

    res.json({
      success: true,
      count: forms.length,
      forms: forms,
    });
  } catch (error) {
    console.error("❌ Error reading forms directory:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to load forms",
      error: NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /forms/:id
 *
 * Retrieve a specific form schema by ID
 *
 * @param {string} id - The form ID (e.g., "scholarship-application")
 * @returns {Object} JSON schema for the form
 * @example
 * GET /forms/scholarship-application
 * Returns the complete schema with fields, validation rules, etc.
 */
app.get("/forms/:id", (req, res) => {
  const formId = req.params.id;

  // Validate form ID
  if (!formId || formId.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Form ID is required",
    });
  }

  // Sanitize form ID (prevent directory traversal)
  const sanitizedFormId = formId.replace(/[^a-zA-Z0-9-_]/g, "");
  if (sanitizedFormId !== formId) {
    console.warn(`⚠️ Invalid characters in form ID: ${formId}`);
    return res.status(400).json({
      success: false,
      message: "Invalid form ID format",
    });
  }

  try {
    console.log(`📋 Fetching schema for form ID: ${formId}`);
    const schemaPath = path.join(
      process.cwd(),
      "src/schemas",
      `${formId}.json`
    );

    // Check if file exists
    if (!fs.existsSync(schemaPath)) {
      console.warn(`⚠️ Form schema not found: ${formId}`);
      return res.status(404).json({
        success: false,
        message: "Form schema not found",
        formId: formId,
      });
    }

    const schema = fs.readFileSync(schemaPath, "utf-8");
    const parsedSchema = JSON.parse(schema);

    // Validate schema structure
    if (!parsedSchema.id || !parsedSchema.title || !parsedSchema.fields) {
      console.error(`❌ Invalid schema structure for form: ${formId}`);
      return res.status(500).json({
        success: false,
        message: "Invalid form schema structure",
      });
    }

    console.log(`✅ Schema loaded successfully: ${formId}`);
    res.json(parsedSchema);
  } catch (error) {
    console.error(`❌ Error loading form ${formId}:`, error.message);

    // Handle JSON parse errors specifically
    if (error instanceof SyntaxError) {
      return res.status(500).json({
        success: false,
        message: "Invalid JSON in form schema",
        formId: formId,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to load form schema",
      formId: formId,
      error: NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /health
 *
 * Health check endpoint for monitoring
 * Returns server health status, uptime, and environment info
 *
 * @returns {Object} Health status information
 */
app.get("/health", (req, res) => {
  const uptimeSeconds = process.uptime();
  const uptimeFormatted = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor(
    (uptimeSeconds % 3600) / 60
  )}m ${Math.floor(uptimeSeconds % 60)}s`;

  res.status(200).json({
    status: "healthy",
    message: "Server is running normally",
    timestamp: new Date().toISOString(),
    uptime: uptimeFormatted,
    uptimeSeconds: Math.floor(uptimeSeconds),
    environment: NODE_ENV,
    node: process.version,
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
    },
  });
});

/**
 * GET /status
 *
 * Simple status check endpoint
 * Used by frontend to verify backend connectivity
 *
 * @returns {Object} Simple status message
 */
app.get("/status", (req, res) => {
  res.status(200).json({
    status: "online",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/sync-submissions
 *
 * Sync form submissions from frontend to backend
 * Stores submissions as JSON files organized by month
 * Implements idempotency to prevent duplicate submissions
 *
 * @param {Array} submissions - Array of submission objects from frontend
 * @returns {Object} Sync results with success/failure details
 *
 * @example Request body:
 * {
 *   "submissions": [
 *     {
 *       "submissionId": "birth-certificate-1703155200000-a7b3c2",
 *       "userId": "uuid-here",
 *       "formId": "birth-certificate",
 *       "formData": { ... },
 *       "status": "complete",
 *       "synced": "pending",
 *       "submittedAt": "2025-12-22T10:30:00Z"
 *     }
 *   ]
 * }
 *
 * @example Success response:
 * {
 *   "success": true,
 *   "message": "5 of 5 submissions synced successfully",
 *   "syncedCount": 5,
 *   "syncedIds": ["id1", "id2", ...]
 * }
 */
app.post("/api/sync-submissions", (req, res) => {
  try {
    const { submissions } = req.body;

    // Validation
    if (!submissions) {
      return res.status(400).json({
        success: false,
        message: "Missing 'submissions' field in request body",
      });
    }

    if (!Array.isArray(submissions)) {
      return res.status(400).json({
        success: false,
        message: "'submissions' must be an array",
      });
    }

    if (submissions.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No submissions to sync",
        syncedCount: 0,
        syncedIds: [],
      });
    }

    // Process submissions
    const syncedIds = [];
    const failedSyncs = [];

    for (const submission of submissions) {
      try {
        // Validate required fields
        if (!submission.submissionId || !submission.formId) {
          throw new Error("Missing required fields: submissionId or formId");
        }

        // Sanitize submission ID (prevent path traversal)
        const sanitizedId = submission.submissionId.replace(
          /[^a-zA-Z0-9-]/g,
          ""
        );

        // Create directory structure: submissions/YYYY-MM/
        const date = new Date(submission.submittedAt || new Date());
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const yearMonth = `${year}-${month}`;

        const submissionsDir = path.join(process.cwd(), "src/submissions");
        const monthDir = path.join(submissionsDir, yearMonth);

        // Create directories if they don't exist
        if (!fs.existsSync(submissionsDir)) {
          fs.mkdirSync(submissionsDir, { recursive: true });
        }
        if (!fs.existsSync(monthDir)) {
          fs.mkdirSync(monthDir, { recursive: true });
        }

        // File path
        const filename = `${sanitizedId}.json`;
        const filepath = path.join(monthDir, filename);

        // Idempotency check - if file exists, consider it already synced
        if (fs.existsSync(filepath)) {
          console.log(`⚠️ Submission already exists: ${sanitizedId}`);
          syncedIds.push(submission.submissionId);
          continue;
        }

        // Prepare submission data with server timestamp
        const submissionData = {
          ...submission,
          syncedAt: new Date().toISOString(),
          synced: "synced", // Update sync status
        };

        // Write submission to file
        fs.writeFileSync(
          filepath,
          JSON.stringify(submissionData, null, 2),
          "utf-8"
        );

        syncedIds.push(submission.submissionId);
        console.log(`✅ Saved submission: ${sanitizedId}`);
      } catch (err) {
        console.error(
          `❌ Failed to save submission ${submission.submissionId}:`,
          err.message
        );

        failedSyncs.push({
          submissionId: submission.submissionId,
          error: err.message,
          canRetry: true,
        });
      }
    }

    // Build response
    const syncedCount = syncedIds.length;
    const failedCount = failedSyncs.length;
    const totalCount = submissions.length;

    const response = {
      success: failedCount === 0,
      message:
        failedCount === 0
          ? `${syncedCount} of ${totalCount} submissions synced successfully`
          : `${syncedCount} of ${totalCount} submissions synced, ${failedCount} failed`,
      syncedCount,
      failedCount,
      syncedIds,
      timestamp: new Date().toISOString(),
    };

    // Only include failedSyncs if there are failures
    if (failedCount > 0) {
      response.failedSyncs = failedSyncs;
    }

    // Log summary
    console.log(
      `📊 Sync summary: ${syncedCount} success, ${failedCount} failed`
    );

    res.status(200).json(response);
  } catch (err) {
    console.error("❌ Sync endpoint error:", err);

    res.status(500).json({
      success: false,
      message: "Internal server error during sync",
      error: NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

/**
 * GET /ping
 *
 * Lightweight keep-alive endpoint
 * Used to prevent Render free tier from spinning down
 * Returns minimal response for efficiency
 *
 * @returns {Object} Simple pong response
 */
app.get("/ping", (req, res) => {
  res.status(200).json({ pong: true, timestamp: Date.now() });
});

/**
 * GET /
 *
 * Root endpoint - API information and available endpoints
 *
 * @returns {Object} API welcome message and endpoint list
 */
app.get("/", (req, res) => {
  res.json({
    message: "CivicFlow API is running 🚀",
    version: "1.0.0",
    description: "Civic engagement platform backend API",
    endpoints: {
      health: "/health - Health check with detailed system information",
      status: "/status - Simple connectivity check",
      forms: "/forms - List all available forms",
      formById: "/forms/:id - Get specific form schema",
      syncSubmissions:
        "/api/sync-submissions - Sync form submissions from frontend",
    },
    documentation: "https://github.com/ateekshsoni/civicflow",
  });
});

// ERROR HANDLING MIDDLEWARE

/**
 * 404 Handler - Route not found
 * Catches all requests to undefined routes
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
app.use((req, res) => {
  console.warn(`⚠️ 404 - Route not found: ${req.method} ${req.path}`);

  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
    method: req.method,
    availableEndpoints: [
      "/",
      "/health",
      "/status",
      "/forms",
      "/forms/:id",
      "/api/sync-submissions",
    ],
  });
});

/**
 * Global Error Handler
 * Catches all unhandled errors in the application
 *
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
app.use((err, req, res, next) => {
  console.error("=".repeat(50));
  console.error("❌ Unhandled Error:");
  console.error("=".repeat(50));
  console.error("Error Message:", err.message);
  console.error("Request URL:", req.url);
  console.error("Request Method:", req.method);
  console.error("Stack Trace:", err.stack);
  console.error("=".repeat(50));

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error" : err.message,
    path: req.path,
    error:
      NODE_ENV === "development"
        ? {
            message: err.message,
            stack: err.stack,
          }
        : undefined,
  });
});

// KEEP-ALIVE MECHANISM FOR RENDER FREE TIER

/**
 * Self-ping to prevent Render free tier spin-down
 * Render free tier spins down after 15 minutes of inactivity
 * This pings the server every 14 minutes to keep it alive
 *
 * Note: Only runs if RENDER_SERVICE_NAME environment variable is set
 * This prevents the mechanism from running in local development
 */
if (process.env.RENDER || process.env.RENDER_SERVICE_NAME) {
  const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds
  const SERVICE_URL =
    process.env.RENDER_EXTERNAL_URL || process.env.SERVICE_URL;

  if (SERVICE_URL) {
    setInterval(async () => {
      try {
        const response = await fetch(`${SERVICE_URL}/ping`);
        if (response.ok) {
          console.log(
            `✅ Keep-alive ping successful at ${new Date().toISOString()}`
          );
        } else {
          console.warn(
            `⚠️ Keep-alive ping returned status: ${response.status}`
          );
        }
      } catch (error) {
        console.error(`❌ Keep-alive ping failed:`, error.message);
      }
    }, PING_INTERVAL);

    console.log(`🔄 Keep-alive mechanism enabled (ping every 14 minutes)`);
    console.log(`📍 Target URL: ${SERVICE_URL}/ping`);
  } else {
    console.warn(
      `⚠️ Keep-alive enabled but SERVICE_URL not found. Set RENDER_EXTERNAL_URL environment variable.`
    );
  }
}

export default app;
