import React, { createContext, useContext, useState } from 'react';
import { Alert, AlertColor, Snackbar } from '@mui/material';

type NotificationContextType = {
  showNotification: (message: string, severity: AlertColor) => void;
};

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const showNotification = (message: string, severity: AlertColor = 'info') => {
    setMessage(message);
    setSeverity(severity);
    setOpen(true);
  };

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  // Определяем цвет фона в зависимости от типа оповещения
  const getAlertStyle = (severity: AlertColor) => {
    const colors = {
      success: '#43a047',
      error: '#d32f2f',
      warning: '#f57c00',
      info: '#2196f3'
    };
    
    return {
      marginTop: '20px',
      width: '100%',
      backgroundColor: colors[severity],
      color: '#fff',
      '& .MuiAlert-icon': {
        color: '#fff'
      }
    };
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleClose} 
          severity={severity} 
          variant="filled"
          sx={getAlertStyle(severity)}
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}; 