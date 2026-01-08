import { ChevronLeft, FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import type { Screen } from '../App';

interface InstituteDashboardProps {
  onNavigate: (screen: Screen) => void;
  totalSubmissions: number;
  completedSubmissions: number;
}

export function InstituteDashboard({ onNavigate, totalSubmissions, completedSubmissions }: InstituteDashboardProps) {
  const pendingSubmissions = totalSubmissions - completedSubmissions;
  const progressPercentage = totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Institute Dashboard</h1>
        </div>
      </div>

      {/* Progress Overview Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-5 sm:p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5" />
          <h2 className="text-base sm:text-lg font-semibold">Overall Progress</h2>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-100">Completion Rate</span>
            <span className="font-bold text-lg">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-blue-100">
            {completedSubmissions} of {totalSubmissions} submissions completed
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border-2 border-gray-200">
          <div className="flex flex-col items-center text-center">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalSubmissions}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Total</div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-green-50 rounded-xl p-3 sm:p-4 border-2 border-green-200">
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-green-900">{completedSubmissions}</div>
            <div className="text-xs sm:text-sm text-green-700 mt-1">Completed</div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-orange-50 rounded-xl p-3 sm:p-4 border-2 border-orange-200">
          <div className="flex flex-col items-center text-center">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-orange-900">{pendingSubmissions}</div>
            <div className="text-xs sm:text-sm text-orange-700 mt-1">Pending</div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onNavigate('instituteForm')}
        className="w-full bg-blue-600 text-white rounded-xl py-3 sm:py-4 font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
      >
        <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Submit New Task</span>
      </button>
    </div>
  );
}
