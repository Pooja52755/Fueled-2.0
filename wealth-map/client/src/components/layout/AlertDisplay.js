import React, { useContext, memo } from 'react';
import { AlertContext } from '../../context/AlertContext';
import { 
  Snackbar, 
  Alert, 
  Stack
} from '@mui/material';

const AlertDisplay = () => {
  const { alerts, removeAlert } = useContext(AlertContext);

  const handleClose = (id) => (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    removeAlert(id);
  };

  // Use a simpler implementation to avoid transition issues
  return (
    <Stack 
      spacing={2} 
      sx={{ 
        position: 'fixed', 
        bottom: 24, 
        right: 24, 
        zIndex: 2000,
        maxWidth: '100%',
        width: '350px'
      }}
    >
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          onClose={() => removeAlert(alert.id)}
          severity={alert.type}
          variant="filled"
          sx={{ 
            width: '100%', 
            mb: 1,
            boxShadow: 3
          }}
        >
          {alert.message}
        </Alert>
      ))}
    </Stack>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(AlertDisplay);
