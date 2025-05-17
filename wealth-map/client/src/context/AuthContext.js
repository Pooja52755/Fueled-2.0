import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Set base URL for API calls
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requireMfa, setRequireMfa] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [tempEmail, setTempEmail] = useState(null);

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
          // Set auth token header
          axios.defaults.headers.common['x-auth-token'] = token;
          
          // Verify token and get user data
          const res = await axios.get('/api/auth/me');
          
          if (res.data) {
            // Ensure the user is marked as having completed onboarding
            // This will prevent redirection to the onboarding page
            const userData = {
              ...res.data,
              completedOnboarding: true // Force this to be true to skip onboarding
            };
            
            console.log('User data loaded with onboarding completed:', userData);
            
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            throw new Error('Invalid authentication');
          }
        } catch (err) {
          console.error('Error loading user:', err);
          logout();
          setError('Authentication error. Please log in again.');
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
      
      // Prepare registration data
      const registrationData = {
        companyName: formData.companyName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        industry: formData.industry || 'Real Estate',
        contactPhone: formData.contactPhone || '',
        website: formData.website || '',
        size: formData.size || '1-10'
      };
      
      console.log('Registering company with data:', {
        ...registrationData,
        password: '[REDACTED]' // Don't log the actual password
      });
      
      // Call the API to register the company
      const res = await axios.post('/api/auth/register-company', registrationData);
      
      console.log('Registration response:', res.data);
      
      const { token, user, company } = res.data;
      
      console.log('Registration successful, setting auth state with token and user data');
      
      // Set token in local storage
      localStorage.setItem('token', token);
      setToken(token);
      
      // Set auth token in axios headers
      axios.defaults.headers.common['x-auth-token'] = token;
      
      // Decode token to get user data if not already provided
      let userData = user || (token ? jwtDecode(token).user : null);
      
      // Ensure the user is marked as having completed onboarding
      userData = {
        ...userData,
        completedOnboarding: true // Force this to be true to skip onboarding
      };
      
      console.log('Registration complete with onboarding marked as completed:', userData);
      
      // Set user data
      setUser(userData);
      setIsAuthenticated(true);
      setRequireMfa(false);
      
      console.log('Authentication state set:', { isAuthenticated: true, user: userData });
      
      setLoading(false);
      return { success: true, company, user: userData };
    } catch (err) {
      console.error('Registration error:', err);
      setLoading(false);
      
      // Log detailed error information
      if (err.response) {
        console.error('Error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      } else if (err.request) {
        console.error('Error request:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      
      // Set appropriate error message
      const errorMessage = err.response?.data?.errors 
        ? `Validation errors: ${JSON.stringify(err.response.data.errors)}` 
        : (err.response?.data?.msg || 'Registration failed');
      
      setError(errorMessage);
      
      return { 
        success: false,
        error: errorMessage,
        details: err.response?.data
      };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting login with:', { email });
      
      // Make API call to login endpoint
      const res = await axios.post('/api/auth/login', { email, password });
      
      console.log('Login response:', res.data);
      
      // Check if MFA is required
      if (res.data.requireMfa) {
        console.log('MFA required, setting up temporary authentication');
        // Store temporary token for MFA verification
        localStorage.setItem('temp_token', res.data.token);
        
        // Set auth token in axios headers for MFA verification
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        
        // Set state to indicate MFA is required
        setTempToken(res.data.token);
        setTempEmail(email);
        
        // Set requireMfa last to avoid potential race conditions
        setLoading(false);
        setRequireMfa(true);
        
        return {
          success: true,
          requireMfa: true
        };
      }
      
      console.log('Login successful, processing token');
      // If MFA is not required, proceed with normal login
      const token = res.data.token;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      localStorage.removeItem('temp_token'); // Clear any temp token
      
      // Set auth token in axios headers
      axios.defaults.headers.common['x-auth-token'] = token;
      
      // Decode token to get user data
      const decoded = jwtDecode(token);
      console.log('Decoded token:', decoded);
      
      // Ensure the user is marked as having completed onboarding
      const userData = {
        ...decoded.user,
        completedOnboarding: true // Force this to be true to skip onboarding
      };
      
      console.log('Login complete with onboarding marked as completed:', userData);
      
      // Set current user
      setUser(userData);
      setIsAuthenticated(true);
      setRequireMfa(false);
      setTempToken(null);
      setTempEmail(null);
      
      setLoading(false);
      return {
        success: true
      };
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
      
      // Log detailed error information
      if (err.response) {
        console.error('Error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      } else if (err.request) {
        console.error('Error request:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      
      // Set appropriate error message
      const errorMessage = err.response?.data?.errors 
        ? `Validation errors: ${JSON.stringify(err.response.data.errors)}` 
        : (err.response?.data?.msg || 'Login failed');
      
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        details: err.response?.data
      };
    }
  };

  // Verify MFA
  const verifyMfa = async (mfaCode) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the temporary token from state or localStorage
      const tempTokenToUse = tempToken || localStorage.getItem('temp_token');
      
      if (!tempTokenToUse) {
        throw new Error('No temporary token found for MFA verification');
      }
      
      // Make API call to verify MFA
      const res = await axios.post('/api/auth/verify-mfa', { 
        token: tempTokenToUse, 
        code: mfaCode 
      });
      
      const token = res.data.token;
      
      // Store token in localStorage and remove temporary token
      localStorage.setItem('token', token);
      localStorage.removeItem('temp_token');
      
      // Set auth token in axios headers
      axios.defaults.headers.common['x-auth-token'] = token;
      
      // Decode token to get user data
      const decoded = jwtDecode(token);
      
      // Set current user
      setUser(decoded.user);
      setIsAuthenticated(true);
      setRequireMfa(false);
      setTempToken(null);
      setTempEmail(null);
      
      setLoading(false);
      return {
        success: true
      };
    } catch (err) {
      console.error('MFA verification error:', err);
      setLoading(false);
      setError(
        err.response && err.response.data.msg 
          ? err.response.data.msg 
          : 'MFA verification failed'
      );
      return {
        success: false,
        error: err.response?.data?.msg || 'Invalid MFA code'
      };
    }
  };

  // Logout user
  const logout = () => {
    // Remove tokens from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('temp_token');
    setToken(null);
    
    // Clear user data and MFA state
    setUser(null);
    setIsAuthenticated(false);
    setRequireMfa(false);
    setTempToken(null);
    setTempEmail(null);
    
    // Clear axios header
    delete axios.defaults.headers.common['x-auth-token'];
    delete axios.defaults.headers.common['x-mfa-token'];
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
        requireMfa,
        tempEmail,
        registerCompany,
        login,
        verifyMfa,
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
