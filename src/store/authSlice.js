import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../services/api';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Redux: Calling authAPI.login with:', credentials);
      const response = await authAPI.login(credentials);
      console.log('Redux: Got API response:', response);
      
      // If we get any response (API call was successful), process it
      if (response) {
        console.log('Redux: API call successful, processing response...');
        
        // Extract user data - handle both formats
        const userData = response.user || response;
        const token = response.token;
        
        // Store token if provided
        if (token) {
          localStorage.setItem('auth_token', token);
          console.log('Redux: Token stored');
        }
        
        // Store user data
        localStorage.setItem('hotelSurveyUser', JSON.stringify(userData));
        console.log('Redux: User data stored');
        
        return {
          user: userData,
          token: token
        };
      } else {
        console.log('Redux: No response received');
        return rejectWithValue('No response received');
      }
    } catch (error) {
      console.error('Redux: Login error:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    // Initialize auth state from localStorage
    initializeAuth: (state) => {
      const savedUser = localStorage.getItem('hotelSurveyUser');
      const savedToken = localStorage.getItem('auth_token');
      
      if (savedUser && savedToken) {
        state.user = JSON.parse(savedUser);
        state.token = savedToken;
        state.isAuthenticated = true;
      } else {
        // Clear partial data
        localStorage.removeItem('hotelSurveyUser');
        localStorage.removeItem('auth_token');
      }
    },
    
    // Logout action
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('hotelSurveyUser');
      localStorage.removeItem('auth_token');
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login pending
      .addCase(loginUser.pending, (state) => {
        console.log('Redux: Login pending...');
        state.loading = true;
        state.error = null;
      })
      
      // Login fulfilled
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('Redux: Login fulfilled with payload:', action.payload);
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        console.log('Redux: Authentication state updated to true');
      })
      
      // Login rejected
      .addCase(loginUser.rejected, (state, action) => {
        console.log('Redux: Login rejected with error:', action.payload);
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  }
});

export const { initializeAuth, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
