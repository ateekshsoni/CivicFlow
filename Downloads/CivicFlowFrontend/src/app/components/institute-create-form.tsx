import { useState } from 'react';
import { ChevronLeft, Plus, X, Save } from 'lucide-react';
import type { Screen } from '../App';

interface InstituteCreateFormProps {
  onNavigate: (screen: Screen) => void;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'date' | 'select';
  required: boolean;
  options?: string[];
}

export function InstituteCreateForm({ onNavigate }: InstituteCreateFormProps) {
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: Date.now().toString(),
      label: '',
      type,
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSave = (status: 'draft' | 'live') => {
    if (!formName.trim()) {
      alert('Please enter a form name');
      return;
    }

    const newForm = {
      id: Date.now().toString(),
      name: formName,
      description: formDescription,
      status,
      submissionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields,
    };

    // Save to localStorage
    const existingForms = JSON.parse(localStorage.getItem('institute_forms') || '[]');
    localStorage.setItem('institute_forms', JSON.stringify([newForm, ...existingForms]));

    setShowSuccess(true);
    setTimeout(() => {
      onNavigate('instituteForms');
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('instituteForms')}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create Form</h1>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mx-4 sm:mx-6 mt-4">
          <div className="flex items-center gap-2 text-green-700">
            <Save className="w-5 h-5" />
            <span className="font-semibold text-sm">Form saved successfully!</span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="p-4 sm:p-6 space-y-5">
        {/* Form Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Form Name *
          </label>
          <input
            type="text"
            placeholder="e.g., Business License Application"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Form Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            placeholder="Describe what this form is for..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          ></textarea>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Form Fields
            </label>
          </div>

          {/* Field List */}
          {fields.map((field, index) => (
            <div key={field.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Field {index + 1}</span>
                <button
                  onClick={() => removeField(field.id)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Field label (e.g., Full Name)"
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />

              <div className="flex items-center gap-3">
                <select
                  value={field.type}
                  onChange={(e) => updateField(field.id, { type: e.target.value as FormField['type'] })}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                  <option value="textarea">Long Text</option>
                  <option value="date">Date</option>
                  <option value="select">Dropdown</option>
                </select>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  Required
                </label>
              </div>
            </div>
          ))}

          {/* Add Field Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => addField('text')}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Text
            </button>
            <button
              onClick={() => addField('email')}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Email
            </button>
            <button
              onClick={() => addField('textarea')}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Long Text
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            onClick={() => handleSave('draft')}
            className="bg-gray-100 text-gray-700 rounded-xl py-3 font-semibold hover:bg-gray-200 transition-colors text-sm"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave('live')}
            className="bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            Publish Live
          </button>
        </div>
      </div>
    </div>
  );
}
