import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // For demonstration purposes, use mock data instead of API call
          // In a real implementation, this would validate the token and load user data
          
          // Mock user data
          const mockUser = {
            id: '123',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'admin',
            company: {
              id: '456',
              name: 'Acme Inc.'
            },
            completedOnboarding: true
          };
          
          setUser(mockUser);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Error loading user:', err);
          logout();
          setError('Authentication error');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register company and admin
  const registerCompany = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      // For demonstration purposes, use mock data instead of API call
      // In a real implementation, this would call the backend API
      // const res = await axios.post('/api/auth/register-company', formData);
      
      // Mock successful registration response
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE2NzYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const mockUser = {
        id: '123',
        name: formData.firstName + ' ' + formData.lastName,
        email: formData.email,
        role: 'admin',
        company: {
          id: '456',
          name: formData.companyName || 'New Company'
        },
        completedOnboarding: false
      };
      
      // Set token in local storage
      localStorage.setItem('token', mockToken);
      setToken(mockToken);
      
      // Set user data
      setUser(mockUser);
      setIsAuthenticated(true);
      
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      setError(
        err.response && err.response.data.msg 
          ? err.response.data.msg 
          : 'Registration failed'
      );
      return false;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // For demonstration purposes, use mock data instead of API call
      // In a real implementation, this would call the backend API
      // const res = await axios.post('/api/auth/login', { email, password });
      
      // Mock successful login response
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE2NzYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const mockUser = {
        id: '123',
        name: 'John Doe',
        email: email,
        role: 'admin',
        company: {
          id: '456',
          name: 'Acme Inc.'
        },
        completedOnboarding: true
      };
      
      // Set token in local storage
      localStorage.setItem('token', mockToken);
      setToken(mockToken);
      
      // Set user data
      setUser(mockUser);
      setIsAuthenticated(true);
      
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      setError(
        err.response && err.response.data.msg 
          ? err.response.data.msg 
          : 'Login failed'
      );
      return false;
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from local storage
    localStorage.removeItem('token');
    setToken(null);
    
    // Clear user data
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear axios header
    delete axios.defaults.headers.common['x-auth-token'];
  };

  // Update user profile
  const updateProfile = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.put('/api/employees/profile', formData);
      
      setUser(res.data);
      
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      setError(
        err.response && err.response.data.msg 
          ? err.response.data.msg 
          : 'Profile update failed'
      );
      return false;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.put('/api/auth/password', { currentPassword, newPassword });
      
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      setError(
        err.response && err.response.data.msg 
          ? err.response.data.msg 
          : 'Password change failed'
      );
      return false;
    }
  };

  // Accept terms of service
  const acceptTerms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.put('/api/employees/accept-terms');
      
      // Update user data
      setUser({ ...user, acceptedTerms: true });
      
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      setError(
        err.response && err.response.data.msg 
          ? err.response.data.msg 
          : 'Failed to accept terms'
      );
      return false;
    }
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.put('/api/employees/complete-onboarding');
      
      // Update user data
      setUser({ ...user, completedOnboarding: true });
      
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      setError(
        err.response && err.response.data.msg 
          ? err.response.data.msg 
          : 'Failed to complete onboarding'
      );
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        registerCompany,
        login,
        logout,
        updateProfile,
        changePassword,
        acceptTerms,
        completeOnboarding
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
