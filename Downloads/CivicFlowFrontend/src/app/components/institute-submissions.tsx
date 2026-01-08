import { useState, useEffect } from 'react';
import { ChevronLeft, Search, FileText, User, Calendar, CheckCircle, Clock, Filter } from 'lucide-react';
import type { Screen } from '../App';

interface InstituteSubmissionsProps {
  onNavigate: (screen: Screen) => void;
}

interface Submission {
  id: string;
  formId: string;
  formName: string;
  userId: string;
  userName: string;
  submittedAt: Date;
  status: 'pending' | 'reviewed' | 'completed';
  responses: Record<string, string>;
}

export function InstituteSubmissions({ onNavigate }: InstituteSubmissionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'completed'>('all');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    const storedSubmissions = localStorage.getItem('institute_submissions');
    if (storedSubmissions) {
      const parsed = JSON.parse(storedSubmissions);
      setSubmissions(parsed.map((s: any) => ({ ...s, submittedAt: new Date(s.submittedAt) })));
    } else {
      // Mock data with responses
      const mockSubmissions: Submission[] = [
        {
          id: 'SUB-001',
          formId: '4',
          formName: 'Vehicle Registration Renewal',
          userId: 'REG-9928-XA',
          userName: 'Jane Doe',
          submittedAt: new Date(),
          status: 'pending',
          responses: {
            'Full Name': 'Jane Doe',
            'Vehicle Type': 'Sedan',
            'License Plate': 'ABC-1234',
            'Registration Year': '2024',
          },
        },
        {
          id: 'SUB-002',
          formId: '1',
          formName: 'Birth Certificate Request',
          userId: 'BIR-2201-MM',
          userName: 'Baby Smith',
          submittedAt: new Date(Date.now() - 1000 * 60 * 15),
          status: 'completed',
          responses: {
            'Parent Name': 'Mary Smith',
            'Child Name': 'Baby Smith',
            'Date of Birth': '2024-01-01',
            'Hospital': 'City General Hospital',
          },
        },
        {
          id: 'SUB-003',
          formId: '1',
          formName: 'Property Tax Appeal',
          userId: 'TAX-8821-Z7',
          userName: 'R. Johnson',
          submittedAt: new Date(Date.now() - 1000 * 60 * 45),
          status: 'reviewed',
          responses: {
            'Property ID': 'PROP-567890',
            'Owner Name': 'Robert Johnson',
            'Appeal Reason': 'Incorrect assessment value',
            'Requested Amount': '$2,500',
          },
        },
        {
          id: 'SUB-004',
          formId: '1',
          formName: '2024 Tax Declaration',
          userId: 'TAX-4455-AB',
          userName: 'Sarah Williams',
          submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          status: 'completed',
          responses: {
            'Full Name': 'Sarah Williams',
            'SSN': '***-**-1234',
            'Annual Income': '$75,000',
            'Filing Status': 'Single',
          },
        },
      ];
      setSubmissions(mockSubmissions);
      localStorage.setItem('institute_submissions', JSON.stringify(mockSubmissions));
    }
  }, []);

  const formatDateTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${month} ${day}, ${time}`;
  };

  const getStatusStyle = (status: Submission['status']) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-orange-100', text: 'text-orange-700', icon: <Clock className="w-4 h-4" />, label: 'Pending' };
      case 'reviewed':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: <FileText className="w-4 h-4" />, label: 'Reviewed' };
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle className="w-4 h-4" />, label: 'Completed' };
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.formName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || submission.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Submission Detail View
  if (selectedSubmission) {
    const statusStyle = getStatusStyle(selectedSubmission.status);
    
    return (
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setSelectedSubmission(null)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Submission Details</h1>
              <p className="text-xs text-gray-500">ID: {selectedSubmission.id}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusStyle.bg} ${statusStyle.text}`}>
            {statusStyle.icon}
            <span className="text-sm font-semibold">{statusStyle.label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Submission Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Form:</span>
              <span className="font-semibold text-gray-900">{selectedSubmission.formName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Submitted by:</span>
              <span className="font-semibold text-gray-900">{selectedSubmission.userName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Time:</span>
              <span className="font-semibold text-gray-900">{formatDateTime(selectedSubmission.submittedAt)}</span>
            </div>
          </div>

          {/* Responses */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Responses</h3>
            <div className="space-y-3">
              {Object.entries(selectedSubmission.responses).map(([question, answer]) => (
                <div key={question} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">{question}</div>
                  <div className="text-gray-900">{answer}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {selectedSubmission.status === 'pending' && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button className="bg-gray-100 text-gray-700 rounded-xl py-3 font-semibold hover:bg-gray-200 transition-colors text-sm">
                Mark as Reviewed
              </button>
              <button className="bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 transition-colors text-sm">
                Approve
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate('instituteDashboard')}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Submissions</h1>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by form, user, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          {(['all', 'pending', 'reviewed', 'completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <div className="p-4 sm:p-6 space-y-3">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No submissions found</p>
          </div>
        ) : (
          filteredSubmissions.map((submission, index) => {
            const statusStyle = getStatusStyle(submission.status);
            const colors = [
              { bg: 'bg-blue-100', icon: 'text-blue-600' },
              { bg: 'bg-purple-100', icon: 'text-purple-600' },
              { bg: 'bg-indigo-100', icon: 'text-indigo-600' },
              { bg: 'bg-pink-100', icon: 'text-pink-600' },
            ];
            const color = colors[index % colors.length];

            return (
              <button
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${color.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <FileText className={`w-5 h-5 ${color.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{submission.formName}</h3>
                      <span className={`${statusStyle.bg} ${statusStyle.text} text-xs font-semibold px-2 py-0.5 rounded-md flex-shrink-0`}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div>ID: #{submission.userId} • {submission.userName}</div>
                      <div>{formatDateTime(submission.submittedAt)}</div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
