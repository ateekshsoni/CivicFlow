import { useEffect, useRef, useState } from "react";
import { dbPromise } from "../db/db";

const SampleForm = () => {
  const saveTimerRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    async function fetchFormData() {
      const db = await dbPromise;
      const savedData = await db.get("forms", "sampleFormData");
      if (savedData) {
        setFormData(savedData);
        console.log("Loaded form data from IndexedDB:", savedData);
      }
    }
    fetchFormData();
  }, []);

  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(async () => {
      const db = await dbPromise;
      await db.put("forms", formData, "sampleFormData");
      console.log("Form data saved to IndexedDB:", formData);
    }, 500);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert(`Form submitted:\nName: ${formData.name}\nEmail: ${formData.email}`);
    // Handle form submission logic here
    setFormData({
      name: "",
      email: "",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-6 font-sans text-neutral-900">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-neutral-200/60 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h2 className="text-3xl font-extrabold text-neutral-900 mb-6 text-center font-display tracking-tight">
          Sample Form
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-semibold text-neutral-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 shadow-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-neutral-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 shadow-xs"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-3.5 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-xs"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SampleForm;
