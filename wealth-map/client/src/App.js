import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';

// Layout Components
import Dashboard from './components/dashboard/Dashboard';
import PropertyMap from './components/map/PropertyMap';
import PropertyDetails from './components/properties/PropertyDetails';
import OwnerDetails from './components/owners/OwnerDetails';
import SearchResults from './components/search/SearchResults';
import Reports from './components/reports/Reports';
// All components are now implemented
import CompanySettings from './components/settings/CompanySettings';
import UserProfile from './components/settings/UserProfile';
import EmployeeManagement from './components/admin/EmployeeManagement';
import Onboarding from './components/onboarding/Onboarding';

// Context
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

// Utils
import PrivateRoute from './utils/PrivateRoute';
import AdminRoute from './utils/AdminRoute';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AlertProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Private Routes */}
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/map" element={<PrivateRoute><PropertyMap /></PrivateRoute>} />
              <Route path="/properties/:id" element={<PrivateRoute><PropertyDetails /></PrivateRoute>} />
              <Route path="/owners/:id" element={<PrivateRoute><OwnerDetails /></PrivateRoute>} />
              <Route path="/search" element={<PrivateRoute><SearchResults /></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
              {/* User Routes */}
              <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
              <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin/employees" element={<AdminRoute><EmployeeManagement /></AdminRoute>} />
              <Route path="/admin/company" element={<AdminRoute><CompanySettings /></AdminRoute>} />
              
              {/* Redirect to dashboard if path doesn't exist */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;
