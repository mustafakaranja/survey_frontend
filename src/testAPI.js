// Test script to check getAllSurveys API response structure
import { surveyAPI } from './services/api';

export const testGetAllSurveys = async () => {
  try {
    console.log('Testing getAllSurveys API...');
    const response = await surveyAPI.getAllSurveys();
    
    console.log('=== API Response Structure ===');
    console.log('Full response:', response);
    console.log('Response type:', typeof response);
    console.log('Is array:', Array.isArray(response));
    
    if (response && typeof response === 'object') {
      console.log('Response keys:', Object.keys(response));
      
      if (response.success) {
        console.log('Success response with surveys:', response.surveys?.length || 0);
        if (response.surveys && response.surveys.length > 0) {
          console.log('First survey structure:', response.surveys[0]);
          console.log('First survey keys:', Object.keys(response.surveys[0]));
        }
      } else if (Array.isArray(response)) {
        console.log('Direct array response with', response.length, 'items');
        if (response.length > 0) {
          console.log('First item structure:', response[0]);
          console.log('First item keys:', Object.keys(response[0]));
        }
      }
    }
    
    return response;
  } catch (error) {
    console.error('API Test Error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Auto-run test if this file is loaded directly
if (typeof window !== 'undefined') {
  window.testGetAllSurveys = testGetAllSurveys;
  console.log('Added testGetAllSurveys to window object. You can run it in console.');
}
