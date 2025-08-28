import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import hotelsReducer from './hotelsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hotels: hotelsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
