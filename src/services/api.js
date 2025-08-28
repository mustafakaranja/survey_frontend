import axios from 'axios';

// Base URL for the API - automatically detects environment
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://surveybackend-production-8dbc.up.railway.app'
  : 'http://localhost:5001';

console.log('Environment:', process.env.NODE_ENV);
console.log('API Base URL:', BASE_URL);

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
  },

  // Add hotel for user
  addHotel: async (hotelData) => {
    try {
      const response = await api.post('/api/user/addHotel', hotelData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add hotel');
    }
  }
};

// Survey APIs
export const surveyAPI = {
  // Submit survey
  submitSurvey: async (surveyData) => {
    try {
      console.log('Submitting survey data:', surveyData);
      const response = await api.post('/api/submitSurvey', surveyData);
      console.log('Survey submission response:', response);
      console.log('Survey submission response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Survey submission API error:', error);
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
      console.log('Making API call to /api/surveys');
      const response = await api.get('/api/surveys');
      console.log('API Response status:', response.status);
      console.log('API Response data structure:', Object.keys(response.data || {}));
      return response.data;
    } catch (error) {
      console.error('getAllSurveys API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(error.response?.data?.message || 'Failed to get all surveys');
    }
  },

  // Get surveys for current user
  getSurveys: async () => {
    try {
      const response = await api.get('/api/surveys');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get surveys');
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
  },

  // Delete survey by ID
  deleteSurvey: async (surveyId) => {
    try {
      const response = await api.delete(`/api/survey/${surveyId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete survey');
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
  
  // Handle CORS errors
  if (error.message?.includes('CORS') || error.code === 'ERR_NETWORK') {
    return 'CORS error: Backend server needs to allow requests from this domain. Please check backend CORS configuration.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

// Add a health check method for debugging production issues
export const healthCheck = async () => {
  try {
    console.log('Performing health check...');
    const response = await api.get('/health');
    console.log('Health check successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Health check failed:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Health check failed',
      details: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message
      }
    };
  }
};

export default api;
