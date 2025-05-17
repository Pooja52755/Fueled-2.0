import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertContext } from '../../context/AlertContext';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress
} from '@mui/material';

const MfaVerificationFixed = () => {
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useContext(AlertContext);
  
  const [mfaCode, setMfaCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // No need to check authentication state - this component handles verification directly
  
  const handleChange = (e) => {
    setMfaCode(e.target.value);
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!mfaCode) {
      setError('Please enter verification code');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the temporary token from localStorage
      const tempToken = localStorage.getItem('temp_token');
      
      if (!tempToken) {
        throw new Error('No temporary token found for MFA verification');
      }
      
      // Make API call to verify MFA
      const res = await axios.post('/api/auth/verify-mfa', { 
        token: tempToken, 
        code: mfaCode 
      });
      
      // Store token in localStorage and remove temporary token
      localStorage.setItem('token', res.data.token);
      localStorage.removeItem('temp_token');
      
      // Refresh the page to update authentication state
      showSuccess('Verification successful');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid verification code');
      showError(err.response?.data?.msg || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h5">
            Two-Factor Authentication
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 3, textAlign: 'center' }}>
            Please enter the verification code from your authenticator app
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="mfaCode"
              label="Verification Code"
              name="mfaCode"
              autoComplete="one-time-code"
              autoFocus
              value={mfaCode}
              onChange={handleChange}
              error={!!error}
              helperText={error}
              inputProps={{ maxLength: 6 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Verify'}
            </Button>
            
            <Button
              fullWidth
              variant="text"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ mt: 1 }}
            >
              Back to Login
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default MfaVerificationFixed;
