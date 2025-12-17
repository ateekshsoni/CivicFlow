import { Link, Route, Routes } from "react-router-dom";
import SampleForm from "./components/SampleForm";
import ServiceForm from "./components/ServiceForm";
import HomePage from "./pages/HomePage";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sample-form" element={<SampleForm />} />
        <Route path="/sample-service-form" element={<ServiceForm />} />
      </Routes>
    </>
  );
};

export default App;
