import { ChevronLeft, FileText, Calendar, Clock, CheckCircle, LogOut, User as UserIcon } from 'lucide-react';
import type { Screen } from '../App';
import type { Service } from '../App';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
  services: Service[];
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

const formatDate = (date: Date): string => {
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

export function Dashboard({ onNavigate, services, user, onLogout }: DashboardProps) {
  if (!user) return null;

  const userServices = services.filter(s => s.status !== 'draft' || s.id === '1' || s.id === '2');
  const draftServices = userServices.filter(s => s.status === 'draft');
  const syncingServices = userServices.filter(s => s.status === 'syncing');
  const completedServices = userServices.filter(s => s.status === 'synced');

  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'draft':
        return { bg: 'bg-gray-100', text: 'text-gray-700', badge: 'DRAFT' };
      case 'syncing':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'SYNCING' };
      case 'synced':
        return { bg: 'bg-green-100', text: 'text-green-700', badge: 'COMPLETED' };
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
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('services')}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Dashboard</h1>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* User Profile Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-4 sm:p-5 text-white">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold truncate">{user.name}</h2>
            <p className="text-sm sm:text-base text-blue-100 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Draft</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{draftServices.length}</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 sm:p-4 border border-yellow-200">
          <div className="text-xs sm:text-sm text-yellow-700 mb-1">Syncing</div>
          <div className="text-xl sm:text-2xl font-bold text-yellow-900">{syncingServices.length}</div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-200">
          <div className="text-xs sm:text-sm text-green-700 mb-1">Completed</div>
          <div className="text-xl sm:text-2xl font-bold text-green-900">{completedServices.length}</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Recent Activity</h3>
          <button 
            onClick={() => onNavigate('services')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>

        {/* Services List */}
        <div className="space-y-2 sm:space-y-3">
          {userServices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No submissions yet</p>
              <button
                onClick={() => onNavigate('form')}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Start Your First Service
              </button>
            </div>
          ) : (
            userServices.slice(0, 5).map((service, index) => {
              const colors = getIconColor(index);
              const statusColors = getStatusColor(service.status);
              
              return (
                <div
                  key={service.id}
                  className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <FileText className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {service.title}
                        </h4>
                        <span className={`${statusColors.bg} ${statusColors.text} text-xs font-semibold px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0`}>
                          {statusColors.badge}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(service.completedDate || service.lastEdited)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(service.completedDate || service.lastEdited)}</span>
                        </div>
                      </div>
                      {service.referenceId && (
                        <div className="mt-1 text-xs text-gray-400 font-mono">
                          ID: {service.referenceId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 sm:space-y-3 pt-2">
        <h3 className="text-sm font-semibold text-gray-700">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('form')}
            className="bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            New Service
          </button>
          <button
            onClick={() => onNavigate('services')}
            className="bg-gray-100 text-gray-700 rounded-xl py-3 font-semibold hover:bg-gray-200 transition-colors text-sm sm:text-base"
          >
            View All
          </button>
        </div>
      </div>
    </div>
  );
}
