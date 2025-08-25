import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store/store';
import { initializeAuth, logout } from './store/authSlice';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
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
        {/* Debug info */}
        <div style={{ position: 'fixed', top: 0, left: 0, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '5px', fontSize: '12px', zIndex: 9999 }}>
          Auth: {isAuthenticated ? 'Yes' : 'No'} | User: {user?.username || 'None'}
        </div>
        
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
              <LoginScreen /> : 
              <Navigate to="/home" replace />
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
            path="/" 
            element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} 
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
