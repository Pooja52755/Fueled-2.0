import React, { createContext, useState } from 'react';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Add alert
  const addAlert = (message, type = 'info', timeout = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newAlert = {
      id,
      message,
      type,
      timestamp: new Date()
    };
    
    setAlerts(prevAlerts => [...prevAlerts, newAlert]);
    
    // Auto remove alert after timeout
    if (timeout > 0) {
      setTimeout(() => removeAlert(id), timeout);
    }
    
    return id;
  };

  // Remove alert
  const removeAlert = (id) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  };

  // Clear all alerts
  const clearAlerts = () => {
    setAlerts([]);
  };

  // Convenience methods for different alert types
  const success = (message, timeout = 5000) => addAlert(message, 'success', timeout);
  const error = (message, timeout = 5000) => addAlert(message, 'error', timeout);
  const warning = (message, timeout = 5000) => addAlert(message, 'warning', timeout);
  const info = (message, timeout = 5000) => addAlert(message, 'info', timeout);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        addAlert,
        removeAlert,
        clearAlerts,
        success,
        error,
        warning,
        info
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};
