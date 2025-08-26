import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Avatar,
  CircularProgress
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { loginUser, clearError } from '../store/authSlice';
import { authAPI } from '../services/api';

const LoginScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, user } = useSelector((state) => {
    console.log('LoginScreen: Current Redux state:', state.auth);
    return state.auth;
  });
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  console.log('LoginScreen: Render state:', { loading, error, isAuthenticated, user: user?.username });

  // Navigate to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User already authenticated, navigating to home');
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Attempting login with:', { username: formData.username });
    
    // Handle admin login
    if (formData.username === 'admin' && formData.password === 'abc') {
      console.log('Admin login detected');
      
      // Create admin user object
      const adminUser = {
        username: 'admin',
        password: 'abc',
        role: 'admin',
        group: 'Administration',
        hotels: [],
        permissions: [
          'view_all_surveys',
          'export_data',
          'manage_users',
          'system_admin'
        ],
        lastLogin: new Date().toISOString()
      };
      
      // Store admin user data
      localStorage.setItem('hotelSurveyUser', JSON.stringify(adminUser));
      localStorage.setItem('auth_token', `admin_token_${Date.now()}`);
      
      // Update Redux state
      dispatch(loginUser(formData));
      
      console.log('Admin user logged in:', adminUser);
      console.log('Redirecting to admin panel');
      navigate('/admin');
      return;
    }
    
    // Regular user login flow
    try {
      const response = await authAPI.login(formData);
      console.log('API response received:', response);
      
      // If we get any response (200 status), redirect immediately
      if (response) {
        console.log('Login successful - redirecting based on user role');
        console.log('User role:', response.user?.role);
        
        // Determine if response has user object or is the user object itself
        const userData = response.user || response;
        
        // Store user data for the app
        localStorage.setItem('hotelSurveyUser', JSON.stringify(userData));
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
        }
        
        // Update Redux state
        dispatch(loginUser(formData));
        
        // Redirect based on user role
        if (userData.role === 'admin') {
          console.log('Admin user detected - redirecting to admin panel');
          navigate('/admin');
        } else {
          console.log('Regular user - redirecting to home page');
          navigate('/home');
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
      dispatch(clearError());
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
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h4" gutterBottom>
              Hotel Survey
            </Typography>
            <Typography component="h2" variant="h6" color="textSecondary" gutterBottom>
              Field Agent Login
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginScreen;
