import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import Layout from '../layout/Layout';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Avatar,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const { success: showSuccess, error: showError } = useContext(AlertContext);
  
  const [profileInfo, setProfileInfo] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    jobTitle: 'Real Estate Analyst',
    department: 'Research',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg'
  });
  
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileInfo({
      ...profileInfo,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordInfo({
      ...passwordInfo,
      [name]: value
    });
  };
  
  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };
  
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    // In a real implementation, this would call the backend API
    // For now, we'll just show a success message
    showSuccess('Profile information updated successfully');
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      showError('New passwords do not match');
      return;
    }
    
    if (passwordInfo.newPassword.length < 8) {
      showError('Password must be at least 8 characters long');
      return;
    }
    
    // In a real implementation, this would call the backend API
    // For now, we'll just show a success message
    showSuccess('Password updated successfully');
    
    // Clear password fields
    setPasswordInfo({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };
  
  return (
    <Layout title="User Profile">
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={profileInfo.profileImage}
                sx={{ width: 120, height: 120, mb: 2, mx: 'auto' }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'white'
                }}
              >
                <EditIcon />
              </IconButton>
            </Box>
            
            <Typography variant="h5" gutterBottom>
              {profileInfo.firstName} {profileInfo.lastName}
            </Typography>
            
            <Typography variant="body1" color="textSecondary" gutterBottom>
              {profileInfo.jobTitle}
            </Typography>
            
            <Typography variant="body2" color="textSecondary">
              {profileInfo.department}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" align="left">
              <strong>Email:</strong> {profileInfo.email}
            </Typography>
            
            <Typography variant="body2" align="left">
              <strong>Phone:</strong> {profileInfo.phone}
            </Typography>
            
            <Typography variant="body2" align="left">
              <strong>Member Since:</strong> Jan 15, 2023
            </Typography>
            
            <Typography variant="body2" align="left">
              <strong>Last Login:</strong> Today, 10:30 AM
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Profile Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box component="form" onSubmit={handleProfileSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={profileInfo.firstName}
                    onChange={handleProfileChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={profileInfo.lastName}
                    onChange={handleProfileChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={profileInfo.email}
                    onChange={handleProfileChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={profileInfo.phone}
                    onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    name="jobTitle"
                    value={profileInfo.jobTitle}
                    onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={profileInfo.department}
                    onChange={handleProfileChange}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Change Password
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box component="form" onSubmit={handlePasswordSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type={showPassword.currentPassword ? 'text' : 'password'}
                    value={passwordInfo.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('currentPassword')}
                            edge="end"
                          >
                            {showPassword.currentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type={showPassword.newPassword ? 'text' : 'password'}
                    value={passwordInfo.newPassword}
                    onChange={handlePasswordChange}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('newPassword')}
                            edge="end"
                          >
                            {showPassword.newPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showPassword.confirmPassword ? 'text' : 'password'}
                    value={passwordInfo.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('confirmPassword')}
                            edge="end"
                          >
                            {showPassword.confirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Update Password
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default UserProfile;
