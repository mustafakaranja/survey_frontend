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
    
    try {
      const result = await dispatch(loginUser(formData)).unwrap();
      console.log('Login successful:', result);
      
      // Force immediate navigation on successful login
      console.log('Login successful, forcing navigation to /home');
      navigate('/home');
      
    } catch (err) {
      console.error('Login failed:', err);
      // Error is handled by Redux, no need to set local error state
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

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Demo Credentials:
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Field Agent:</strong> john_doe | 1234
              </Typography>
              <Typography variant="body2">
                <strong>Field Agent:</strong> jane_smith | 5678
              </Typography>
              <Typography variant="body2" sx={{ color: 'primary.main' }}>
                <strong>Admin:</strong> admin | admin123
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginScreen;
