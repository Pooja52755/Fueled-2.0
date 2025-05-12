import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AlertContext } from '../../context/AlertContext';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress
} from '@mui/material';

const ForgotPassword = () => {
  const { success: showSuccess, error: showError } = useContext(AlertContext);
  
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const onChange = (e) => {
    setEmail(e.target.value);
    setFormError('');
  };
  
  const validateForm = () => {
    if (!email) {
      setFormError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('Email is invalid');
      return false;
    }
    return true;
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        // In a real implementation, this would call the backend API
        // For now, we'll simulate a successful request
        // await axios.post('/api/auth/forgot-password', { email });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setEmailSent(true);
        showSuccess('Password reset instructions sent to your email');
      } catch (err) {
        showError(
          err.response && err.response.data.msg 
            ? err.response.data.msg 
            : 'Failed to send password reset email'
        );
      } finally {
        setLoading(false);
      }
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
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Forgot Password
          </Typography>
          
          {emailSent ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                We've sent password reset instructions to your email.
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Please check your inbox and follow the instructions to reset your password.
              </Typography>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                sx={{ mt: 2 }}
              >
                Back to Login
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Enter your email address and we'll send you instructions to reset your password.
              </Typography>
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={onChange}
                error={!!formError}
                helperText={formError}
                disabled={loading}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Reset Instructions'}
              </Button>
              
              <Grid container justifyContent="center">
                <Grid item>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      Remember your password? Sign in
                    </Typography>
                  </Link>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
