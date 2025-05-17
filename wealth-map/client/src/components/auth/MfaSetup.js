import React, { useState, useContext, useEffect } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  Grid
} from '@mui/material';

const steps = ['Generate Secret', 'Verify Code'];

const MfaSetup = ({ onComplete }) => {
  const { user } = useContext(AuthContext);
  const { success: showSuccess, error: showError } = useContext(AlertContext);
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (activeStep === 0) {
      generateSecret();
    }
  }, [activeStep]);
  
  const generateSecret = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await axios.post('/api/mfa/setup');
      
      setSecret(res.data.secret);
      setQrCode(res.data.qrCode);
      
      showSuccess('MFA secret generated successfully');
    } catch (err) {
      setError('Failed to generate MFA secret');
      showError(err.response?.data?.msg || 'Failed to generate MFA secret');
    } finally {
      setLoading(false);
    }
  };
  
  const verifyCode = async () => {
    if (!verificationCode) {
      setError('Please enter verification code');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await axios.post('/api/mfa/verify-setup', { token: verificationCode });
      
      showSuccess('MFA enabled successfully');
      setActiveStep(2);
      
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid verification code');
      showError(err.response?.data?.msg || 'Failed to verify MFA code');
    } finally {
      setLoading(false);
    }
  };
  
  const handleNext = () => {
    if (activeStep === 0) {
      setActiveStep(1);
    } else if (activeStep === 1) {
      verifyCode();
    }
  };
  
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };
  
  const handleVerificationCodeChange = (e) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '');
    setVerificationCode(value);
    setError('');
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
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Setup Two-Factor Authentication
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {activeStep === 0 && (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Scan QR Code
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </Typography>
              
              {loading ? (
                <CircularProgress sx={{ my: 4 }} />
              ) : (
                <>
                  {qrCode && (
                    <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
                      <img src={qrCode} alt="QR Code" style={{ maxWidth: '200px' }} />
                    </Box>
                  )}
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Or enter this code manually:
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      letterSpacing: 1,
                      backgroundColor: '#f5f5f5',
                      padding: 1,
                      borderRadius: 1,
                      my: 1
                    }}
                  >
                    {secret}
                  </Typography>
                </>
              )}
            </Box>
          )}
          
          {activeStep === 1 && (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Verify Code
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Enter the 6-digit code from your authenticator app to verify setup
              </Typography>
              
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="verificationCode"
                label="Verification Code"
                name="verificationCode"
                autoComplete="one-time-code"
                autoFocus
                value={verificationCode}
                onChange={handleVerificationCodeChange}
                error={!!error}
                helperText={error}
                inputProps={{ maxLength: 6 }}
                sx={{ maxWidth: '300px', mx: 'auto' }}
              />
            </Box>
          )}
          
          {activeStep === 2 && (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Setup Complete
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Two-factor authentication has been successfully enabled for your account
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, width: '100%' }}>
            <Button
              color="inherit"
              disabled={activeStep === 0 || activeStep === 2 || loading}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep !== 2 && (
              <Button 
                variant="contained" 
                onClick={handleNext}
                disabled={loading || (activeStep === 0 && !qrCode)}
              >
                {loading ? <CircularProgress size={24} /> : activeStep === 1 ? 'Verify' : 'Next'}
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default MfaSetup;
