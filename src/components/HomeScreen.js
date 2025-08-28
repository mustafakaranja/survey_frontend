import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  IonToast,
  IonPopover
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
  refreshOutline,
  menuOutline
} from 'ionicons/icons';
import HotelSurveyModal from './HotelSurveyModal';
import {
  fetchUserHotels,
  addHotel,
  fetchSurveyedHotels,
  submitSurvey,
  setUserHotels
} from '../store/hotelsSlice';

const HomeScreen = ({ user, onLogout }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    userHotels, 
    surveyedHotels, 
    loading: hotelsLoading, 
    addingHotel,
    submittingSurvey 
  } = useSelector((state) => state.hotels);

  // Local state for UI
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  
  // New state for Survey Filled Data modal
  const [surveyDataModalOpen, setSurveyDataModalOpen] = useState(false);
  const [surveySearchTerm, setSurveySearchTerm] = useState('');
  
  // New state for search and filters
  const [hotelSearchTerm, setHotelSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showPending, setShowPending] = useState(true);
  
  // New state for Add Hotel modal
  const [addHotelModalOpen, setAddHotelModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newHotelData, setNewHotelData] = useState({
    hotelName: '',
    address: ''
  });
  
  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Responsive state for mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const isAdmin = user?.role === 'admin';

  // Navigate to admin panel
  const handleAdminClick = () => {
    history.push('/admin');
  };

  // Initialize data on component mount
  useEffect(() => {
    if (user && user.username) {
      // If user already has hotels data from login, use it directly
      if (user.hotels && user.hotels.length > 0) {
        // Use the action creator to set hotels data
        dispatch(setUserHotels(user.hotels));
      } else {
        dispatch(fetchUserHotels(user.username));
      }
      
      // Always fetch surveyed hotels for completion status
      dispatch(fetchSurveyedHotels());
    }
  }, [user, dispatch]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      console.log('HomeScreen: Starting survey submission for:', hotelName);
      const result = await dispatch(submitSurvey({
        hotelName,
        surveyData,
        username: user.username
      })).unwrap();
      
      console.log('HomeScreen: Survey submission successful:', result);
      
      // Close the modal
      handleCloseModal();
      
      // Show success message
      setToastMessage('Survey submitted successfully!');
      setShowToast(true);
      
      // Clear any previous errors
      setError('');
      
    } catch (err) {
      console.error('HomeScreen - Survey submission error:', err);
      // Only show error if it's actually an error
      if (err && typeof err === 'string') {
        setError(err);
      } else if (err && err.message) {
        setError(err.message);
      } else {
        setError('Failed to submit survey');
      }
    }
  };

  // Fetch surveyed hotels from API
  // Open Survey Filled Data modal using Redux
  const handleSurveyDataClick = async () => {
    setSurveyDataModalOpen(true);
    dispatch(fetchSurveyedHotels());
  };

  // Add new hotel using Redux
  const handleAddHotel = async () => {
    if (!newHotelData.hotelName.trim() || !newHotelData.address.trim()) {
      setError('Please fill in both hotel name and address');
      return;
    }

    try {
      await dispatch(addHotel({
        username: user.username,
        hotelName: newHotelData.hotelName,
        address: newHotelData.address
      })).unwrap();

      setAddHotelModalOpen(false);
      setNewHotelData({ hotelName: '', address: '' });
      setToastMessage('Hotel added successfully!');
      setShowToast(true);
      
      // Refresh surveyed hotels to update completion status
      dispatch(fetchSurveyedHotels());
    } catch (err) {
      setError(err || 'Failed to add hotel');
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
    return surveyedHotels.some(survey => {
      const surveyHotelName = survey.hotelName || survey.surveyData?.hotelName || survey.name;
      return surveyHotelName === hotelName;
    });
  }, [surveyedHotels]);

  // Filter surveyed hotels based on search
  const filteredSurveyedHotels = surveyedHotels.filter(survey => {
    // Handle different possible property names from API response
    const hotelName = survey.hotelName || 
                     survey.surveyData?.hotelName || 
                     survey.hotel_name || 
                     survey.name || 
                     survey.surveyData?.hotel_name ||
                     survey.surveyData?.name ||
                     '';
    
    return hotelName.toLowerCase().includes(surveySearchTerm.toLowerCase());
  });

  // Filter user hotels based on search and status
  const filteredUserHotels = userHotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(hotelSearchTerm.toLowerCase());
    const isCompleted = isHotelSurveyCompleted(hotel.name);
    const matchesStatus = (showCompleted && isCompleted) || (showPending && !isCompleted);
    
    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs properly by checking actual survey completion
  const totalHotels = userHotels.length;
  const completedHotels = userHotels.filter(hotel => {
    // Check both the hotel's completed field AND if it exists in surveyedHotels
    return hotel.completed || isHotelSurveyCompleted(hotel.name);
  }).length;
  const pendingHotels = totalHotels - completedHotels;

  // Refresh user hotels and survey data using Redux
  const refreshUserHotels = async () => {
    if (!user || !user.username) {
      setError('User not found. Please login again.');
      return;
    }

    try {
      // Fetch updated user data and surveys
      await dispatch(fetchUserHotels(user.username));
      dispatch(fetchSurveyedHotels());
      
      setToastMessage('Data refreshed successfully!');
      setShowToast(true);
    } catch (err) {
      console.error('Error refreshing user data:', err);
      setError('Failed to refresh data: ' + err.message);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar 
          color="dark" 
          style={{
            backgroundImage: 'url(/header-bg-DZ2l_Pup.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
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
          
          {/* Desktop buttons */}
          <IonButtons 
            slot="end" 
            className="desktop-buttons"
            style={{ 
              display: !isMobile ? 'flex' : 'none'
            }}
          >
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

          {/* Mobile hamburger menu */}
          <IonButtons 
            slot="end" 
            className="mobile-menu-button"
            style={{ 
              display: isMobile ? 'flex' : 'none'
            }}
          >
            <IonButton id="mobile-menu-trigger" fill="clear">
              <IonIcon icon={menuOutline} />
            </IonButton>
            <IonButton fill="clear" onClick={onLogout}>
              <IonIcon icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 25%, #ffffff 50%, #f1f3f4 75%, #ffffff 100%)',
        backgroundAttachment: 'fixed'
      }}>
        {/* Mobile Menu Popover */}
        <IonPopover
          trigger="mobile-menu-trigger"
          isOpen={mobileMenuOpen}
          onDidDismiss={() => setMobileMenuOpen(false)}
          className="mobile-menu-popover"
        >
          <IonContent>
            <IonList>
              <IonItem button onClick={() => { refreshUserHotels(); setMobileMenuOpen(false); }}>
                <IonIcon icon={refreshOutline} slot="start" />
                <IonLabel>Refresh</IonLabel>
              </IonItem>
              <IonItem button onClick={() => { handleSurveyDataClick(); setMobileMenuOpen(false); }}>
                <IonIcon icon={documentTextOutline} slot="start" />
                <IonLabel>Survey Filled Data</IonLabel>
              </IonItem>
              <IonItem button onClick={() => { setAddHotelModalOpen(true); setMobileMenuOpen(false); }}>
                <IonIcon icon={addOutline} slot="start" />
                <IonLabel>Add Hotel</IonLabel>
              </IonItem>
              {isAdmin && (
                <IonItem button onClick={() => { handleAdminClick(); setMobileMenuOpen(false); }}>
                  <IonIcon icon={settingsOutline} slot="start" />
                  <IonLabel>Admin Panel</IonLabel>
                </IonItem>
              )}
            </IonList>
          </IonContent>
        </IonPopover>
        {error && (
          <IonAlert
            isOpen={!!error}
            onDidDismiss={() => setError('')}
            header="Error"
            message={error}
            buttons={['OK']}
          />
        )}

        <IonLoading isOpen={hotelsLoading || addingHotel || submittingSurvey} message="Loading..." />

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
                  <IonCardTitle style={{ fontSize: '1.5rem', margin: '0' }}>
                    Welcome back, {user?.username}
                  </IonCardTitle>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <IonChip color="secondary" style={{ fontSize: '0.8rem' }}>
                      <IonIcon icon={peopleOutline} />
                      <IonLabel>{user?.group}</IonLabel>
                    </IonChip>
                    <IonChip color={isAdmin ? 'warning' : 'medium'} style={{ fontSize: '0.8rem' }}>
                      <IonLabel>Role: {user?.role || 'User'}</IonLabel>
                    </IonChip>
                    {isAdmin && (
                      <IonChip color="success" style={{ fontSize: '0.8rem' }}>
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

        {/* Search and Filter Controls */}
        <IonCard 
          style={{ 
            margin: '16px', 
            display: !isMobile ? 'block' : 'none' 
          }} 
          className="desktop-only"
        >
          <IonCardContent style={{ padding: '12px' }}>
            <IonGrid>
              <IonRow style={{ alignItems: 'center' }}>
                <IonCol size="12" sizeMd="6">
                  <IonSearchbar
                    value={hotelSearchTerm}
                    onIonInput={(e) => setHotelSearchTerm(e.detail.value)}
                    placeholder="Search hotels..."
                    showClearButton="focus"
                    style={{ marginBottom: '0' }}
                  />
                </IonCol>
                <IonCol size="12" sizeMd="6">
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <IonLabel style={{ fontSize: '0.9rem', marginRight: '8px' }}>Show:</IonLabel>
                    <IonButton
                      fill={showCompleted ? 'solid' : 'outline'}
                      color="success"
                      size="small"
                      onClick={() => setShowCompleted(!showCompleted)}
                    >
                      <IonIcon icon={checkmarkCircleOutline} slot="start" />
                      Completed
                    </IonButton>
                    <IonButton
                      fill={showPending ? 'solid' : 'outline'}
                      color="warning"
                      size="small"
                      onClick={() => setShowPending(!showPending)}
                    >
                      <IonIcon icon={timeOutline} slot="start" />
                      Pending
                    </IonButton>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* KPIs Section */}
        <IonGrid 
          style={{ 
            padding: '0 16px',
            display: !isMobile ? 'block' : 'none'
          }} 
          className="desktop-only"
        >
          <IonRow>
            <IonCol size="12" sizeSm="6" sizeLg="3">
              <IonCard>
                <IonCardContent style={{ textAlign: 'center', padding: '12px' }}>
                  <IonIcon icon={businessOutline} style={{ fontSize: '1.5rem', color: 'var(--ion-color-primary)' }} />
                  <h3 style={{ margin: '6px 0', color: 'var(--ion-color-primary)' }}>{totalHotels}</h3>
                  <IonLabel color="medium" style={{ fontSize: '0.9rem' }}>Total Hotels</IonLabel>
                </IonCardContent>
              </IonCard>
            </IonCol>
            
            <IonCol size="12" sizeSm="6" sizeLg="3">
              <IonCard>
                <IonCardContent style={{ textAlign: 'center', padding: '12px' }}>
                  <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '1.5rem', color: 'var(--ion-color-success)' }} />
                  <h3 style={{ margin: '6px 0', color: 'var(--ion-color-success)' }}>{completedHotels}</h3>
                  <IonLabel color="medium" style={{ fontSize: '0.9rem' }}>Completed</IonLabel>
                  <IonBadge color="success" style={{ marginLeft: '8px', fontSize: '0.8rem' }}>
                    {Math.round((completedHotels / totalHotels) * 100) || 0}%
                  </IonBadge>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeSm="6" sizeLg="3">
              <IonCard>
                <IonCardContent style={{ textAlign: 'center', padding: '12px' }}>
                  <IonIcon icon={timeOutline} style={{ fontSize: '1.5rem', color: 'var(--ion-color-warning)' }} />
                  <h3 style={{ margin: '6px 0', color: 'var(--ion-color-warning)' }}>{pendingHotels}</h3>
                  <IonLabel color="medium" style={{ fontSize: '0.9rem' }}>Pending</IonLabel>
                  <IonBadge color="warning" style={{ marginLeft: '8px', fontSize: '0.8rem' }}>
                    {Math.round((pendingHotels / totalHotels) * 100) || 0}%
                  </IonBadge>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeSm="6" sizeLg="3">
              <IonCard>
                <IonCardContent style={{ textAlign: 'center', padding: '12px' }}>
                  <IonIcon icon={peopleOutline} style={{ fontSize: '1.5rem', color: 'var(--ion-color-tertiary)' }} />
                  <h3 style={{ margin: '6px 0', color: 'var(--ion-color-tertiary)' }}>
                    {Math.round((completedHotels / totalHotels) * 100) || 0}%
                  </h3>
                  <IonLabel color="medium" style={{ fontSize: '0.9rem' }}>Progress</IonLabel>
                  <IonBadge color="tertiary" style={{ marginLeft: '8px', fontSize: '0.8rem' }}>
                    {completedHotels}/{totalHotels}
                  </IonBadge>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Mobile Search and Filter Controls */}
        <IonCard 
          style={{ 
            margin: '16px', 
            display: isMobile ? 'block' : 'none' 
          }} 
          className="mobile-only mobile-search-card"
        >
          <IonCardContent style={{ padding: '16px' }}>
            <IonSearchbar
              value={hotelSearchTerm}
              onIonInput={(e) => setHotelSearchTerm(e.detail.value)}
              placeholder="Search hotels..."
              showClearButton="focus"
              style={{ marginBottom: '16px' }}
            />
            <div className="mobile-filter-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <IonLabel style={{ fontSize: '0.9rem', marginRight: '8px', minWidth: 'fit-content' }}>Show:</IonLabel>
              <IonButton
                fill={showCompleted ? 'solid' : 'outline'}
                color="success"
                size="small"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                <IonIcon icon={checkmarkCircleOutline} slot="start" />
                Completed
              </IonButton>
              <IonButton
                fill={showPending ? 'solid' : 'outline'}
                color="warning"
                size="small"
                onClick={() => setShowPending(!showPending)}
              >
                <IonIcon icon={timeOutline} slot="start" />
                Pending
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Hotel List Section */}
        <div style={{ padding: '0 16px', marginTop: '24px' }}>
          <h2 style={{ color: 'var(--ion-color-primary)', marginBottom: '8px' }}>Assigned Hotels</h2>
          <p style={{ color: 'var(--ion-color-medium)', marginBottom: '16px' }}>
            Complete surveys for all your assigned hotels to track your progress.
          </p>
        </div>
        
        <IonGrid style={{ padding: '0 16px' }}>
          <IonRow>
            {hotelsLoading ? (
              <IonCol size="12" style={{ textAlign: 'center', padding: '40px' }}>
                <IonIcon icon={refreshOutline} style={{ fontSize: '3rem', color: 'var(--ion-color-medium)' }} />
                <p style={{ color: 'var(--ion-color-medium)', marginTop: '16px' }}>Loading hotels...</p>
              </IonCol>
            ) : !userHotels || userHotels.length === 0 ? (
              <IonCol size="12" style={{ textAlign: 'center', padding: '40px' }}>
                <IonIcon icon={businessOutline} style={{ fontSize: '3rem', color: 'var(--ion-color-medium)' }} />
                <h3 style={{ color: 'var(--ion-color-medium)', margin: '16px 0' }}>No Hotels Assigned</h3>
                <p style={{ color: 'var(--ion-color-medium)' }}>
                  No hotels have been assigned to you yet. Contact your administrator to add hotels.
                </p>
                <IonButton 
                  fill="outline" 
                  onClick={refreshUserHotels}
                  style={{ marginTop: '16px' }}
                >
                  <IonIcon icon={refreshOutline} slot="start" />
                  Refresh
                </IonButton>
              </IonCol>
            ) : filteredUserHotels.length === 0 ? (
              <IonCol size="12" style={{ textAlign: 'center', padding: '40px' }}>
                <IonIcon icon={businessOutline} style={{ fontSize: '3rem', color: 'var(--ion-color-medium)' }} />
                <h3 style={{ color: 'var(--ion-color-medium)', margin: '16px 0' }}>No Hotels Match Filter</h3>
                <p style={{ color: 'var(--ion-color-medium)' }}>
                  No hotels match your current search or filter criteria. Try adjusting your search or filter settings.
                </p>
                <IonButton 
                  fill="outline" 
                  onClick={() => { setHotelSearchTerm(''); setShowCompleted(true); setShowPending(true); }}
                  style={{ marginTop: '16px' }}
                >
                  <IonIcon icon={refreshOutline} slot="start" />
                  Clear Filters
                </IonButton>
              </IonCol>
            ) : (
              filteredUserHotels.map((hotel, index) => {
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
                          disabled={hotelsLoading || addingHotel || submittingSurvey || isSurveyCompleted}
                          onClick={() => handleHotelClick(hotel)}
                        >
                          {isSurveyCompleted ? 'Survey Completed' : 'Start Survey'}
                        </IonButton>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                );
              })
            )}
          </IonRow>
        </IonGrid>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          marginTop: '40px',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          backgroundColor: 'rgba(255,255,255,0.7)'
        }}>
          <p style={{ 
            margin: '0', 
            fontSize: '0.8rem', 
            color: 'var(--ion-color-medium)',
            fontWeight: '400'
          }}>
            2025 © TKM Nagpur.
          </p>
        </div>
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
                    dispatch(fetchSurveyedHotels());
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
                  // Try multiple property paths for hotel name - prioritize direct hotelName
                  const hotelName = survey.hotelName || 
                                   survey.surveyData?.hotelName || 
                                   survey.hotel_name || 
                                   survey.name || 
                                   survey.surveyData?.hotel_name ||
                                   survey.surveyData?.name ||
                                   'Unknown Hotel';
                  
                  // Try multiple property paths for address - prioritize direct address
                  const address = survey.address || 
                                 survey.surveyData?.address || 
                                 survey.location || 
                                 survey.surveyData?.location ||
                                 'N/A';
                  
                  // Additional survey details
                  const surveyDate = survey.createdAt || 
                                    survey.created_at || 
                                    survey.surveyData?.date ||
                                    survey.date ||
                                    'N/A';
                  
                  const surveyedBy = survey.username || 
                                    survey.surveyedBy || 
                                    survey.surveyed_by || 
                                    survey.surveyData?.surveyedBy ||
                                    survey.user?.name ||
                                    'N/A';
                  
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
                disabled={!newHotelData.hotelName.trim() || !newHotelData.address.trim() || addingHotel}
              >
                {addingHotel ? 'Adding...' : 'Add Hotel'}
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
