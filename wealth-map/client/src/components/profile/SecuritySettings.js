import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import MfaSetup from '../auth/MfaSetup';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { 
  Security, 
  LockOutlined, 
  VerifiedUser, 
  PhoneAndroid,
  Close,
  CheckCircle,
  WarningAmber
} from '@mui/icons-material';

const SecuritySettings = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const { success: showSuccess, error: showError } = useContext(AlertContext);
  
  const [loading, setLoading] = useState(false);
  const [mfaStatus, setMfaStatus] = useState({
    enabled: false,
    pending: false,
    loading: true
  });
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showMfaDisable, setShowMfaDisable] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Get MFA status on component mount
  useEffect(() => {
    getMfaStatus();
  }, []);
  
  const getMfaStatus = async () => {
    try {
      setMfaStatus(prev => ({ ...prev, loading: true }));
      
      const res = await axios.get('/api/mfa/status');
      
      setMfaStatus({
        enabled: res.data.mfaEnabled,
        pending: res.data.mfaPending,
        loading: false
      });
    } catch (err) {
      showError('Failed to get MFA status');
      setMfaStatus({
        enabled: false,
        pending: false,
        loading: false
      });
    }
  };
  
  const handleMfaSetupComplete = () => {
    setShowMfaSetup(false);
    getMfaStatus();
    showSuccess('Two-factor authentication has been enabled');
  };
  
  const handleDisableMfa = async () => {
    if (!mfaCode) {
      setError('Please enter verification code');
      return;
    }
    
    if (!password) {
      setError('Please enter your password');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await axios.post('/api/mfa/disable', { token: mfaCode, password });
      
      setShowMfaDisable(false);
      getMfaStatus();
      showSuccess('Two-factor authentication has been disabled');
      
      // Reset fields
      setMfaCode('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };
  
  const handleMfaCodeChange = (e) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '');
    setMfaCode(value);
    if (error) setError('');
  };
  
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Security sx={{ mr: 1 }} /> Security Settings
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Two-Factor Authentication (2FA)
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Add an extra layer of security to your account by requiring a verification code in addition to your password when you sign in.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              {mfaStatus.enabled ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  Two-factor authentication is enabled
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningAmber color="warning" sx={{ mr: 1 }} />
                  Two-factor authentication is disabled
                </Box>
              )}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {mfaStatus.enabled 
                ? 'Your account is protected with an authenticator app.' 
                : 'Enable 2FA to add an extra layer of security to your account.'}
            </Typography>
          </Box>
          
          {mfaStatus.loading ? (
            <CircularProgress size={24} />
          ) : mfaStatus.enabled ? (
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => setShowMfaDisable(true)}
            >
              Disable
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setShowMfaSetup(true)}
              startIcon={<LockOutlined />}
            >
              Enable
            </Button>
          )}
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Password Security
        </Typography>
        
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            Password last changed
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user?.securitySettings?.lastPasswordChange 
              ? new Date(user.securitySettings.lastPasswordChange).toLocaleDateString() 
              : 'Never'}
          </Typography>
        </Box>
        
        <Button 
          variant="outlined" 
          color="primary"
          component="a"
          href="/change-password"
        >
          Change Password
        </Button>
      </Paper>
      
      {/* MFA Setup Dialog */}
      <Dialog
        open={showMfaSetup}
        onClose={() => setShowMfaSetup(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Setup Two-Factor Authentication</Typography>
            <IconButton onClick={() => setShowMfaSetup(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <MfaSetup onComplete={handleMfaSetupComplete} />
        </DialogContent>
      </Dialog>
      
      {/* MFA Disable Dialog */}
      <Dialog
        open={showMfaDisable}
        onClose={() => setShowMfaDisable(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Disable Two-Factor Authentication</Typography>
            <IconButton onClick={() => setShowMfaDisable(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="error" paragraph>
            Warning: Disabling two-factor authentication will make your account less secure.
          </Typography>
          
          <Typography variant="body2" paragraph>
            To disable two-factor authentication, please enter your password and a verification code from your authenticator app.
          </Typography>
          
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            type="password"
            id="password"
            label="Password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            error={!!error}
          />
          
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="mfaCode"
            label="Verification Code"
            name="mfaCode"
            autoComplete="one-time-code"
            value={mfaCode}
            onChange={handleMfaCodeChange}
            error={!!error}
            helperText={error}
            inputProps={{ maxLength: 6 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMfaDisable(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDisableMfa} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Disable 2FA'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings;
