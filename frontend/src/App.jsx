import axios from "axios";
import { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import SampleForm from "./components/SampleForm";
const App = () => {
  const [backendStatus, setbackendStatus] = useState("");
  const checkBackendStatus = async () => {
    try {
      let response = await axios.get("http://localhost:4000/status", {
        withCredentials: true,
      });
      if (response.status === 200) {
        setbackendStatus("connected");
      }
    } catch (error) {
      console.error("Error fetching backend status:", error);
      console.log("Backend is not running or unreachable.");
      setbackendStatus("disconnected");
    }
  };
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <h1>Welcome to CivicFlow Frontend</h1>
              <p>Check Backend Status</p>
              <button onClick={checkBackendStatus}>Check</button>
              {backendStatus === "connected" && (
                <p>Backend Status: {backendStatus}</p>
              )}
              {backendStatus === "disconnected" && (
                <p>Backend Status: {backendStatus}</p>
              )}

              <button>
                <Link to="/sample-form"> Basic Form</Link>
              </button>
            </div>
          }
        />
        <Route path="/sample-form" element={<SampleForm />} />
      </Routes>
    </>
  );
};

export default App;
