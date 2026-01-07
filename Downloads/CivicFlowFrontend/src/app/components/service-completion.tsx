import { ShieldCheck, Lock } from 'lucide-react';
import type { Screen } from '../App';
import type { Service, FormData } from '../App';

interface ServiceCompletionProps {
  onNavigate: (screen: Screen, serviceId?: string) => void;
  onComplete: () => void;
  service: Service | null;
  formData: FormData;
}

const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `Today, ${displayHours}:${displayMinutes} ${ampm}`;
};

export function ServiceCompletion({ onNavigate, onComplete, service, formData }: ServiceCompletionProps) {
  const startTime = formData.startTime || new Date();
  const referenceId = service?.referenceId || `REF-${Math.floor(Math.random() * 999)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

  return (
    <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center pt-2 sm:pt-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">Confirmation</h1>
      </div>

      {/* Success Icon */}
      <div className="flex justify-center pt-1 sm:pt-2">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-9 h-9 sm:w-11 sm:h-11 text-green-600" />
        </div>
      </div>

      {/* Main Text */}
      <div className="text-center space-y-2 sm:space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Service Recorded</h2>
        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg">
          <span className="text-xs sm:text-sm font-semibold">Completed — Pending Sync</span>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-gray-50 rounded-xl p-4 sm:p-5 space-y-2.5 sm:space-y-3 border border-gray-200">
        <div className="flex justify-between items-start">
          <span className="text-xs sm:text-sm text-gray-600">Service</span>
          <span className="text-xs sm:text-sm font-semibold text-gray-900 text-right">
            {service?.title || 'Business Permit Renewal'}
          </span>
        </div>
        <div className="border-t border-gray-200"></div>
        <div className="flex justify-between items-start">
          <span className="text-xs sm:text-sm text-gray-600">Time Started</span>
          <span className="text-xs sm:text-sm font-semibold text-gray-900">{formatTime(startTime)}</span>
        </div>
        <div className="border-t border-gray-200"></div>
        <div className="flex justify-between items-start">
          <span className="text-xs sm:text-sm text-gray-600">Reference ID</span>
          <span className="text-xs sm:text-sm font-mono font-semibold text-gray-900">{referenceId}</span>
        </div>
      </div>

      {/* Security Note */}
      <div className="bg-blue-50 rounded-xl p-3 sm:p-4 flex gap-2 sm:gap-3 border border-blue-100">
        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-blue-900">
            This service is end-to-end encrypted and will automatically sync to the central system when connection is restored.
          </p>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
        <button 
          onClick={onComplete}
          className="w-full bg-blue-600 text-white rounded-xl py-3 sm:py-4 font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          Complete Service
        </button>
        <button 
          onClick={() => onNavigate('services')}
          className="w-full text-blue-600 font-medium py-2.5 sm:py-3 hover:text-blue-700 transition-colors text-sm sm:text-base"
        >
          View Pending Queue
        </button>
      </div>
    </div>
  );
}