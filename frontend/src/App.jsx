import { Link, Route, Routes } from "react-router-dom";
import SampleForm from "./components/SampleForm";
import ServiceForm from "./components/ServiceForm";
import HomePage from "./pages/HomePage";
import ServiceForms from "./pages/ServiceForms";
import UserSubmissions from "./pages/UserSubmissions";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sample-form" element={<SampleForm />} />
        <Route path="/service-forms" element={<ServiceForms />} />
        <Route path="/forms/:formId" element={<ServiceForm />} />
        <Route path="/user-submissions" element={<UserSubmissions />} />
      </Routes>
    </>
  );
};

export default App;
