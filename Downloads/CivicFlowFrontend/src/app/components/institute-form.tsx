import { useState } from 'react';
import { ChevronLeft, Upload, CheckCircle, TrendingUp } from 'lucide-react';
import type { Screen } from '../App';

interface InstituteFormProps {
  onNavigate: (screen: Screen) => void;
  totalSubmissions: number;
  completedSubmissions: number;
  onSubmit: () => void;
}

export function InstituteForm({ onNavigate, totalSubmissions, completedSubmissions, onSubmit }: InstituteFormProps) {
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    category: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const progressPercentage = totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0;

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      onSubmit(); // Update parent state
      
      // Reset form
      setFormData({ taskName: '', description: '', category: '' });
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => onNavigate('instituteDashboard')}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <h1 className="flex-1 text-center font-bold text-gray-900 text-sm sm:text-base">
            Institute Submission
          </h1>
          <div className="w-5 sm:w-6"></div>
        </div>
      </div>

      {/* Progress Bar (Synced with Dashboard) */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 sm:px-6 py-4 sm:py-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-semibold">Progress: {progressPercentage}%</span>
        </div>
        <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-blue-100 mt-2">
          {completedSubmissions} of {totalSubmissions} completed
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mx-4 sm:mx-6 mt-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold text-sm">Submission successful! Progress updated.</span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Task Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Task/Module Name
          </label>
          <input
            type="text"
            placeholder="Enter task name"
            value={formData.taskName}
            onChange={(e) => handleChange('taskName', e.target.value)}
            required
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            required
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">Select category</option>
            <option value="academic">Academic Records</option>
            <option value="financial">Financial Documents</option>
            <option value="administrative">Administrative Tasks</option>
            <option value="compliance">Compliance Reports</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            placeholder="Provide details about this submission"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
            rows={4}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full ${
            isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-xl py-3 sm:py-4 font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Submit Task</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
