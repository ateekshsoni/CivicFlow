import { Shield, Settings, FileText, ArrowRight, Building2 } from 'lucide-react';
import type { Screen } from '../App';
import type { Service } from '../App';

interface HomeScreenProps {
  onNavigate: (screen: Screen, serviceId?: string) => void;
  services: Service[];
}

export function HomeScreen({ onNavigate, services }: HomeScreenProps) {
  // Get the first draft service
  const draftService = services.find(s => s.status === 'draft');
  
  return (
    <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 flex items-center justify-between border border-gray-100">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <span className="font-semibold text-sm sm:text-base">CivicFlow</span>
        </div>
        <button 
          onClick={() => onNavigate('admin')}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
        </button>
      </div>

      {/* Main Status Card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-400 to-blue-500 p-4 sm:p-6 overflow-hidden">
        {/* Wave pattern background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,40 50,50 T100,50 L100,100 L0,100 Z" fill="white" opacity="0.3"/>
            <path d="M0,60 Q25,50 50,60 T100,60 L100,100 L0,100 Z" fill="white" opacity="0.2"/>
          </svg>
        </div>

        {/* Sync Active Badge */}
        <div className="relative mb-4">
          <div className="inline-flex items-center gap-1.5 bg-green-500 bg-opacity-90 rounded-full px-2.5 sm:px-3 py-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
            <span className="text-white text-xs font-medium">SYNC ACTIVE</span>
          </div>
        </div>

        {/* Card content placeholder */}
        <div className="relative h-16 sm:h-20"></div>
      </div>

      {/* Heading Section */}
      <div className="space-y-2 sm:space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900">
          Complete services<br />
          even when systems fail.
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Your services are saved locally and sync automatically when you're back online. Continue working without interruption.
        </p>
      </div>

      {/* Service Preview Card */}
      {draftService && (
        <button 
          onClick={() => onNavigate('services')}
          className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 hover:shadow-md transition-shadow"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-gray-900 text-sm sm:text-base">{draftService.title}</div>
            <div className="text-xs sm:text-sm text-gray-500">1 Draft Saved Offline</div>
          </div>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
        </button>
      )}

      {/* System Status */}
      <div className="flex items-center gap-2 text-xs sm:text-sm">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
        <span className="text-gray-700">System Status: Protected</span>
      </div>

      {/* Primary CTA */}
      <button 
        onClick={() => onNavigate('services')}
        className="w-full bg-blue-600 text-white rounded-xl py-3 sm:py-4 font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <span>Start a Service</span>
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* NEW: Institute Dashboard Button */}
      <button 
        onClick={() => onNavigate('instituteDashboard')}
        className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl py-3 sm:py-4 font-semibold hover:from-green-700 hover:to-green-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-md"
      >
        <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Institute Dashboard</span>
      </button>
    </div>
  );
}