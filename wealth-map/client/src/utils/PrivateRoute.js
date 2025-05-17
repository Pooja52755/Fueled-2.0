import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Disable onboarding redirect as per user request
  // We'll go directly to the dashboard instead
  // if (user && user.completedOnboarding === false) {
  //   console.log('User has not completed onboarding, redirecting...');
  //   return <Navigate to="/onboarding" />;
  // }
  console.log('Skipping onboarding check as requested');
  
  // Log for debugging
  console.log('PrivateRoute rendering protected content');

  // Render the protected component
  return children;
};

export default PrivateRoute;
