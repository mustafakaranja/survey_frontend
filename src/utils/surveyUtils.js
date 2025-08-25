// Utility functions for managing hotel survey data

export const getSurveyData = (hotelName) => {
  const surveys = JSON.parse(localStorage.getItem('hotelSurveys') || '{}');
  return surveys[hotelName] || null;
};

export const saveSurveyData = (hotelName, surveyData, username) => {
  const surveys = JSON.parse(localStorage.getItem('hotelSurveys') || '{}');
  surveys[hotelName] = {
    ...surveyData,
    submittedAt: new Date().toISOString(),
    submittedBy: username
  };
  localStorage.setItem('hotelSurveys', JSON.stringify(surveys));
  return surveys[hotelName];
};

export const getAllSurveys = () => {
  return JSON.parse(localStorage.getItem('hotelSurveys') || '{}');
};

export const updateUserHotelStatus = (user, hotelName, completed = true) => {
  const updatedHotels = user.hotels.map(hotel => 
    hotel.name === hotelName 
      ? { ...hotel, completed }
      : hotel
  );
  
  const updatedUser = { ...user, hotels: updatedHotels };
  localStorage.setItem('hotelSurveyUser', JSON.stringify(updatedUser));
  return updatedUser;
};

// Demo data helper
export const resetDemoData = () => {
  localStorage.removeItem('hotelSurveys');
  localStorage.removeItem('hotelSurveyUser');
  console.log('Demo data reset successfully');
};
