import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { getUserId } from "./utils/userId";

// Initialize user ID on app load
// This ensures every user has a unique anonymous ID
// for tracking their submissions and providing personalized features
const userId = getUserId();
console.log("🚀 CivicFlow initialized with user ID:", userId);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
