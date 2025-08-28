import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, surveyAPI } from '../services/api';

// Async thunk for fetching user hotels
export const fetchUserHotels = createAsyncThunk(
  'hotels/fetchUserHotels',
  async (username, { rejectWithValue }) => {
    try {
      const response = await authAPI.getUserDetails(username);
      if (response.success) {
        return transformHotelData(response.user.hotels);
      }
      return rejectWithValue(response.message || 'Failed to fetch hotels');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for adding a hotel
export const addHotel = createAsyncThunk(
  'hotels/addHotel',
  async ({ username, hotelName, address }, { rejectWithValue }) => {
    try {
      const response = await authAPI.addHotel({ username, hotelName, address });
      if (response.success) {
        // Return the new hotel data
        return { name: hotelName, address, completed: false };
      }
      return rejectWithValue(response.message || 'Failed to add hotel');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching surveyed hotels
export const fetchSurveyedHotels = createAsyncThunk(
  'hotels/fetchSurveyedHotels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await surveyAPI.getSurveys();
      
      // Handle different response formats
      if (response.status === 'success' && response.data) {
        return response.data;
      } else if (response.success && response.surveys) {
        return response.surveys;
      } else if (Array.isArray(response)) {
        return response;
      }
      
      return rejectWithValue('No survey data found');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for submitting a survey
export const submitSurvey = createAsyncThunk(
  'hotels/submitSurvey',
  async ({ hotelName, surveyData, username }, { rejectWithValue }) => {
    try {
      const response = await surveyAPI.submitSurvey({ hotelName, surveyData, username });
      if (response.success) {
        // Create a properly formatted survey entry for the surveyed hotels list
        const surveyEntry = {
          _id: `survey_${Date.now()}`,
          username,
          hotelName,
          surveyData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return { hotelName, surveyData, username, surveyEntry };
      }
      return rejectWithValue(response.message || 'Failed to submit survey');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to transform hotel data
const transformHotelData = (hotels) => {
  if (!hotels || !Array.isArray(hotels)) return [];
  
  return hotels.map((hotel, index) => {
    if (typeof hotel === 'string') {
      return {
        name: hotel,
        address: '',
        completed: false,
        id: index
      };
    } else {
      return {
        name: hotel.name || '',
        address: hotel.address || '',
        completed: hotel.completed || false,
        id: index,
        lat: hotel.lat,
        lng: hotel.lng
      };
    }
  });
};

const hotelsSlice = createSlice({
  name: 'hotels',
  initialState: {
    userHotels: [],
    surveyedHotels: [],
    loading: false,
    error: null,
    addingHotel: false,
    submittingSurvey: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUserHotels: (state, action) => {
      const transformedHotels = transformHotelData(action.payload);
      state.userHotels = transformedHotels;
    },
    markHotelCompleted: (state, action) => {
      const hotelName = action.payload;
      const hotel = state.userHotels.find(h => h.name === hotelName);
      if (hotel) {
        hotel.completed = true;
      }
    },
    updateHotelCompletionStatus: (state) => {
      // Update completion status based on surveyed hotels
      state.userHotels.forEach(hotel => {
        const isSurveyed = state.surveyedHotels.some(survey => 
          (survey.surveyData?.hotelName || survey.hotelName) === hotel.name
        );
        hotel.completed = isSurveyed;
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user hotels
      .addCase(fetchUserHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserHotels.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Redux - fetchUserHotels fulfilled, raw payload:', action.payload);
        const transformedHotels = transformHotelData(action.payload);
        console.log('Redux - transformed hotels:', transformedHotels);
        state.userHotels = transformedHotels;
        console.log('Redux - final state.userHotels:', state.userHotels);
      })
      .addCase(fetchUserHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add hotel
      .addCase(addHotel.pending, (state) => {
        state.addingHotel = true;
        state.error = null;
      })
      .addCase(addHotel.fulfilled, (state, action) => {
        state.addingHotel = false;
        // Add the new hotel to the list immediately
        const newHotel = {
          ...action.payload,
          id: state.userHotels.length
        };
        state.userHotels.push(newHotel);
      })
      .addCase(addHotel.rejected, (state, action) => {
        state.addingHotel = false;
        state.error = action.payload;
      })
      // Fetch surveyed hotels
      .addCase(fetchSurveyedHotels.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSurveyedHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.surveyedHotels = action.payload;
        // Update completion status when surveyed hotels are fetched
        state.userHotels.forEach(hotel => {
          const isSurveyed = action.payload.some(survey => {
            const surveyHotelName = survey.hotelName || survey.surveyData?.hotelName || survey.name;
            return surveyHotelName === hotel.name;
          });
          hotel.completed = isSurveyed;
        });
      })
      .addCase(fetchSurveyedHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit survey
      .addCase(submitSurvey.pending, (state) => {
        state.submittingSurvey = true;
        state.error = null;
      })
      .addCase(submitSurvey.fulfilled, (state, action) => {
        state.submittingSurvey = false;
        const { hotelName, surveyEntry } = action.payload;
        // Mark the hotel as completed immediately
        const hotel = state.userHotels.find(h => h.name === hotelName);
        if (hotel) {
          hotel.completed = true;
        }
        // Add to surveyed hotels list with proper structure
        state.surveyedHotels.push(surveyEntry);
      })
      .addCase(submitSurvey.rejected, (state, action) => {
        state.submittingSurvey = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUserHotels, markHotelCompleted, updateHotelCompletionStatus } = hotelsSlice.actions;
export default hotelsSlice.reducer;
