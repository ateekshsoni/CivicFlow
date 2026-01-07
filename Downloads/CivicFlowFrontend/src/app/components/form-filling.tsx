import { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, Check } from 'lucide-react';
import type { Screen } from '../App';
import type { Service, FormData } from '../App';

interface FormFillingProps {
  onNavigate: (screen: Screen, serviceId?: string) => void;
  onSubmit: (data: FormData) => void;
  initialData: FormData;
  service: Service | null;
}

export function FormFilling({ onNavigate, onSubmit, initialData, service }: FormFillingProps) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [savedFields, setSavedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Auto-save fields
    const timer = setTimeout(() => {
      // Mark non-empty fields as saved
      const saved = new Set<string>();
      if (formData.fullName) saved.add('fullName');
      if (formData.ssn) saved.add('ssn');
      if (formData.dob) saved.add('dob');
      if (formData.phone) saved.add('phone');
      setSavedFields(saved);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <button 
            onClick={() => onNavigate('services')}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="font-bold text-gray-900 text-sm sm:text-base">
              {service?.title || 'Business Permit Renewal'}
            </h1>
          </div>
          <div className="w-5 sm:w-6"></div>
        </div>
        <div className="text-center">
          <span className="text-xs font-medium text-gray-500">OFFLINE MODE</span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <div className="flex-1 flex gap-1">
            <div className="h-1 bg-blue-600 rounded-full flex-1"></div>
            <div className="h-1 bg-gray-300 rounded-full flex-1"></div>
            <div className="h-1 bg-gray-300 rounded-full flex-1"></div>
            <div className="h-1 bg-gray-300 rounded-full flex-1"></div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Step 1 of 4</span>
          <span className="text-green-600 font-medium flex items-center gap-1">
            <Check className="w-3 h-3" />
            Saved locally
          </span>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Section Title */}
        <div className="space-y-1">
          <h2 className="font-bold text-gray-900 text-sm sm:text-base">Applicant Details</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Please enter your information exactly as it appears on your official documents.
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-3 sm:space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              Full Legal Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              {savedFields.has('fullName') && (
                <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Security Number */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              Social Security Number
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="XXX-XX-XXXX"
                value={formData.ssn}
                onChange={(e) => handleChange('ssn', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              {savedFields.has('ssn') && (
                <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="MM/DD/YYYY"
                value={formData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 sm:pr-12 text-sm sm:text-base"
              />
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                {savedFields.has('dob') ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                ) : (
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Mobile Phone */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              Mobile Phone
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="(555) 000-0000"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              {savedFields.has('phone') && (
                <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Organization Type Section */}
        <div className="pt-2 sm:pt-4">
          <h2 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Organization Type</h2>
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-gray-500">Additional form fields would appear here...</p>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <button 
          onClick={() => onNavigate('services')}
          className="text-gray-700 font-medium hover:text-gray-900 transition-colors text-sm sm:text-base"
        >
          Save & Exit
        </button>
        <button 
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
        >
          <span>Next Step</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}