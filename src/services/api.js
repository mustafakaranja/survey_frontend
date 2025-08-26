import axios from 'axios';

// Base URL for the API - automatically detects environment
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://surveybackend-production-8dbc.up.railway.app'
  : 'http://localhost:5001';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for logging and auth
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/api/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Get user details
  getUserDetails: async (username) => {
    try {
      const response = await api.get(`/api/user/${username}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user details');
    }
  }
};

// Survey APIs
export const surveyAPI = {
  // Submit survey
  submitSurvey: async (surveyData) => {
    try {
      const response = await api.post('/api/submitSurvey', surveyData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit survey');
    }
  },

  // Get surveys by username
  getSurveysByUser: async (username) => {
    try {
      const response = await api.get(`/api/surveys/${username}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user surveys');
    }
  },

  // Get survey by hotel name
  getSurveyByHotel: async (hotelName) => {
    try {
      const encodedHotelName = encodeURIComponent(hotelName);
      const response = await api.get(`/api/hotelSurvey/${encodedHotelName}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get hotel survey');
    }
  },

  // Get all surveys (Admin only)
  getAllSurveys: async () => {
    try {
      const response = await api.get('/api/surveys');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get all surveys');
    }
  },

  // Get survey statistics
  getStats: async () => {
    try {
      const response = await api.get('/api/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get statistics');
    }
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      throw new Error('Backend server is not responding');
    }
  }
};

// Error handling utility
export const handleAPIError = (error) => {
  if (error.code === 'ECONNREFUSED') {
    return 'Cannot connect to server. Please ensure the backend is running on port 5001.';
  }
  
  if (error.response?.status === 401) {
    return 'Unauthorized. Please login again.';
  }
  
  if (error.response?.status === 404) {
    return 'Resource not found.';
  }
  
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

export default api;
