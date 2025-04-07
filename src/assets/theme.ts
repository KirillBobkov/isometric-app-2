import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6bc2ff', // Primary blue color
      light: '#42A5F5',
      dark: '#004BA0',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#FFC107', // Amber color
      light: '#FFE082',
      dark: '#FFA000',
      contrastText: '#000000'
    },
    background: {
      default: '#000000', // Dark background
      paper: '#121212' // Slightly lighter background for cards and papers
    },
    text: {
      primary: '#FFFFFF', // Main text color
      secondary: '#8b8b8b', // Secondary text color
      disabled: '#BDBDBD' // Disabled text color
    },
    divider: '#424242', // Divider color
    action: {
      active: '#FFFFFF', // Active icon color
      hover: '#616161', // Hover state color
      selected: '#37474F', // Selected state color
      disabled: '#616161', // Disabled state color
      disabledBackground: '#303030' // Background for disabled states
    }
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: 14,
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem'
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem'
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.5rem'
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem'
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem'
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E', // App bar background
          color: '#FFFFFF' // App bar text color
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            boxShadow: 'none'
          }
        },
        containedPrimary: {
          backgroundColor: '#1976D2',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#004BA0'
          }
        },
        containedSecondary: {
          backgroundColor: '#FFC107',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#FFA000'
          }
        }
      }
    }
  }
});