import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Search, MoreVertical, FileText, Calendar, Users } from 'lucide-react';
import type { Screen } from '../App';

interface InstituteFormsProps {
  onNavigate: (screen: Screen) => void;
}

interface FormData {
  id: string;
  name: string;
  status: 'live' | 'draft' | 'paused' | 'archived';
  submissionCount: number;
  createdAt: Date;
  updatedAt: Date;
  needsReview?: boolean;
}

export function InstituteForms({ onNavigate }: InstituteFormsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'draft' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [forms, setForms] = useState<FormData[]>([]);

  useEffect(() => {
    const storedForms = localStorage.getItem('institute_forms');
    if (storedForms) {
      const parsed = JSON.parse(storedForms);
      setForms(parsed.map((f: any) => ({ 
        ...f, 
        createdAt: new Date(f.createdAt), 
        updatedAt: new Date(f.updatedAt) 
      })));
    }
  }, []);

  const formatDate = (date: Date): string => {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const getStatusStyle = (status: FormData['status']) => {
    switch (status) {
      case 'live':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Live' };
      case 'draft':
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' };
      case 'paused':
        return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Paused' };
      case 'archived':
        return { bg: 'bg-gray-200', text: 'text-gray-600', label: 'Archived' };
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesTab = activeTab === 'all' || form.status === activeTab;
    const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('instituteDashboard')}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Forms</h1>
          </div>
          <button
            onClick={() => onNavigate('instituteCreateForm')}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'live', 'draft', 'archived'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Forms List */}
      <div className="p-4 sm:p-6 space-y-3">
        {filteredForms.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No forms found</p>
            <button
              onClick={() => onNavigate('instituteCreateForm')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Create your first form
            </button>
          </div>
        ) : (
          filteredForms.map(form => {
            const statusStyle = getStatusStyle(form.status);
            
            return (
              <div
                key={form.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">{form.name}</h3>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Form Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{form.submissionCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(form.updatedAt)}</span>
                  </div>
                </div>

                {/* Warning Badge */}
                {form.needsReview && form.status === 'paused' && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-orange-700">
                    <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                    <span className="font-medium">Needs Review</span>
                    <span className="text-gray-500">• 2 days ago</span>
                  </div>
                )}

                {/* Closed Badge for Archived */}
                {form.status === 'archived' && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span>Closed</span>
                    <span>• {formatDate(form.updatedAt)}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
