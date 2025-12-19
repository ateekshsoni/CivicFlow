import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

app.get("/forms", (req, res) => {
  try {
    const formsDirectory = path.join(process.cwd(), "src/schemas");

    // Read all files in the schemas directory
    const files = fs.readdirSync(formsDirectory);

    // Filter only .json files and read their contents
    const forms = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        try {
          const filePath = path.join(formsDirectory, file);
          const fileContent = fs.readFileSync(filePath, "utf-8");
          const formData = JSON.parse(fileContent);

          // Return essential metadata
          return {
            id: formData.id,
            title: formData.title,
            description: formData.description,
            fieldCount: formData.fields ? formData.fields.length : 0,
          };
        } catch (err) {
          console.error(`Error reading form ${file}:`, err.message);
          return null;
        }
      })
      .filter((form) => form !== null); // Remove any failed reads

    res.json({
      success: true,
      count: forms.length,
      forms: forms,
    });
  } catch (error) {
    console.error("Error reading forms directory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load forms",
    });
  }
});

app.get("/forms/:id", (req, res) => {
  const formId = req.params.id;

  try {
    console.log(`Fetching schema for form ID: ${formId}`);
    const schemaPath = path.join(
      process.cwd(),
      "src/schemas",
      `${formId}.json`
    );
    const schema = fs.readFileSync(schemaPath, "utf-8");
    res.json(JSON.parse(schema));
  } catch (error) {
    res.status(404).json({ message: "Form schema not found", formId });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/status", (req, res) => {
  res.status(200).json({ status: "Backend is running" });
});

app.get("/", (req, res) => {
  res.json({
    message: "CivicFlow API is running 🚀",
    version: "1.0.0",
    endpoints: {
      health: "/health",
    },
  });
});

// 404 Handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

export default app;
