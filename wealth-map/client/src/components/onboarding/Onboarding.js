import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import Layout from '../layout/Layout';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  CardActionArea
} from '@mui/material';

const steps = [
  'Welcome',
  'Company Information',
  'Data Preferences',
  'Select Plan',
  'Complete'
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { success: showSuccess, error: showError } = useContext(AlertContext);
  
  const [activeStep, setActiveStep] = useState(0);
  
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    industry: '',
    size: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: ''
  });
  
  const [dataPreferences, setDataPreferences] = useState({
    propertyTypes: [],
    regions: [],
    ownerTypes: [],
    enableAlerts: true,
    alertFrequency: 'daily',
    dataRefreshFrequency: 'daily'
  });
  
  const [selectedPlan, setSelectedPlan] = useState('professional');
  
  const handleNext = () => {
    if (activeStep === 0) {
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Validate company information
      if (!companyInfo.name || !companyInfo.industry) {
        showError('Please fill in all required fields');
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      // Validate data preferences
      if (dataPreferences.propertyTypes.length === 0 || dataPreferences.regions.length === 0) {
        showError('Please select at least one property type and region');
        return;
      }
      setActiveStep(3);
    } else if (activeStep === 3) {
      // Validate plan selection
      if (!selectedPlan) {
        showError('Please select a subscription plan');
        return;
      }
      
      // In a real implementation, this would call the backend API to save all settings
      // For now, we'll just show a success message and move to the final step
      showSuccess('Onboarding completed successfully');
      setActiveStep(4);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleFinish = () => {
    navigate('/');
  };
  
  const handleCompanyInfoChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo({
      ...companyInfo,
      [name]: value
    });
  };
  
  const handleDataPreferenceChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (type === 'checkbox') {
      setDataPreferences({
        ...dataPreferences,
        [name]: checked
      });
    } else {
      setDataPreferences({
        ...dataPreferences,
        [name]: value
      });
    }
  };
  
  const handlePropertyTypeToggle = (type) => {
    const currentIndex = dataPreferences.propertyTypes.indexOf(type);
    const newPropertyTypes = [...dataPreferences.propertyTypes];
    
    if (currentIndex === -1) {
      newPropertyTypes.push(type);
    } else {
      newPropertyTypes.splice(currentIndex, 1);
    }
    
    setDataPreferences({
      ...dataPreferences,
      propertyTypes: newPropertyTypes
    });
  };
  
  const handleRegionToggle = (region) => {
    const currentIndex = dataPreferences.regions.indexOf(region);
    const newRegions = [...dataPreferences.regions];
    
    if (currentIndex === -1) {
      newRegions.push(region);
    } else {
      newRegions.splice(currentIndex, 1);
    }
    
    setDataPreferences({
      ...dataPreferences,
      regions: newRegions
    });
  };
  
  const handleOwnerTypeToggle = (type) => {
    const currentIndex = dataPreferences.ownerTypes.indexOf(type);
    const newOwnerTypes = [...dataPreferences.ownerTypes];
    
    if (currentIndex === -1) {
      newOwnerTypes.push(type);
    } else {
      newOwnerTypes.splice(currentIndex, 1);
    }
    
    setDataPreferences({
      ...dataPreferences,
      ownerTypes: newOwnerTypes
    });
  };
  
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h4" gutterBottom>
              Welcome to Wealth Map!
            </Typography>
            <Typography variant="body1" paragraph>
              Thank you for choosing Wealth Map for your property and owner intelligence needs.
              Let's get you set up with a few quick steps.
            </Typography>
            <Typography variant="body1">
              This onboarding process will help us customize the platform to your specific needs
              and ensure you get the most value from our services.
            </Typography>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h5" gutterBottom>
              Company Information
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Please provide your company details to help us personalize your experience.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="name"
                  value={companyInfo.name}
                  onChange={handleCompanyInfoChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    name="industry"
                    value={companyInfo.industry}
                    onChange={handleCompanyInfoChange}
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
                  <InputLabel>Company Size</InputLabel>
                  <Select
                    name="size"
                    value={companyInfo.size}
                    onChange={handleCompanyInfoChange}
                    label="Company Size"
                  >
                    <MenuItem value="1-10">1-10 employees</MenuItem>
                    <MenuItem value="11-50">11-50 employees</MenuItem>
                    <MenuItem value="51-200">51-200 employees</MenuItem>
                    <MenuItem value="201-500">201-500 employees</MenuItem>
                    <MenuItem value="501+">501+ employees</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={companyInfo.website}
                  onChange={handleCompanyInfoChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={companyInfo.address}
                  onChange={handleCompanyInfoChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={companyInfo.city}
                  onChange={handleCompanyInfoChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={companyInfo.state}
                  onChange={handleCompanyInfoChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  name="zipCode"
                  value={companyInfo.zipCode}
                  onChange={handleCompanyInfoChange}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h5" gutterBottom>
              Data Preferences
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Select your preferences to customize the data you'll see in Wealth Map.
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Property Types
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.propertyTypes.includes('residential')}
                      onChange={() => handlePropertyTypeToggle('residential')}
                    />
                  }
                  label="Residential"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.propertyTypes.includes('commercial')}
                      onChange={() => handlePropertyTypeToggle('commercial')}
                    />
                  }
                  label="Commercial"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.propertyTypes.includes('industrial')}
                      onChange={() => handlePropertyTypeToggle('industrial')}
                    />
                  }
                  label="Industrial"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.propertyTypes.includes('land')}
                      onChange={() => handlePropertyTypeToggle('land')}
                    />
                  }
                  label="Land"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.propertyTypes.includes('mixed-use')}
                      onChange={() => handlePropertyTypeToggle('mixed-use')}
                    />
                  }
                  label="Mixed-Use"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Regions
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.regions.includes('northeast')}
                      onChange={() => handleRegionToggle('northeast')}
                    />
                  }
                  label="Northeast"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.regions.includes('southeast')}
                      onChange={() => handleRegionToggle('southeast')}
                    />
                  }
                  label="Southeast"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.regions.includes('midwest')}
                      onChange={() => handleRegionToggle('midwest')}
                    />
                  }
                  label="Midwest"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.regions.includes('southwest')}
                      onChange={() => handleRegionToggle('southwest')}
                    />
                  }
                  label="Southwest"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.regions.includes('west')}
                      onChange={() => handleRegionToggle('west')}
                    />
                  }
                  label="West"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Owner Types
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.ownerTypes.includes('individual')}
                      onChange={() => handleOwnerTypeToggle('individual')}
                    />
                  }
                  label="Individual"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.ownerTypes.includes('corporate')}
                      onChange={() => handleOwnerTypeToggle('corporate')}
                    />
                  }
                  label="Corporate"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.ownerTypes.includes('government')}
                      onChange={() => handleOwnerTypeToggle('government')}
                    />
                  }
                  label="Government"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.ownerTypes.includes('non-profit')}
                      onChange={() => handleOwnerTypeToggle('non-profit')}
                    />
                  }
                  label="Non-Profit"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.ownerTypes.includes('trust')}
                      onChange={() => handleOwnerTypeToggle('trust')}
                    />
                  }
                  label="Trust"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataPreferences.enableAlerts}
                      onChange={handleDataPreferenceChange}
                      name="enableAlerts"
                    />
                  }
                  label="Enable Property and Owner Alerts"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!dataPreferences.enableAlerts}>
                  <InputLabel>Alert Frequency</InputLabel>
                  <Select
                    name="alertFrequency"
                    value={dataPreferences.alertFrequency}
                    onChange={handleDataPreferenceChange}
                    label="Alert Frequency"
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Data Refresh Frequency</InputLabel>
                  <Select
                    name="dataRefreshFrequency"
                    value={dataPreferences.dataRefreshFrequency}
                    onChange={handleDataPreferenceChange}
                    label="Data Refresh Frequency"
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h5" gutterBottom>
              Select Your Plan
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Choose the subscription plan that best fits your needs.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card 
                  variant={selectedPlan === 'basic' ? 'elevation' : 'outlined'}
                  elevation={selectedPlan === 'basic' ? 8 : 1}
                  sx={{ 
                    height: '100%',
                    borderColor: selectedPlan === 'basic' ? 'primary.main' : 'inherit'
                  }}
                >
                  <CardActionArea 
                    onClick={() => handlePlanSelect('basic')}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Basic
                      </Typography>
                      <Typography variant="h4" color="primary" gutterBottom>
                        $99/mo
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        Perfect for small teams and individuals
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • Up to 3 users
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • Basic property data
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • Limited search capabilities
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • Weekly data updates
                      </Typography>
                      <Typography variant="body2">
                        • Basic reporting
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card 
                  variant={selectedPlan === 'professional' ? 'elevation' : 'outlined'}
                  elevation={selectedPlan === 'professional' ? 8 : 1}
                  sx={{ 
                    height: '100%',
                    borderColor: selectedPlan === 'professional' ? 'primary.main' : 'inherit',
                    position: 'relative',
                    overflow: 'visible'
                  }}
                >
                  {selectedPlan === 'professional' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -15,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        fontWeight: 'bold'
                      }}
                    >
                      MOST POPULAR
                    </Box>
                  )}
                  <CardActionArea 
                    onClick={() => handlePlanSelect('professional')}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Professional
                      </Typography>
                      <Typography variant="h4" color="primary" gutterBottom>
                        $299/mo
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        Ideal for growing businesses
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • Up to 10 users
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • Advanced property data
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • Full search capabilities
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • Daily data updates
                      </Typography>
                      <Typography variant="body2">
                        • Advanced reporting
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card 
                  variant={selectedPlan === 'enterprise' ? 'elevation' : 'outlined'}
                  elevation={selectedPlan === 'enterprise' ? 8 : 1}
                  sx={{ 
                    height: '100%',
                    borderColor: selectedPlan === 'enterprise' ? 'primary.main' : 'inherit'
                  }}
                >
                  <CardActionArea 
                    onClick={() => handlePlanSelect('enterprise')}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Enterprise
                      </Typography>
                      <Typography variant="h4" color="primary" gutterBottom>
                        $999/mo
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        For large organizations with advanced needs
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • Unlimited users
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • Premium property and owner data
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • API access
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • Real-time data updates
                      </Typography>
                      <Typography variant="body2">
                        • Custom reporting and analytics
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      case 4:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h4" gutterBottom>
              Onboarding Complete!
            </Typography>
            <Typography variant="body1" paragraph>
              Congratulations! You've successfully set up your Wealth Map account.
            </Typography>
            <Typography variant="body1" paragraph>
              Your selected plan ({selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}) is now active.
            </Typography>
            <Typography variant="body1">
              Click "Finish" to start exploring the Wealth Map platform.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };
  
  return (
    <Layout title="Onboarding">
      <Paper elevation={2} sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleFinish}
            >
              Finish
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Layout>
  );
};

export default Onboarding;
