import { useState, useEffect } from 'react';
import { ChevronLeft, RefreshCw, TrendingUp, FileText, Clock, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import type { Screen } from '../App';

interface InstituteDashboardProps {
  onNavigate: (screen: Screen) => void;
}

interface FormData {
  id: string;
  name: string;
  status: 'live' | 'draft' | 'paused' | 'archived';
  submissionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Submission {
  id: string;
  formId: string;
  formName: string;
  userId: string;
  userName: string;
  submittedAt: Date;
  status: 'pending' | 'reviewed' | 'completed';
}

export function InstituteDashboard({ onNavigate }: InstituteDashboardProps) {
  const [forms, setForms] = useState<FormData[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  // Load mock data from localStorage or initialize
  useEffect(() => {
    const storedForms = localStorage.getItem('institute_forms');
    const storedSubmissions = localStorage.getItem('institute_submissions');

    if (storedForms) {
      const parsed = JSON.parse(storedForms);
      setForms(parsed.map((f: any) => ({ ...f, createdAt: new Date(f.createdAt), updatedAt: new Date(f.updatedAt) })));
    } else {
      // Mock data
      const mockForms: FormData[] = [
        {
          id: '1',
          name: '2024 Tax Declaration',
          status: 'live',
          submissionCount: 12450,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-10-24'),
        },
        {
          id: '2',
          name: 'Public Park Feedback',
          status: 'draft',
          submissionCount: 0,
          createdAt: new Date('2024-01-07'),
          updatedAt: new Date('2024-01-07'),
        },
        {
          id: '3',
          name: 'Emergency Relief Fund',
          status: 'paused',
          submissionCount: 342,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-06'),
        },
        {
          id: '4',
          name: 'Vehicle Registration Renewal',
          status: 'live',
          submissionCount: 8921,
          createdAt: new Date('2023-10-20'),
          updatedAt: new Date('2024-10-20'),
        },
      ];
      setForms(mockForms);
      localStorage.setItem('institute_forms', JSON.stringify(mockForms));
    }

    if (storedSubmissions) {
      const parsed = JSON.parse(storedSubmissions);
      setSubmissions(parsed.map((s: any) => ({ ...s, submittedAt: new Date(s.submittedAt) })));
    } else {
      // Mock submissions
      const mockSubmissions: Submission[] = [
        {
          id: 'SUB-001',
          formId: '4',
          formName: 'Vehicle Registration',
          userId: 'REG-9928-XA',
          userName: 'Jane Doe',
          submittedAt: new Date(),
          status: 'pending',
        },
        {
          id: 'SUB-002',
          formId: '1',
          formName: 'Birth Certificate',
          userId: 'BIR-2201-MM',
          userName: 'Baby Smith',
          submittedAt: new Date(Date.now() - 1000 * 60 * 15),
          status: 'completed',
        },
        {
          id: 'SUB-003',
          formId: '1',
          formName: 'Property Tax Appeal',
          userId: 'TAX-8821-Z7',
          userName: 'R. Johnson',
          submittedAt: new Date(Date.now() - 1000 * 60 * 45),
          status: 'reviewed',
        },
      ];
      setSubmissions(mockSubmissions);
      localStorage.setItem('institute_submissions', JSON.stringify(mockSubmissions));
    }
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync(new Date());
    }, 1500);
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const liveForms = forms.filter(f => f.status === 'live').length;
  const draftForms = forms.filter(f => f.status === 'draft').length;
  const totalSubmissions = forms.reduce((sum, f) => sum + f.submissionCount, 0);
  const todaySubmissions = 1240; // Mock data
  const pendingSync = 45; // Mock data
  const delivered = 8900; // Mock data

  return (
    <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 space-y-5">
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
        <button
          onClick={handleSync}
          className={`p-2 hover:bg-gray-100 rounded-lg transition-all ${isSyncing ? 'animate-spin' : ''}`}
          disabled={isSyncing}
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Connection Status */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-900">Connected to CivicFlow</span>
        </div>
        <span className="text-xs text-green-700 font-semibold">v2.4.0</span>
      </div>

      {/* System Status */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">System Status</h2>
          <span className="text-xs text-gray-500">Updated {formatTime(lastSync)}</span>
        </div>
        
        <div className="space-y-2">
          {/* Core - Operational */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">CivicFlow Core</div>
                <div className="text-xs text-gray-500">Main Infrastructure</div>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Operational
            </span>
          </div>

          {/* API - Delayed */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Institute API</div>
                <div className="text-xs text-gray-500">Data Sync Service</div>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-700">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Delayed
            </span>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Overview</h2>
          <button className="text-xs text-blue-600 font-medium hover:text-blue-700">
            View Reports
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Active Forms */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Active Forms</div>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-gray-900">{liveForms}</div>
              <FileText className="w-4 h-4 text-gray-400 mb-1" />
            </div>
          </div>

          {/* Today's Submissions */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Today's Subs</div>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-gray-900">{todaySubmissions.toLocaleString()}</div>
              <div className="flex items-center gap-0.5 text-xs text-green-600 font-semibold mb-1">
                <TrendingUp className="w-3 h-3" />
                12%
              </div>
            </div>
          </div>

          {/* Pending Sync */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Pending Sync</div>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-orange-700">{pendingSync}</div>
              <Clock className="w-4 h-4 text-orange-400 mb-1" />
            </div>
          </div>

          {/* Delivered */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Delivered</div>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-gray-900">{(delivered / 1000).toFixed(1)}k</div>
              <CheckCircle className="w-4 h-4 text-green-500 mb-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">Recent Submissions</h2>
        <div className="space-y-2">
          {submissions.slice(0, 3).map((submission, index) => {
            const colors = [
              { bg: 'bg-blue-100', icon: 'text-blue-600' },
              { bg: 'bg-purple-100', icon: 'text-purple-600' },
              { bg: 'bg-indigo-100', icon: 'text-indigo-600' },
            ];
            const color = colors[index % colors.length];
            
            const statusIcons = {
              pending: <Clock className="w-4 h-4 text-orange-500" />,
              reviewed: <ExternalLink className="w-4 h-4 text-blue-500" />,
              completed: <CheckCircle className="w-4 h-4 text-green-500" />,
            };

            return (
              <button
                key={submission.id}
                onClick={() => onNavigate('instituteSubmissions')}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 hover:border-gray-300 hover:shadow-sm transition-all text-left"
              >
                <div className={`w-10 h-10 ${color.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <FileText className={`w-5 h-5 ${color.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{submission.formName}</div>
                  <div className="text-xs text-gray-500">ID: #{submission.userId} • {submission.userName}</div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs text-gray-500">{formatTime(submission.submittedAt)}</span>
                  {statusIcons[submission.status]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => onNavigate('instituteForms')}
          className="bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors text-sm"
        >
          Manage Forms
        </button>
        <button
          onClick={() => onNavigate('instituteSubmissions')}
          className="bg-gray-100 text-gray-700 rounded-xl py-3 font-semibold hover:bg-gray-200 transition-colors text-sm"
        >
          View All Submissions
        </button>
      </div>
    </div>
  );
}
