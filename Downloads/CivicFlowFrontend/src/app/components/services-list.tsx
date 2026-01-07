import { useState } from 'react';
import { RefreshCw, User, FileText, Plus, WifiOff, ChevronLeft } from 'lucide-react';
import type { Screen } from '../App';
import type { Service } from '../App';
import { AuthModal } from './auth-modal';
import type { User as UserType } from '../App';

interface ServicesListProps {
  onNavigate: (screen: Screen, serviceId?: string) => void;
  services: Service[];
  user?: UserType | null;
  onLogin?: (user: UserType) => void;
}

const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `Today, ${displayHours}:${displayMinutes} ${ampm}`;
  } else if (days < 30) {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

export function ServicesList({ onNavigate, services, user, onLogin }: ServicesListProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const inProgressServices = services.filter(s => s.status === 'draft' || s.status === 'syncing');
  const completedServices = services.filter(s => s.status === 'synced');

  const handleUserIconClick = () => {
    if (user) {
      // Navigate to dashboard if logged in
      onNavigate('dashboard');
    } else {
      // Show auth modal if not logged in
      setShowAuthModal(true);
    }
  };

  const handleLogin = (userData: UserType) => {
    if (onLogin) {
      onLogin(userData);
    }
    setShowAuthModal(false);
    onNavigate('dashboard');
  };

  const getStatusBadge = (status: Service['status']) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md">
            DRAFT
          </span>
        );
      case 'syncing':
        return (
          <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-md">
            SYNCING
          </span>
        );
      case 'synced':
        return (
          <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-md">
            SYNCED
          </span>
        );
    }
  };

  const getIconColor = (index: number) => {
    const colors = [
      { bg: 'bg-blue-100', text: 'text-blue-600' },
      { bg: 'bg-orange-100', text: 'text-orange-600' },
      { bg: 'bg-purple-100', text: 'text-purple-600' },
      { bg: 'bg-indigo-100', text: 'text-indigo-600' },
      { bg: 'bg-pink-100', text: 'text-pink-600' },
      { bg: 'bg-green-100', text: 'text-green-600' },
      { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      { bg: 'bg-red-100', text: 'text-red-600' },
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Services</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
          <button 
            onClick={handleUserIconClick}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Offline Alert Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4 flex gap-2 sm:gap-3">
        <WifiOff className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-yellow-900 text-xs sm:text-sm">You are currently offline</div>
          <div className="text-xs sm:text-sm text-yellow-800 mt-1">
            Changes are saved locally and will sync when connection returns.
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="bg-gray-100 rounded-xl p-1 flex gap-1">
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-1 font-semibold rounded-lg py-2 sm:py-2.5 transition-all text-sm sm:text-base ${
            activeTab === 'active' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Active
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 font-semibold rounded-lg py-2 sm:py-2.5 transition-all text-sm sm:text-base ${
            activeTab === 'history' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          History
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-4 sm:space-y-5">
        {activeTab === 'active' ? (
          <>
            {/* IN PROGRESS Section */}
            {inProgressServices.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase px-1">
                  In Progress
                </div>

                {inProgressServices.map((service, index) => {
                  const colors = getIconColor(index);
                  return (
                    <button 
                      key={service.id}
                      onClick={() => onNavigate('form', service.id)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                          <FileText className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-semibold text-gray-900 truncate text-sm sm:text-base">{service.title}</div>
                          <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            Last edited {formatDate(service.lastEdited)}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(service.status)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* RECENTLY COMPLETED Section */}
            {completedServices.slice(0, 2).length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase px-1">
                  Recently Completed
                </div>

                {completedServices.slice(0, 2).map((service, index) => {
                  const colors = getIconColor(index + 2);
                  return (
                    <button 
                      key={service.id}
                      onClick={() => onNavigate('sync', service.id)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                          <FileText className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-semibold text-gray-900 truncate text-sm sm:text-base">{service.title}</div>
                          <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            Completed {formatDate(service.completedDate || service.lastEdited)}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(service.status)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {inProgressServices.length === 0 && completedServices.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No active services</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* HISTORY Tab - All Completed Services */}
            {completedServices.length > 0 ? (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase px-1">
                  All Completed Services
                </div>

                {completedServices.map((service, index) => {
                  const colors = getIconColor(index);
                  return (
                    <button 
                      key={service.id}
                      onClick={() => onNavigate('sync', service.id)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                          <FileText className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-semibold text-gray-900 truncate text-sm sm:text-base">{service.title}</div>
                          <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            Completed {formatDate(service.completedDate || service.lastEdited)}
                          </div>
                          {service.referenceId && (
                            <div className="text-xs text-gray-400 mt-1 font-mono">
                              {service.referenceId}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(service.status)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No history yet</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom CTA */}
      <button 
        onClick={() => onNavigate('form')}
        className="w-full bg-blue-600 text-white rounded-xl py-3 sm:py-4 font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>New Service</span>
      </button>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          show={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}