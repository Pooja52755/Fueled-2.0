import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  InputAdornment,
  IconButton,
  Grid
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  LockOutlined,
  ArrowBack
} from '@mui/icons-material';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { changePassword } = useContext(AuthContext);
  const { success: showSuccess, error: showError } = useContext(AlertContext);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { currentPassword, newPassword, confirmPassword } = formData;
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user types
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const res = await axios.put('/api/profile/password', {
          currentPassword,
          newPassword
        });
        
        showSuccess('Password changed successfully');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Redirect to profile page after a short delay
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } catch (err) {
        showError(err.response?.data?.msg || 'Failed to change password');
        if (err.response?.data?.msg === 'Current password is incorrect') {
          setFormErrors({ ...formErrors, currentPassword: 'Current password is incorrect' });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
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
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', width: '100%' }}>
            <Button 
              startIcon={<ArrowBack />} 
              onClick={() => navigate('/profile')}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography component="h1" variant="h5" sx={{ flexGrow: 1 }}>
              Change Password
            </Typography>
          </Box>
          
          <Box component="form" onSubmit={onSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="currentPassword"
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              id="currentPassword"
              autoComplete="current-password"
              value={currentPassword}
              onChange={onChange}
              error={!!formErrors.currentPassword}
              helperText={formErrors.currentPassword}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={onChange}
              error={!!formErrors.newPassword}
              helperText={formErrors.newPassword}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={onChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              {isSubmitting ? <CircularProgress size={24} /> : 'Change Password'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ChangePassword;
