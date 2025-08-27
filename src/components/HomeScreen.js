import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonBadge,
  IonChip,
  IonAlert,
  IonLoading,
  IonAvatar,
  IonButtons,
  IonModal,
  IonSearchbar,
  IonList,
  IonInput,
  IonTextarea,
  IonToast
} from '@ionic/react';
import { 
  logOutOutline, 
  personOutline, 
  peopleOutline,
  businessOutline,
  checkmarkCircleOutline,
  timeOutline,
  settingsOutline,
  documentTextOutline,
  addOutline,
  mapOutline,
  closeOutline,
  refreshOutline
} from 'ionicons/icons';
import HotelSurveyModal from './HotelSurveyModal';
import { authAPI, surveyAPI, handleAPIError } from '../services/api';

const HomeScreen = ({ user, onLogout }) => {
  const history = useHistory();
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userHotels, setUserHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New state for Survey Filled Data modal
  const [surveyDataModalOpen, setSurveyDataModalOpen] = useState(false);
  const [surveyedHotels, setSurveyedHotels] = useState([]);
  const [surveySearchTerm, setSurveySearchTerm] = useState('');
  
  // New state for Add Hotel modal
  const [addHotelModalOpen, setAddHotelModalOpen] = useState(false);
  const [newHotelData, setNewHotelData] = useState({
    hotelName: '',
    address: ''
  });
  
  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const isAdmin = user?.role === 'admin';

  // Helper function to transform hotel data consistently
  const transformHotelData = (hotels) => {
    if (!hotels || !Array.isArray(hotels)) return [];
    
    return hotels.map((hotel, index) => {
      // Handle both string and object formats
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

  // Navigate to admin panel
  const handleAdminClick = () => {
    history.push('/admin');
  };

  // Debug: Log user data and role
  useEffect(() => {
    console.log('HomeScreen - Current user:', user);
    console.log('HomeScreen - User role:', user?.role);
    console.log('HomeScreen - Is Admin:', isAdmin);
  }, [user, isAdmin]);

  // Transform hotel data from API response
  useEffect(() => {
    if (user && user.hotels) {
      console.log('Transforming hotel data from user:', user);
      console.log('User hotels array:', user.hotels);
      
      const transformedHotels = transformHotelData(user.hotels);
      
      console.log('Transformed hotels:', transformedHotels);
      setUserHotels(transformedHotels);
    }
  }, [user]);

  // Refresh user data on component mount to ensure we have latest hotels
  useEffect(() => {
    const refreshUserData = async () => {
      if (user && user.username) {
        try {
          console.log('Refreshing user data on component mount...');
          const userResponse = await authAPI.getUserDetails(user.username);
          if (userResponse.success && userResponse.user.hotels) {
            const transformedHotels = transformHotelData(userResponse.user.hotels);
            console.log('Refreshed hotels on mount:', transformedHotels);
            setUserHotels(transformedHotels);
          }
        } catch (err) {
          console.error('Error refreshing user data on mount:', err);
        }
      }
    };
    
    refreshUserData();
  }, [user]);

  // Fetch surveyed hotels on component mount
  useEffect(() => {
    fetchSurveyedHotels();
  }, []);

  const handleHotelClick = (hotel) => {
    setSelectedHotel(hotel);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedHotel(null);
  };

  const handleSurveyComplete = async (hotelName, surveyData) => {
    try {
      setLoading(true);
      
      console.log('HomeScreen - handleSurveyComplete called with:');
      console.log('Hotel Name:', hotelName);
      console.log('Survey Data:', surveyData);
      console.log('User:', user.username);
      
      const submitData = {
        hotelName,
        surveyData,
        username: user.username
      };
      
      console.log('HomeScreen - Submitting to API:', submitData);
      
      const response = await surveyAPI.submitSurvey(submitData);
      
      console.log('HomeScreen - API Response:', response);

      if (response.success) {
        // Refresh user data to get updated hotel completion status
        console.log('Survey submitted successfully, refreshing data...');
        const userResponse = await authAPI.getUserDetails(user.username);
        console.log('Updated user response after survey:', userResponse);
        
        if (userResponse.success) {
          // Transform the hotels data properly before setting
          const transformedHotels = transformHotelData(userResponse.user.hotels);
          console.log('Updated transformed hotels after survey:', transformedHotels);
          setUserHotels(transformedHotels);
          
          // Update user data in localStorage as well
          const updatedUser = { ...user, hotels: userResponse.user.hotels };
          localStorage.setItem('hotelSurveyUser', JSON.stringify(updatedUser));
        }
        
        // Refresh surveyed hotels list to update completion status
        await fetchSurveyedHotels();
        
        // Close the modal
        handleCloseModal();
        
        // Show success message
        setToastMessage('Survey submitted successfully!');
        setShowToast(true);
      }
    } catch (err) {
      console.error('HomeScreen - Survey submission error:', err);
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  // Fetch surveyed hotels from API
  const fetchSurveyedHotels = async () => {
    try {
      console.log('HomeScreen - Fetching surveyed hotels...');
      const response = await surveyAPI.getAllSurveys();
      console.log('HomeScreen - Survey API Response:', response);
      
      let surveysData = [];
      
      if (response.success && response.surveys) {
        surveysData = response.surveys;
        console.log('HomeScreen - Using response.surveys:', surveysData);
      } else if (Array.isArray(response)) {
        surveysData = response;
        console.log('HomeScreen - Using response as array:', surveysData);
      } else if (response.data && Array.isArray(response.data)) {
        surveysData = response.data;
        console.log('HomeScreen - Using response.data:', surveysData);
      } else {
        console.warn('HomeScreen - Unexpected response structure:', response);
        surveysData = [];
      }
      
      console.log('HomeScreen - Final surveyed hotels data:', surveysData);
      setSurveyedHotels(surveysData);
    } catch (err) {
      console.error('Error fetching surveyed hotels:', err);
      setError('Failed to fetch surveyed hotels: ' + err.message);
    }
  };

  // Open Survey Filled Data modal
  const handleSurveyDataClick = async () => {
    setSurveyDataModalOpen(true);
    await fetchSurveyedHotels();
  };

  // Add new hotel
  const handleAddHotel = async () => {
    if (!newHotelData.hotelName.trim() || !newHotelData.address.trim()) {
      setError('Please fill in both hotel name and address');
      return;
    }

    try {
      setLoading(true);
      console.log('Adding hotel:', newHotelData);
      
      const response = await authAPI.addHotel({
        username: user.username,
        hotelName: newHotelData.hotelName,
        address: newHotelData.address
      });

      console.log('Add hotel response:', response);

      if (response.success) {
        // Refresh user data to get updated hotel list
        console.log('Hotel added successfully, refreshing user data...');
        const userResponse = await authAPI.getUserDetails(user.username);
        console.log('Updated user response:', userResponse);
        
        if (userResponse.success) {
          const transformedHotels = transformHotelData(userResponse.user.hotels);
          console.log('Updated transformed hotels:', transformedHotels);
          setUserHotels(transformedHotels);
          
          // Also update the user object in localStorage and parent component
          const updatedUser = { ...user, hotels: userResponse.user.hotels };
          localStorage.setItem('hotelSurveyUser', JSON.stringify(updatedUser));
          
          // Force a complete refresh of surveyed hotels to update completion status
          await fetchSurveyedHotels();
        }

        setAddHotelModalOpen(false);
        setNewHotelData({ hotelName: '', address: '' });
        setToastMessage('Hotel added successfully!');
        setShowToast(true);
      } else {
        setError(response.message || 'Failed to add hotel');
      }
    } catch (err) {
      console.error('Error adding hotel:', err);
      setError(err.message || 'Failed to add hotel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate Google Maps link
  const getGoogleMapsLink = (hotelName, address) => {
    const query = encodeURIComponent(`${hotelName} ${address}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  // Generate Google Maps link for nearby hotels
  const getNearbyHotelsLink = (address) => {
    const query = encodeURIComponent(`hotels near ${address}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  // Check if hotel survey is completed
  const isHotelSurveyCompleted = useCallback((hotelName) => {
    return surveyedHotels.some(survey => 
      (survey.surveyData?.hotelName || survey.hotelName) === hotelName
    );
  }, [surveyedHotels]);

  // Filter surveyed hotels based on search
  const filteredSurveyedHotels = surveyedHotels.filter(survey => {
    // Handle different possible property names from API response
    const hotelName = survey.surveyData?.hotelName || 
                     survey.hotelName || 
                     survey.hotel_name || 
                     survey.name || 
                     survey.surveyData?.hotel_name ||
                     survey.surveyData?.name ||
                     '';
    
    console.log('Filtering survey:', survey, 'hotelName extracted:', hotelName);
    return hotelName.toLowerCase().includes(surveySearchTerm.toLowerCase());
  });

  // Calculate KPIs properly by checking actual survey completion
  const totalHotels = userHotels.length;
  const completedHotels = userHotels.filter(hotel => {
    // Check both the hotel's completed field AND if it exists in surveyedHotels
    return hotel.completed || isHotelSurveyCompleted(hotel.name);
  }).length;
  const pendingHotels = totalHotels - completedHotels;

  // Refresh user hotels and survey data
  const refreshUserHotels = async () => {
    if (!user || !user.username) {
      setError('User not found. Please login again.');
      return;
    }

    try {
      setLoading(true);
      console.log('Manual refresh - Refreshing user data and surveys...');
      
      // Fetch updated user data
      const userResponse = await authAPI.getUserDetails(user.username);
      console.log('Manual refresh - User response:', userResponse);
      
      if (userResponse.success && userResponse.user.hotels) {
        const transformedHotels = transformHotelData(userResponse.user.hotels);
        console.log('Manual refresh - Transformed hotels:', transformedHotels);
        setUserHotels(transformedHotels);
        
        // Update user object in localStorage
        const updatedUser = { ...user, hotels: userResponse.user.hotels };
        localStorage.setItem('hotelSurveyUser', JSON.stringify(updatedUser));
      }
      
      // Refresh survey data to update completion status
      await fetchSurveyedHotels();
      
      setToastMessage('Data refreshed successfully!');
      setShowToast(true);
    } catch (err) {
      console.error('Error refreshing user data:', err);
      setError('Failed to refresh data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update hotel completion status when surveyedHotels data changes
  useEffect(() => {
    if (userHotels.length > 0 && surveyedHotels.length > 0) {
      console.log('Updating hotel completion status...');
      console.log('User hotels:', userHotels);
      console.log('Surveyed hotels:', surveyedHotels);
      
      const updatedHotels = userHotels.map(hotel => {
        const isCompleted = isHotelSurveyCompleted(hotel.name);
        console.log(`Hotel ${hotel.name}: completed = ${isCompleted}`);
        return {
          ...hotel,
          completed: isCompleted
        };
      });
      
      // Only update if there's a change to avoid infinite loops
      const hasChanges = updatedHotels.some((hotel, index) => 
        hotel.completed !== userHotels[index].completed
      );
      
      if (hasChanges) {
        console.log('Updating hotels with completion status:', updatedHotels);
        setUserHotels(updatedHotels);
      }
    }
  }, [surveyedHotels, userHotels, isHotelSurveyCompleted]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <div slot="start" style={{ marginLeft: '16px', display: 'flex', alignItems: 'center' }}>
            <img 
              src="/logo_tkm.png" 
              alt="TKM Logo" 
              style={{ 
                height: '32px', 
                width: 'auto',
                borderRadius: '4px'
              }} 
            />
          </div>
          <IonTitle>Hotel Survey Dashboard</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="outline" onClick={refreshUserHotels}>
              <IonIcon icon={refreshOutline} slot="start" />
              Refresh
            </IonButton>
            <IonButton fill="outline" onClick={handleSurveyDataClick}>
              <IonIcon icon={documentTextOutline} slot="start" />
              Survey Filled Data
            </IonButton>
            <IonButton fill="outline" onClick={() => setAddHotelModalOpen(true)}>
              <IonIcon icon={addOutline} slot="start" />
              Add Hotel
            </IonButton>
            {isAdmin && (
              <IonButton fill="outline" onClick={handleAdminClick}>
                <IonIcon icon={settingsOutline} slot="start" />
                Admin Panel
              </IonButton>
            )}
            <IonButton fill="clear" onClick={onLogout}>
              <IonIcon icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {error && (
          <IonAlert
            isOpen={!!error}
            onDidDismiss={() => setError('')}
            header="Error"
            message={error}
            buttons={['OK']}
          />
        )}

        <IonLoading isOpen={loading} message="Loading..." />

        {/* User Profile Section */}
        <IonCard style={{ margin: '16px' }}>
          <IonCardHeader>
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="auto">
                  <IonAvatar style={{ width: '64px', height: '64px' }}>
                    <IonIcon 
                      icon={isAdmin ? settingsOutline : personOutline} 
                      style={{ fontSize: '32px' }}
                    />
                  </IonAvatar>
                </IonCol>
                <IonCol>
                  <IonCardTitle style={{ fontSize: '2rem', margin: '0' }}>
                    Welcome back, {user?.username}
                  </IonCardTitle>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <IonChip color="secondary">
                      <IonIcon icon={peopleOutline} />
                      <IonLabel>{user?.group}</IonLabel>
                    </IonChip>
                    <IonChip color={isAdmin ? 'warning' : 'medium'}>
                      <IonLabel>Role: {user?.role || 'User'}</IonLabel>
                    </IonChip>
                    {isAdmin && (
                      <IonChip color="success">
                        <IonIcon icon={settingsOutline} />
                        <IonLabel>Administrator</IonLabel>
                      </IonChip>
                    )}
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardHeader>
        </IonCard>

        {/* KPIs Section */}
        <IonGrid style={{ padding: '0 16px' }}>
          <IonRow>
            <IonCol size="12" sizeSm="6" sizeLg="3">
              <IonCard>
                <IonCardContent style={{ textAlign: 'center' }}>
                  <IonIcon icon={businessOutline} style={{ fontSize: '2rem', color: 'var(--ion-color-primary)' }} />
                  <h2 style={{ margin: '8px 0', color: 'var(--ion-color-primary)' }}>{totalHotels}</h2>
                  <IonLabel color="medium">Total Hotels</IonLabel>
                </IonCardContent>
              </IonCard>
            </IonCol>
            
            <IonCol size="12" sizeSm="6" sizeLg="3">
              <IonCard>
                <IonCardContent style={{ textAlign: 'center' }}>
                  <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '2rem', color: 'var(--ion-color-success)' }} />
                  <h2 style={{ margin: '8px 0', color: 'var(--ion-color-success)' }}>{completedHotels}</h2>
                  <IonLabel color="medium">Completed</IonLabel>
                  <IonBadge color="success" style={{ marginLeft: '8px' }}>
                    {Math.round((completedHotels / totalHotels) * 100) || 0}%
                  </IonBadge>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeSm="6" sizeLg="3">
              <IonCard>
                <IonCardContent style={{ textAlign: 'center' }}>
                  <IonIcon icon={timeOutline} style={{ fontSize: '2rem', color: 'var(--ion-color-warning)' }} />
                  <h2 style={{ margin: '8px 0', color: 'var(--ion-color-warning)' }}>{pendingHotels}</h2>
                  <IonLabel color="medium">Pending</IonLabel>
                  <IonBadge color="warning" style={{ marginLeft: '8px' }}>
                    {Math.round((pendingHotels / totalHotels) * 100) || 0}%
                  </IonBadge>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeSm="6" sizeLg="3">
              <IonCard>
                <IonCardContent style={{ textAlign: 'center' }}>
                  <IonIcon icon={peopleOutline} style={{ fontSize: '2rem', color: 'var(--ion-color-tertiary)' }} />
                  <h2 style={{ margin: '8px 0', color: 'var(--ion-color-tertiary)' }}>
                    {Math.round((completedHotels / totalHotels) * 100) || 0}%
                  </h2>
                  <IonLabel color="medium">Progress</IonLabel>
                  <IonBadge color="tertiary" style={{ marginLeft: '8px' }}>
                    {completedHotels}/{totalHotels}
                  </IonBadge>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Hotel List Section */}
        <div style={{ padding: '0 16px', marginTop: '24px' }}>
          <h2 style={{ color: 'var(--ion-color-primary)', marginBottom: '8px' }}>Assigned Hotels</h2>
          <p style={{ color: 'var(--ion-color-medium)', marginBottom: '16px' }}>
            Complete surveys for all your assigned hotels to track your progress.
          </p>
        </div>
        
        <IonGrid style={{ padding: '0 16px' }}>
          <IonRow>
            {userHotels.map((hotel, index) => {
              const isSurveyCompleted = hotel.completed || isHotelSurveyCompleted(hotel.name);
              return (
                <IonCol size="12" sizeSm="6" sizeLg="4" key={index}>
                  <IonCard>
                    <IonCardHeader>
                      <IonItem lines="none" style={{ padding: 0 }}>
                        <IonLabel>
                          <h2 style={{ margin: '0 0 4px 0', color: 'var(--ion-color-primary)' }}>
                            {hotel.name}
                          </h2>
                          {hotel.address && (
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: 'var(--ion-color-medium)' }}>
                              {hotel.address}
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <IonChip color={isSurveyCompleted ? 'success' : 'warning'} style={{ margin: 0 }}>
                              <IonIcon icon={isSurveyCompleted ? checkmarkCircleOutline : timeOutline} />
                              <IonLabel>{isSurveyCompleted ? 'Completed' : 'Pending Survey'}</IonLabel>
                            </IonChip>
                            {hotel.address && (
                              <>
                                <IonButton 
                                  fill="clear" 
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(getGoogleMapsLink(hotel.name, hotel.address), '_blank');
                                  }}
                                >
                                  <IonIcon icon={mapOutline} />
                                  Maps
                                </IonButton>
                                <IonButton 
                                  fill="clear" 
                                  size="small"
                                  color="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(getNearbyHotelsLink(hotel.address), '_blank');
                                  }}
                                >
                                  <IonIcon icon={businessOutline} />
                                  Nearby
                                </IonButton>
                              </>
                            )}
                          </div>
                        </IonLabel>
                        <IonIcon 
                          icon={isSurveyCompleted ? checkmarkCircleOutline : timeOutline}
                          color={isSurveyCompleted ? 'success' : 'warning'}
                          slot="end"
                          style={{ fontSize: '1.5rem' }}
                        />
                      </IonItem>
                    </IonCardHeader>
                    
                    <IonCardContent>
                      {isSurveyCompleted && (
                        <div style={{ 
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          backgroundColor: 'var(--ion-color-success-tint)',
                          textAlign: 'center',
                          marginBottom: '12px'
                        }}>
                          <IonLabel color="success" style={{ fontSize: '0.875rem' }}>
                            Survey submitted successfully
                          </IonLabel>
                        </div>
                      )}
                      
                      <IonButton 
                        expand="block"
                        fill={isSurveyCompleted ? 'outline' : 'solid'}
                        color={isSurveyCompleted ? 'success' : 'primary'}
                        disabled={loading || isSurveyCompleted}
                        onClick={() => handleHotelClick(hotel)}
                      >
                        {isSurveyCompleted ? 'Survey Completed' : 'Start Survey'}
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              );
            })}
          </IonRow>
        </IonGrid>
      </IonContent>

      {/* Survey Modal */}
      <HotelSurveyModal
        open={modalOpen}
        onClose={handleCloseModal}
        hotel={selectedHotel}
        onSubmit={handleSurveyComplete}
        isCompleted={selectedHotel?.completed || false}
      />

      {/* Survey Filled Data Modal */}
      <IonModal isOpen={surveyDataModalOpen} onDidDismiss={() => setSurveyDataModalOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Survey Filled Hotels</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={() => setSurveyDataModalOpen(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '16px' }}>
            <IonSearchbar
              value={surveySearchTerm}
              onIonInput={(e) => setSurveySearchTerm(e.detail.value)}
              placeholder="Search hotels by name..."
              showClearButton="focus"
            />
            
            {filteredSurveyedHotels.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <IonIcon 
                  icon={businessOutline} 
                  style={{ fontSize: '4rem', color: 'var(--ion-color-medium)' }} 
                />
                <h3 style={{ color: 'var(--ion-color-medium)', margin: '16px 0 8px 0' }}>
                  {surveyedHotels.length === 0 ? 'No surveyed hotels found' : 'No hotels match your search'}
                </h3>
                <p style={{ color: 'var(--ion-color-medium)', margin: 0 }}>
                  {surveyedHotels.length === 0 
                    ? 'No surveys have been completed yet' 
                    : 'Try adjusting your search criteria'
                  }
                </p>
                <p style={{ color: 'var(--ion-color-medium)', fontSize: '0.8rem', marginTop: '8px' }}>
                  Total surveys loaded: {surveyedHotels.length}
                </p>
                <IonButton 
                  fill="outline" 
                  size="small" 
                  onClick={() => {
                    console.log('Refresh button clicked in modal');
                    fetchSurveyedHotels();
                  }}
                  style={{ marginTop: '16px' }}
                >
                  <IonIcon icon={refreshOutline} slot="start" />
                  Refresh Data
                </IonButton>
              </div>
            ) : (
              <IonList>
                {filteredSurveyedHotels.map((survey, index) => {
                  // Try multiple property paths for hotel name
                  const hotelName = survey.surveyData?.hotelName || 
                                   survey.hotelName || 
                                   survey.hotel_name || 
                                   survey.name || 
                                   survey.surveyData?.hotel_name ||
                                   survey.surveyData?.name ||
                                   'Unknown Hotel';
                  
                  // Try multiple property paths for address
                  const address = survey.surveyData?.address || 
                                 survey.address || 
                                 survey.location || 
                                 survey.surveyData?.location ||
                                 'N/A';
                  
                  // Additional survey details
                  const surveyDate = survey.createdAt || 
                                    survey.created_at || 
                                    survey.surveyData?.date ||
                                    survey.date ||
                                    'N/A';
                  
                  const surveyedBy = survey.surveyedBy || 
                                    survey.surveyed_by || 
                                    survey.surveyData?.surveyedBy ||
                                    survey.user?.name ||
                                    'N/A';
                  
                  console.log('Rendering survey item:', { survey, hotelName, address, surveyDate, surveyedBy });
                  
                  return (
                    <IonItem key={survey.id || survey._id || index}>
                      <IonIcon icon={businessOutline} slot="start" color="primary" />
                      <IonLabel>
                        <h3>{hotelName}</h3>
                        <p>
                          <strong>Address:</strong> {address}<br/>
                          <strong>Survey Date:</strong> {surveyDate}<br/>
                          <strong>Surveyed By:</strong> {surveyedBy}
                        </p>
                        {address !== 'N/A' && (
                          <IonButton 
                            fill="clear" 
                            size="small"
                            onClick={() => window.open(getGoogleMapsLink(hotelName, address), '_blank')}
                            style={{ marginTop: '8px' }}
                          >
                            <IonIcon icon={mapOutline} slot="start" />
                            View on Maps
                          </IonButton>
                        )}
                      </IonLabel>
                      <IonIcon icon={checkmarkCircleOutline} slot="end" color="success" />
                    </IonItem>
                  );
                })}
              </IonList>
            )}
          </div>
        </IonContent>
      </IonModal>

      {/* Add Hotel Modal */}
      <IonModal isOpen={addHotelModalOpen} onDidDismiss={() => setAddHotelModalOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Add New Hotel</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={() => setAddHotelModalOpen(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '16px' }}>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Hotel Name *</IonLabel>
                <IonInput
                  value={newHotelData.hotelName}
                  onIonInput={(e) => setNewHotelData(prev => ({ ...prev, hotelName: e.detail.value }))}
                  placeholder="Enter hotel name"
                  required
                />
              </IonItem>
              
              <IonItem>
                <IonLabel position="stacked">Address *</IonLabel>
                <IonTextarea
                  value={newHotelData.address}
                  onIonInput={(e) => setNewHotelData(prev => ({ ...prev, address: e.detail.value }))}
                  placeholder="Enter hotel address"
                  rows={3}
                  required
                />
              </IonItem>
            </IonList>
            
            <div style={{ marginTop: '24px' }}>
              <IonButton 
                expand="block" 
                onClick={handleAddHotel}
                disabled={!newHotelData.hotelName.trim() || !newHotelData.address.trim() || loading}
              >
                {loading ? 'Adding...' : 'Add Hotel'}
              </IonButton>
              
              <IonButton 
                expand="block" 
                fill="clear" 
                onClick={() => {
                  setAddHotelModalOpen(false);
                  setNewHotelData({ hotelName: '', address: '' });
                }}
                style={{ marginTop: '8px' }}
              >
                Cancel
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      {/* Toast for notifications */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color="success"
      />
    </IonPage>
  );
};

export default HomeScreen;
