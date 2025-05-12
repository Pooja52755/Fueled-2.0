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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';

const CompanySettings = () => {
  const { user } = useContext(AuthContext);
  const { success: showSuccess, error: showError } = useContext(AlertContext);
  
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Your Company Name',
    email: 'company@example.com',
    phone: '(555) 123-4567',
    address: '123 Business Ave, Suite 100',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    website: 'www.yourcompany.com',
    industry: 'real-estate',
    subscriptionPlan: 'professional',
    apiKey: 'api_key_12345',
    dataPreferences: {
      enablePropertyAlerts: true,
      enableOwnerAlerts: true,
      enableMarketReports: true,
      dataRefreshFrequency: 'daily'
    }
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo({
      ...companyInfo,
      [name]: value
    });
  };
  
  const handleDataPreferenceChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    
    setCompanyInfo({
      ...companyInfo,
      dataPreferences: {
        ...companyInfo.dataPreferences,
        [name]: newValue
      }
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real implementation, this would call the backend API
    // For now, we'll just show a success message
    showSuccess('Company settings updated successfully');
  };
  
  const regenerateApiKey = () => {
    // In a real implementation, this would call the backend API
    // For now, we'll just update the state with a mock API key
    const newApiKey = 'api_key_' + Math.random().toString(36).substring(2, 10);
    
    setCompanyInfo({
      ...companyInfo,
      apiKey: newApiKey
    });
    
    showSuccess('API key regenerated successfully');
  };
  
  return (
    <Layout title="Company Settings">
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Company Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                name="name"
                value={companyInfo.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Email"
                name="email"
                type="email"
                value={companyInfo.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={companyInfo.phone}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={companyInfo.website}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={companyInfo.address}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={companyInfo.city}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={companyInfo.state}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Zip Code"
                name="zipCode"
                value={companyInfo.zipCode}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  name="industry"
                  value={companyInfo.industry}
                  onChange={handleInputChange}
                  label="Industry"
                >
                  <MenuItem value="real-estate">Real Estate</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                  <MenuItem value="legal">Legal</MenuItem>
                  <MenuItem value="government">Government</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Subscription Plan</InputLabel>
                <Select
                  name="subscriptionPlan"
                  value={companyInfo.subscriptionPlan}
                  onChange={handleInputChange}
                  label="Subscription Plan"
                >
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="professional">Professional</MenuItem>
                  <MenuItem value="enterprise">Enterprise</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4 }}>
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
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          API Access
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="API Key"
              value={companyInfo.apiKey}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="outlined"
              color="primary"
              onClick={regenerateApiKey}
              sx={{ height: '56px' }}
            >
              Regenerate API Key
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Data Preferences
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={companyInfo.dataPreferences.enablePropertyAlerts}
                  onChange={handleDataPreferenceChange}
                  name="enablePropertyAlerts"
                  color="primary"
                />
              }
              label="Enable Property Alerts"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={companyInfo.dataPreferences.enableOwnerAlerts}
                  onChange={handleDataPreferenceChange}
                  name="enableOwnerAlerts"
                  color="primary"
                />
              }
              label="Enable Owner Alerts"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={companyInfo.dataPreferences.enableMarketReports}
                  onChange={handleDataPreferenceChange}
                  name="enableMarketReports"
                  color="primary"
                />
              }
              label="Enable Market Reports"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Data Refresh Frequency</InputLabel>
              <Select
                name="dataRefreshFrequency"
                value={companyInfo.dataPreferences.dataRefreshFrequency}
                onChange={handleDataPreferenceChange}
                label="Data Refresh Frequency"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => showSuccess('Data preferences updated successfully')}
              >
                Save Preferences
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Layout>
  );
};

export default CompanySettings;
