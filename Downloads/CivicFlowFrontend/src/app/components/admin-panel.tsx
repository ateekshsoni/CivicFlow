import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import type { Screen } from '../App';
import type { Service } from '../App';

interface AdminPanelProps {
  onNavigate: (screen: Screen, serviceId?: string) => void;
  services: Service[];
}

export function AdminPanel({ onNavigate, services }: AdminPanelProps) {
  const [systemMode, setSystemMode] = useState<'normal' | 'degraded'>('normal');
  const [schemaAPI, setSchemaAPI] = useState(true);
  const [normalSubmit, setNormalSubmit] = useState(true);
  const [syncAPI, setSyncAPI] = useState(false);
  const [lastSyncMinutes, setLastSyncMinutes] = useState(34);

  // Calculate storage and pending items
  const pendingItems = services.filter(s => s.status !== 'synced').length;
  const storageUsage = 14.2; // MB

  // Update last sync time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncMinutes(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">Admin / Control Panel</h1>
        <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
          <span className="text-gray-400 text-lg sm:text-xl">⋮</span>
        </button>
      </div>

      {/* System Mode */}
      <div className="space-y-2 sm:space-y-3">
        <div className="text-xs sm:text-sm font-semibold text-gray-700">System Mode</div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* Normal Mode */}
          <button 
            onClick={() => setSystemMode('normal')}
            className={`relative bg-white rounded-xl p-3 sm:p-4 text-left transition-all ${
              systemMode === 'normal' 
                ? 'border-2 border-green-500' 
                : 'border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            {systemMode === 'normal' && (
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>
            )}
            <div className="pr-6">
              <div className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">Normal</div>
              <div className="text-xs text-gray-500">All systems operational</div>
            </div>
          </button>

          {/* Degraded Mode */}
          <button 
            onClick={() => setSystemMode('degraded')}
            className={`relative bg-white rounded-xl p-3 sm:p-4 text-left transition-all ${
              systemMode === 'degraded' 
                ? 'border-2 border-green-500' 
                : 'border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            {systemMode === 'degraded' && (
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>
            )}
            <div className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">Degraded</div>
            <div className="text-xs text-gray-500">Limited connectivity</div>
          </button>
        </div>
      </div>

      {/* Background Services */}
      <div className="space-y-2 sm:space-y-3">
        <div className="text-xs sm:text-sm font-semibold text-gray-700">Background Services</div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
          {/* Schema API */}
          <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm sm:text-base">Schema API</div>
              <div className="text-xs sm:text-sm text-gray-500 truncate">Schema synchronization</div>
            </div>
            <button 
              onClick={() => setSchemaAPI(!schemaAPI)}
              className="relative inline-block w-10 h-5 sm:w-11 sm:h-6 flex-shrink-0"
            >
              <div className={`w-10 h-5 sm:w-11 sm:h-6 rounded-full transition-colors ${schemaAPI ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`absolute top-[2px] bg-white w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-transform ${schemaAPI ? 'left-[20px] sm:left-[22px]' : 'left-[2px]'}`}></div>
            </button>
          </div>

          {/* Normal Submit */}
          <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm sm:text-base">Normal Submit</div>
              <div className="text-xs sm:text-sm text-gray-500 truncate">Standard submission flow</div>
            </div>
            <button 
              onClick={() => setNormalSubmit(!normalSubmit)}
              className="relative inline-block w-10 h-5 sm:w-11 sm:h-6 flex-shrink-0"
            >
              <div className={`w-10 h-5 sm:w-11 sm:h-6 rounded-full transition-colors ${normalSubmit ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`absolute top-[2px] bg-white w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-transform ${normalSubmit ? 'left-[20px] sm:left-[22px]' : 'left-[2px]'}`}></div>
            </button>
          </div>

          {/* Sync API */}
          <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm sm:text-base">Sync API</div>
              <div className="text-xs sm:text-sm text-gray-500 truncate">Background data sync</div>
            </div>
            <button 
              onClick={() => setSyncAPI(!syncAPI)}
              className="relative inline-block w-10 h-5 sm:w-11 sm:h-6 flex-shrink-0"
            >
              <div className={`w-10 h-5 sm:w-11 sm:h-6 rounded-full transition-colors ${syncAPI ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`absolute top-[2px] bg-white w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-transform ${syncAPI ? 'left-[20px] sm:left-[22px]' : 'left-[2px]'}`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Local Diagnostics */}
      <div className="space-y-2 sm:space-y-3">
        <div className="text-xs sm:text-sm font-semibold text-gray-700">Local Diagnostics</div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Storage Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-600">Storage Usage</span>
              <span className="font-semibold text-gray-900 text-xs sm:text-sm">{storageUsage.toFixed(1)} MB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <div className="bg-blue-600 h-1.5 sm:h-2 rounded-full" style={{ width: '28%' }}></div>
            </div>
          </div>

          {/* Pending Queue */}
          <div className="flex items-center justify-between py-2 border-t border-gray-200">
            <span className="text-xs sm:text-sm text-gray-600">Pending Queue</span>
            <span className="font-semibold text-gray-900 text-xs sm:text-sm">{pendingItems} item{pendingItems !== 1 ? 's' : ''}</span>
          </div>

          {/* Last Sync */}
          <div className="flex items-center justify-between py-2 border-t border-gray-200">
            <span className="text-xs sm:text-sm text-gray-600">Last Sync</span>
            <span className="font-semibold text-gray-900 text-xs sm:text-sm">{lastSyncMinutes} min ago</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <button 
        onClick={() => onNavigate('home')}
        className="w-full bg-gray-900 text-white rounded-xl py-3 sm:py-4 font-semibold hover:bg-gray-800 transition-colors text-sm sm:text-base"
      >
        Close Control Panel
      </button>
    </div>
  );
}