import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import MfaVerification from './MfaVerification';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, error, requireMfa, tempEmail } = useContext(AuthContext);
  const { error: showError, success: showSuccess } = useContext(AlertContext);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { email, password } = formData;
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Show error if authentication fails
  useEffect(() => {
    if (error) {
      showError(error);
      setIsSubmitting(false);
    }
  }, [error, showError]);
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user types
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      console.log('Attempting login with:', { email });
      
      const result = await login(email, password);
      console.log('Login result:', result);
      
      if (result.requireMfa) {
        // Instead of showing the MFA component inline, redirect to the MFA verification page
        showSuccess('Please enter your MFA verification code');
        navigate('/mfa/verify');
      } else if (result.success) {
        showSuccess('Login successful');
        
        // Force navigation to dashboard
        console.log('Login successful, navigating to dashboard');
        setTimeout(() => {
          navigate('/');
        }, 500);
      }
      
      setIsSubmitting(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  // MFA verification is now handled on a separate page
  
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
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <LockOutlined sx={{ fontSize: 30, mr: 1, color: 'primary.main' }} />
            <Typography component="h1" variant="h5">
              Sign In
            </Typography>
          </Box>
          
          <Box component="form" onSubmit={onSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              variant="outlined"
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
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={isSubmitting}
            />
            
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={onChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={toggleShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container>
              <Grid item xs>
                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Forgot password?
                  </Typography>
                </Link>
              </Grid>
              <Grid item>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Don't have an account? Sign Up
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
