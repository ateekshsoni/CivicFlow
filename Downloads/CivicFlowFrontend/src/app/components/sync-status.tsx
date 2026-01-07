import { Check, ChevronLeft } from 'lucide-react';
import type { Screen } from '../App';
import type { Service } from '../App';

interface SyncStatusProps {
  onNavigate: (screen: Screen, serviceId?: string) => void;
  service: Service | null;
}

const formatTimestamp = (date: Date): string => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  // Get timezone offset
  const offset = -date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offset) / 60);
  const offsetSign = offset >= 0 ? '+' : '-';
  
  return `${month} ${day}, ${displayHours}:${minutes}:${seconds} ${ampm} GMT${offsetSign}${offsetHours}`;
};

const formatShortTimestamp = (date: Date): string => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  // Get timezone offset
  const offset = -date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offset) / 60);
  const offsetSign = offset >= 0 ? '+' : '-';
  
  return `${month} ${day}, ${displayHours}${ampm} GMT${offsetSign}${offsetHours}`;
};

export function SyncStatus({ onNavigate, service }: SyncStatusProps) {
  const syncTime = service?.completedDate || new Date();
  const submissionId = service?.referenceId || `CF-${new Date().getFullYear()}-A${Math.floor(Math.random() * 999)}-X`;

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onNavigate('services')}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <h1 className="font-bold text-gray-900 text-sm sm:text-base">Submission Status</h1>
          <div className="w-5 sm:w-6"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center pt-1 sm:pt-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-9 h-9 sm:w-11 sm:h-11 text-green-600" />
          </div>
        </div>

        {/* Main Text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Synced Successfully</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Your submission has been verified and recorded by the central government server.
          </p>
        </div>

        {/* Audit Trail */}
        <div className="space-y-1 py-2 sm:py-4">
          <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4">Audit Track</div>
          
          {/* Timeline */}
          <div className="space-y-3 sm:space-y-4">
            {/* Form Completed */}
            <div className="flex gap-2 sm:gap-3">
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="w-0.5 h-10 sm:h-12 bg-green-500 my-1"></div>
              </div>
              <div className="flex-1 pt-0.5">
                <div className="font-semibold text-gray-900 text-sm sm:text-base">Form Completed</div>
                <div className="text-xs sm:text-sm text-gray-500">Task submitted by user</div>
              </div>
            </div>

            {/* Saved to Device */}
            <div className="flex gap-2 sm:gap-3">
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="w-0.5 h-10 sm:h-12 bg-green-500 my-1"></div>
              </div>
              <div className="flex-1 pt-0.5">
                <div className="font-semibold text-gray-900 text-sm sm:text-base">Saved to Device</div>
                <div className="text-xs sm:text-sm text-gray-500">Encrypted local backup</div>
              </div>
            </div>

            {/* Synced to Server */}
            <div className="flex gap-2 sm:gap-3">
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 pt-0.5">
                <div className="font-semibold text-gray-900 text-sm sm:text-base">Synced to Server</div>
                <div className="text-xs sm:text-sm text-gray-500">Confirmed {formatShortTimestamp(syncTime)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Official Submission Card */}
        <div className="bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-100 space-y-2 sm:space-y-3">
          <div className="text-xs sm:text-sm font-semibold text-blue-900">Official Submission</div>
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-3">
              <span className="text-xs sm:text-sm text-blue-700">Submission ID</span>
              <span className="text-xs sm:text-sm font-mono font-semibold text-blue-900">{submissionId}</span>
            </div>
            <div className="border-t border-blue-200"></div>
            <div className="flex justify-between items-start gap-3">
              <span className="text-xs sm:text-sm text-blue-700">Timestamp</span>
              <span className="text-xs sm:text-sm font-semibold text-blue-900 text-right break-all">{formatTimestamp(syncTime)}</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <button 
          onClick={() => onNavigate('home')}
          className="w-full bg-blue-600 text-white rounded-xl py-3 sm:py-4 font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}