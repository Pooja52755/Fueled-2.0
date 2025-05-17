import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress
} from '@mui/material';

const MfaVerification = ({ onSuccess, onCancel }) => {
  // Only use verifyMfa from AuthContext, avoid using requireMfa state here
  const { verifyMfa, tempEmail } = useContext(AuthContext);
  const { error: showError, success: showSuccess } = useContext(AlertContext);
  
  const [mfaCode, setMfaCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
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
      const result = await verifyMfa(mfaCode);
      
      if (result.success) {
        showSuccess('Verification successful');
        if (onSuccess) {
          onSuccess();
        }
      } else if (result.error) {
        setError(result.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      showError('Verification failed. Please try again.');
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
              variant="outlined"
              color="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default MfaVerification;
