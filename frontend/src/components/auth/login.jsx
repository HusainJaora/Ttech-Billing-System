import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Mail, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/refresh-token', {
        method: 'POST',
        credentials: 'include', // Important: sends cookies with request
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        // Access token will be set in HTTP-only cookie by backend
        setupTokenRefresh();
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      handleLogout();
    }
  }, []);

  const setupTokenRefresh = useCallback(() => {
    const refreshTime = 14 * 60 * 1000;

    const timerId = setTimeout(() => {
      refreshAccessToken();
    }, refreshTime);

    return () => clearTimeout(timerId);
  }, [refreshAccessToken]);

  useEffect(() => {
    // Check if user is logged in by making a request to a protected endpoint
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/auth/status', {
          method: 'GET',
          credentials: 'include' // Sends cookies
        });

        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setUserData({
            username: data.username,
            shop_name: data.shop_name
          });
          setupTokenRefresh();
        }
      } catch (err) {
        // User not logged in
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, [setupTokenRefresh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setIsRateLimited(false);

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        credentials: 'include', // Important: allows setting cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Tokens are now stored in HTTP-only cookies by backend
        setUserData({
          username: data.username,
          
        });
        setIsLoggedIn(true);
        setupTokenRefresh();
      } else {
        // Check for rate limit error
        if (response.status === 429 || data.error?.includes('Too many login attempts')) {
          setIsRateLimited(true);
          setError(data.error || 'Too many login attempts. Please try again after 15 minutes.');
        } else {
          setError(data.error || 'Login failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8000/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setIsLoggedIn(false);
        setUserData(null);
        setFormData({ email: '', password: '' });
      } else {
        console.error('Logout failed');
        // Force logout on frontend anyway
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout on frontend anyway
      setIsLoggedIn(false);
      setUserData(null);
      setFormData({ email: '', password: '' });
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-10 h-10 text-black" />
            </div>
            <h2 className="text-3xl font-bold text-black mb-2">Welcome Back!</h2>
            <p className="text-black mb-6">You're successfully logged in</p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <div className="mb-3">
                <p className="text-sm text-gray-500">Username</p>
                <p className="text-lg font-semibold text-black">{userData?.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Shop Name</p>
                <p className="text-lg font-semibold text-black">{userData?.shop_name || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
              <p className="text-sm text-black">
                🔒 Secured with HTTP-only cookies
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Token auto-refreshes every 14 minutes
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Welcome Back</h1>
          <p className="text-black">Please login to your account</p>
        </div>

        {error && (
          <div className={`${isRateLimited ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4 mb-6 flex items-start gap-3`}>
            <AlertCircle className={`w-5 h-5 ${isRateLimited ? 'text-orange-500' : 'text-red-500'} flex-shrink-0 mt-0.5`} />
            <div>
              <p className={`text-sm font-semibold ${isRateLimited ? 'text-orange-800' : 'text-red-800'} mb-1`}>
                {isRateLimited ? 'Account Temporarily Locked' : 'Login Failed'}
              </p>
              <p className={`text-sm ${isRateLimited ? 'text-orange-700' : 'text-red-700'}`}>{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-black"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-black"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || isRateLimited}
            className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging in...
              </>
            ) : isRateLimited ? (
              <>
                <Lock className="w-5 h-5" />
                Locked - Try Again Later
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Login
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-black">
            Don't have an account?{' '}
            <a href="#" className="text-black hover:text-gray-700 font-semibold underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;