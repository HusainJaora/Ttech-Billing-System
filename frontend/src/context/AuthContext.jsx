import { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import ENDPOINTS from '../api/endpoint';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider mounted, checking auth status...');
    checkAuthStatus();
  }, []);

    useEffect(() => {
    console.log('Auth state changed:', isAuthenticated, user);
  }, [isAuthenticated, user]);

  const checkAuthStatus = async () => {
    console.log('Checking auth status at:', ENDPOINTS.AUTH.STATUS);
    try {
      const response = await axiosInstance.get(ENDPOINTS.AUTH.STATUS);
      console.log('Auth status response:', response.data);
      setUser({
        username: response.data.username,
        is_admin: response.data.is_admin,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.log('Auth status check failed:', error.message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      console.log('Auth check complete. isAuthenticated:', isAuthenticated);
    }
  };

  const login = async (email, password) => {
    console.log('Attempting login...');
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      console.log('Login successful:', response.data);
      setUser({
        username: response.data.username,
        is_admin: response.data.is_admin,
      });
      setIsAuthenticated(true);

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Login failed:', error);
      const message = error.response?.data?.error || 'Login failed';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    console.log('Logging out...');
    try {
      await axiosInstance.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};