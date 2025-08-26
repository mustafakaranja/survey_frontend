import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store/store';
import { initializeAuth, logout } from './store/authSlice';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import AdminScreen from './components/AdminScreen';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e91e63', // Material Dashboard pink
      light: '#f8bbd9',
      dark: '#ad1457',
    },
    secondary: {
      main: '#9c27b0', // Purple
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#00bcd4',
      light: '#4dd0e1',
      dark: '#0097a7',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#344767',
      secondary: '#67748e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 300,
      color: '#344767',
    },
    h2: {
      fontSize: '2.125rem',
      fontWeight: 300,
      color: '#344767',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 400,
      color: '#344767',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#344767',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#344767',
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#344767',
      textTransform: 'uppercase',
      letterSpacing: '0.0625rem',
    },
    body1: {
      fontSize: '0.875rem',
      color: '#67748e',
    },
    body2: {
      fontSize: '0.75rem',
      color: '#67748e',
    },
    button: {
      fontWeight: 700,
      textTransform: 'uppercase',
      fontSize: '0.75rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2)',
    '0px 3px 1px -2px rgba(0,0,0,0.2)',
    '0px 3px 3px -2px rgba(0,0,0,0.2)',
    '0px 2px 4px -1px rgba(0,0,0,0.2)',
    '0px 3px 5px -1px rgba(0,0,0,0.2)',
    '0px 3px 5px -1px rgba(0,0,0,0.2)',
    '0px 4px 5px -2px rgba(0,0,0,0.2)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
    '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          boxShadow: '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)',
          border: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          textTransform: 'none',
          fontWeight: 700,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          background: 'linear-gradient(195deg, #42424a, #191919)',
          '&:hover': {
            background: 'linear-gradient(195deg, #42424a, #191919)',
            opacity: 0.85,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          backgroundImage: 'linear-gradient(195deg, #42424a, #191919)',
          boxShadow: '0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// App Router Component
function AppRouter() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth state from localStorage on app start
    dispatch(initializeAuth());
  }, [dispatch]);

  // Debug: Log authentication state changes
  useEffect(() => {
    console.log('Authentication state changed:', { isAuthenticated, user: user?.username });
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    dispatch(logout());
    console.log('User logged out and tokens cleared');
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
              <LoginScreen /> : 
              <Navigate to={user?.role === 'admin' ? "/admin" : "/home"} replace />
            } 
          />
          <Route 
            path="/home" 
            element={
              isAuthenticated ? 
              <HomeScreen user={user} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/admin" 
            element={
              isAuthenticated && user?.role === 'admin' ? 
              <AdminScreen user={user} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? (user?.role === 'admin' ? "/admin" : "/home") : "/login"} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

// Main App Component with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRouter />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
