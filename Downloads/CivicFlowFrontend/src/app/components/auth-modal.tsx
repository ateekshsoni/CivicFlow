import { useState } from 'react';
import { X, Mail, Lock, User, Chrome } from 'lucide-react';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  onLogin: (user: { name: string; email: string }) => void;
}

export function AuthModal({ show, onClose, onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
  });

  if (!show) return null;

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({ name: '', email: '', password: '' });
    
    // Validation
    let isValid = true;
    const newErrors = { name: '', email: '', password: '' };
    
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (!isValid) {
      setErrors(newErrors);
      return;
    }
    
    // Simulate login/signup
    const userData = {
      name: formData.name || formData.email.split('@')[0],
      email: formData.email,
    };
    
    // Store user data in localStorage
    localStorage.setItem('civicflow_user', JSON.stringify(userData));
    
    onLogin(userData);
  };

  const handleGoogleSignIn = () => {
    // Simulate Google Sign In
    const googleUser = {
      name: 'Demo User',
      email: 'demo@civicflow.gov',
    };
    
    localStorage.setItem('civicflow_user', JSON.stringify(googleUser));
    onLogin(googleUser);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Welcome Text */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isLogin 
                ? 'Welcome back! Sign in to continue.' 
                : 'Join CivicFlow to manage your government services.'}
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 rounded-xl py-3 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Chrome className="w-5 h-5 text-blue-500" />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (only for signup) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({ name: '', email: '', password: '' });
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin 
                ? "Don't have an account? Sign Up" 
                : 'Already have an account? Sign In'}
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              By continuing, you agree to CivicFlow's Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}