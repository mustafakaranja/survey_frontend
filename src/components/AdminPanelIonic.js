import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonModal,
  IonIcon,
  IonText,
  IonChip,
  IonList,
  IonButtons,
  IonPage,
  IonAlert,
  IonToast,
  IonAccordion,
  IonAccordionGroup
} from '@ionic/react';
import {
  funnel,
  refresh,
  download,
  analytics,
  business,
  heart,
  close,
  location,
  snow,
  call,
  person,
  calendar,
  trashOutline,
  briefcase,
  mail,
  chatbox,
  bed,
  restaurant,
  checkmark
} from 'ionicons/icons';
import { surveyAPI, handleAPIError, healthCheck } from '../services/api';

const AdminPanelIonic = () => {
  const [surveys, setSurveys] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Filter states for new survey schema
  const [filters, setFilters] = useState({
    search: '',
    acNonAc: '',
    visitingCard: '',
    breakfast: '',
    roomsMin: '',
    roomsMax: '',
    location: '',
    area: ''
  });

  // Delete confirmation states
  const [deleteAlert, setDeleteAlert] = useState({
    isOpen: false,
    surveyId: null,
    hotelName: ''
  });

  // Define applyFilters for new survey schema
  const applyFilters = useCallback(() => {
    let filtered = surveys;

    // Search filter (hotel name, manager email, address)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(survey => 
        survey.hotelName.toLowerCase().includes(searchLower) ||
        survey.managerEmail.toLowerCase().includes(searchLower) ||
        survey.address.toLowerCase().includes(searchLower)
      );
    }

    // AC/Non-AC filter
    if (filters.acNonAc) {
      filtered = filtered.filter(survey => survey.acNonAc === filters.acNonAc);
    }

    // Visiting Card filter
    if (filters.visitingCard !== '') {
      const visitingCardFilter = filters.visitingCard === 'true';
      filtered = filtered.filter(survey => survey.visitingCard === visitingCardFilter);
    }

    // Breakfast filter
    if (filters.breakfast !== '') {
      const breakfastFilter = filters.breakfast === 'true';
      filtered = filtered.filter(survey => survey.breakfast === breakfastFilter);
    }

    // Rooms count filter
    if (filters.roomsMin) {
      filtered = filtered.filter(survey => survey.numberOfRoomsInHotel >= parseInt(filters.roomsMin));
    }
    if (filters.roomsMax) {
      filtered = filtered.filter(survey => survey.numberOfRoomsInHotel <= parseInt(filters.roomsMax));
    }

    // Location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      filtered = filtered.filter(survey => 
        survey.address.toLowerCase().includes(locationLower)
      );
    }

    // Area filter (broader geographic area)
    if (filters.area) {
      const areaLower = filters.area.toLowerCase();
      filtered = filtered.filter(survey => 
        survey.address.toLowerCase().includes(areaLower) ||
        (survey.city && survey.city.toLowerCase().includes(areaLower)) ||
        (survey.state && survey.state.toLowerCase().includes(areaLower))
      );
    }

    setFilteredSurveys(filtered);
  }, [surveys, filters]);

  useEffect(() => {
    loadSurveys();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [surveys, filters, applyFilters]);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading surveys from API...');
      const response = await surveyAPI.getAllSurveys();
      
      console.log('API Response:', response);
      
      // Handle different response structures
      let surveysData = [];
      
      if (response && response.success && response.surveys) {
        surveysData = response.surveys;
      } else if (response && Array.isArray(response)) {
        surveysData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        surveysData = response.data;
      } else if (response && response.status === 'success' && response.data) {
        surveysData = response.data;
      } else {
        console.warn('Unexpected response structure:', response);
        surveysData = [];
      }
      
      console.log('Surveys data:', surveysData);
      
      // Transform the data to match new survey schema
      const transformedSurveys = surveysData.map((survey, index) => {
        console.log(`Transforming survey ${index}:`, survey);
        
        return {
          _id: survey._id || survey.id || `survey_${index}`,
          username: survey.username || survey.surveyedBy || 'Unknown',
          hotelName: survey.surveyData?.hotelName || survey.hotelName || survey.hotel_name || 'Unknown Hotel',
          address: survey.surveyData?.address || survey.address || 'N/A',
          managerEmail: survey.surveyData?.managerEmail || survey.managerEmail || 'N/A',
          managerContactNumber: survey.surveyData?.managerContactNumber || survey.managerContactNumber || 'N/A',
          whatsappNumber: survey.surveyData?.whatsappNumber || survey.whatsappNumber || 'N/A',
          acNonAc: survey.surveyData?.acNonAc || survey.acNonAc || 'N/A',
          dormitory: survey.surveyData?.dormitory || survey.dormitory || false,
          numberOfRoomsInHotel: survey.surveyData?.numberOfRoomsInHotel || survey.numberOfRoomsInHotel || survey.numberOfRooms || 0,
          roomTariff: survey.surveyData?.roomTariff || survey.roomTariff || 'N/A',
          breakfast: survey.surveyData?.breakfast || survey.breakfast || false,
          numberOfRoomsOfferedDuringAdshsra: survey.surveyData?.numberOfRoomsOfferedDuringAdshsra || survey.numberOfRoomsOfferedDuringAdshsra || 'N/A',
          comments: survey.surveyData?.comments || survey.comments || 'N/A',
          visitingCard: survey.surveyData?.visitingCard || survey.visitingCard || false,
          numberOfGuests: survey.surveyData?.numberOfGuests || survey.numberOfGuests || 0,
          createdAt: survey.submittedAt || survey.createdAt || survey.created_at || new Date().toISOString(),
          updatedAt: survey.submittedAt || survey.updatedAt || survey.updated_at || new Date().toISOString()
        };
      });
      
      console.log('Transformed surveys:', transformedSurveys);
      setSurveys(transformedSurveys);
    } catch (err) {
      console.error('Error loading surveys:', err);
      setError(handleAPIError(err));
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  const performHealthCheck = async () => {
    try {
      setLoading(true);
      console.log('Performing health check...');
      const result = await healthCheck();
      
      if (result.success) {
        setError('');
        alert('Health Check Passed! API is responding correctly.');
      } else {
        setError(`Health Check Failed: ${result.error}`);
        console.error('Health check details:', result.details);
      }
    } catch (err) {
      console.error('Health check error:', err);
      setError(`Health Check Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      acNonAc: '',
      visitingCard: '',
      breakfast: '',
      roomsMin: '',
      roomsMax: '',
      location: '',
      area: ''
    });
  };

  // Delete survey function
  const handleDeleteSurvey = async (surveyId) => {
    try {
      setLoading(true);
      await surveyAPI.deleteSurvey(surveyId);
      
      // Remove the deleted survey from local state
      const updatedSurveys = surveys.filter(survey => survey._id !== surveyId);
      setSurveys(updatedSurveys);
      
      setDeleteAlert({ isOpen: false, surveyId: null, hotelName: '' });
      setShowToast(true);
      setError('Survey deleted successfully');
    } catch (err) {
      console.error('Error deleting survey:', err);
      setError('Failed to delete survey: ' + err.message);
      setDeleteAlert({ isOpen: false, surveyId: null, hotelName: '' });
    } finally {
      setLoading(false);
    }
  };

  // Confirm delete function
  const confirmDelete = (survey) => {
    setDeleteAlert({
      isOpen: true,
      surveyId: survey._id,
      hotelName: survey.hotelName
    });
  };

  const handleExport = (format = 'json') => {
    if (format === 'csv') {
      exportToCSV();
    } else {
      exportToJSON();
    }
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(filteredSurveys, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `hotel_surveys_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setShowToast(true);
  };

  const exportToCSV = () => {
    const headers = [
      'Hotel Name', 'Address', 'Manager Email', 'Contact Number', 'WhatsApp', 
      'AC/Non-AC', 'Total Rooms', 'Room Tariff', 'Breakfast', 
      'Rooms for Adshsra', 'Visiting Card Collected', 'Number of Guests', 'Comments', 'Surveyed By', 'Date'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredSurveys.map(survey => [
        `"${survey.hotelName}"`,
        `"${survey.address}"`,
        `"${survey.managerEmail}"`,
        `"${survey.managerContactNumber}"`,
        `"${survey.whatsappNumber}"`,
        `"${survey.acNonAc}"`,
        survey.numberOfRoomsInHotel,
        `"${survey.roomTariff}"`,
        survey.breakfast ? 'Yes' : 'No',
        `"${survey.numberOfRoomsOfferedDuringAdshsra}"`,
        survey.visitingCard ? 'Yes' : 'No',
        survey.numberOfGuests,
        `"${survey.comments}"`,
        `"${survey.username}"`,
        `"${formatDate(survey.createdAt)}"`
      ].join(','))
    ].join('\n');

    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `hotel_surveys_${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setShowToast(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const doRefresh = (event) => {
    loadSurveys().then(() => {
      event.detail.complete();
    });
  };

  // Calculate statistics for new survey schema
  const totalSurveys = surveys.length;
  const acHotels = surveys.filter(s => s.acNonAc === 'AC').length;
  const totalGuests = surveys.reduce((sum, s) => sum + parseInt(s.numberOfGuests || 0), 0);
  const totalRooms = surveys.reduce((sum, s) => sum + parseInt(s.numberOfRoomsInHotel || 0), 0);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Admin Panel</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-text-center ion-padding">
          <IonSpinner name="circular" />
          <IonText>
            <p>Loading surveys...</p>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }

  // Add error state UI
  if (error && surveys.length === 0) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Admin Panel - Error</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={loadSurveys}>
                <IonIcon icon={refresh} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-text-center ion-padding">
          <IonIcon icon={analytics} style={{ fontSize: '4rem', color: 'var(--ion-color-danger)' }} />
          <IonText color="danger">
            <h2>Error Loading Data</h2>
            <p>{error}</p>
            <p>Please check your internet connection and try again.</p>
          </IonText>
          <IonButton onClick={loadSurveys} expand="block" color="primary" style={{ marginTop: '20px' }}>
            <IonIcon icon={refresh} slot="start" />
            Retry Loading
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Survey Dashboard</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => setShowFilters(true)}>
              <IonIcon icon={funnel} />
            </IonButton>
            <IonButton fill="clear" onClick={loadSurveys}>
              <IonIcon icon={refresh} />
            </IonButton>
            <IonButton fill="clear" onClick={performHealthCheck}>
              <IonIcon icon={heart} />
            </IonButton>
            <IonButton fill="clear" onClick={() => handleExport('json')}>
              <IonIcon icon={download} />
              JSON
            </IonButton>
            <IonButton fill="clear" onClick={() => handleExport('csv')}>
              <IonIcon icon={download} />
              CSV
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {error && (
          <IonCard color="danger">
            <IonCardContent>
              <IonText color="light">
                <p>{error}</p>
              </IonText>
            </IonCardContent>
          </IonCard>
        )}

        {/* Statistics Cards */}
        <IonGrid>
          <IonRow>
            <IonCol size="6" sizeMd="3">
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={analytics} size="large" color="primary" />
                  <IonCardTitle>{totalSurveys}</IonCardTitle>
                  <IonText color="medium">
                    <p>Total Surveys</p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6" sizeMd="3">
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={snow} size="large" color="secondary" />
                  <IonCardTitle>{acHotels}</IonCardTitle>
                  <IonText color="medium">
                    <p>AC Hotels</p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6" sizeMd="3">
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={analytics} size="large" color="tertiary" />
                  <IonCardTitle>{totalGuests}</IonCardTitle>
                  <IonText color="medium">
                    <p>Total Guests</p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6" sizeMd="3">
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={business} size="large" color="success" />
                  <IonCardTitle>{totalRooms}</IonCardTitle>
                  <IonText color="medium">
                    <p>Total Rooms</p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Search Bar */}
        <IonSearchbar
          value={filters.search}
          onIonInput={(e) => handleFilterChange('search', e.detail.value)}
          placeholder="Search hotels, emails, or addresses..."
          showClearButton="focus"
        />

        {/* Survey List */}
        {filteredSurveys.length === 0 ? (
          <IonCard>
            <IonCardContent className="ion-text-center">
              <IonIcon icon={briefcase} size="large" color="medium" />
              <IonCardTitle>No surveys found</IonCardTitle>
              <IonText color="medium">
                <p>
                  {surveys.length === 0 
                    ? 'No survey data available. Try refreshing or check if the backend is running.' 
                    : 'Try adjusting your search criteria or filters'
                  }
                </p>
              </IonText>
            </IonCardContent>
          </IonCard>
        ) : (
          <IonAccordionGroup>
            {filteredSurveys.map((survey) => (
              <IonAccordion key={survey._id} value={survey._id}>
                <IonItem slot="header">
                  <IonIcon icon={business} slot="start" color="primary" />
                  <IonLabel>
                    <h2>{survey.hotelName}</h2>
                    <p>
                      <IonIcon icon={person} /> {survey.username} • 
                      <IonIcon icon={calendar} /> {formatDate(survey.createdAt)}
                    </p>
                  </IonLabel>
                  <IonChip slot="end" color={survey.acNonAc === 'AC' ? 'success' : 'medium'}>
                    <IonIcon icon={snow} />
                    <IonLabel>{survey.acNonAc}</IonLabel>
                  </IonChip>
                </IonItem>

                <div className="ion-padding" slot="content">
                  <IonGrid>
                    <IonRow>
                      <IonCol size="12" sizeMd="6">
                        <IonItem lines="none">
                          <IonIcon icon={location} slot="start" color="medium" />
                          <IonLabel>
                            <h3>Address</h3>
                            <p>{survey.address}</p>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                      <IonCol size="12" sizeMd="6">
                        <IonItem lines="none">
                          <IonIcon icon={mail} slot="start" color="medium" />
                          <IonLabel>
                            <h3>Manager Email</h3>
                            <p>{survey.managerEmail}</p>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                    </IonRow>
                    <IonRow>
                      <IonCol size="12" sizeMd="6">
                        <IonItem lines="none">
                          <IonIcon icon={call} slot="start" color="medium" />
                          <IonLabel>
                            <h3>Manager Contact</h3>
                            <p>{survey.managerContactNumber}</p>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                      <IonCol size="12" sizeMd="6">
                        <IonItem lines="none">
                          <IonIcon icon={chatbox} slot="start" color="medium" />
                          <IonLabel>
                            <h3>WhatsApp</h3>
                            <p>{survey.whatsappNumber}</p>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                    </IonRow>
                    <IonRow>
                      <IonCol size="12" sizeMd="6">
                        <IonItem lines="none">
                          <IonIcon icon={bed} slot="start" color="medium" />
                          <IonLabel>
                            <h3>Total Rooms</h3>
                            <p>{survey.numberOfRoomsInHotel}</p>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                      <IonCol size="12" sizeMd="6">
                        <IonItem lines="none">
                          <IonIcon icon={bed} slot="start" color="medium" />
                          <IonLabel>
                            <h3>Rooms for Adshsra</h3>
                            <p>{survey.numberOfRoomsOfferedDuringAdshsra}</p>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                    </IonRow>
                    <IonRow>
                      <IonCol size="12" sizeMd="6">
                        <IonItem lines="none">
                          <IonLabel>
                            <h3>Room Tariff</h3>
                            <p>{survey.roomTariff}</p>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                      <IonCol size="12" sizeMd="6">
                        <IonItem lines="none">
                          <IonLabel>
                            <h3>Features & Additional Info</h3>
                            <div>
                              {survey.breakfast && (
                                <IonChip color="warning">
                                  <IonIcon icon={restaurant} />
                                  <IonLabel>Breakfast</IonLabel>
                                </IonChip>
                              )}
                              {survey.visitingCard && (
                                <IonChip color="success">
                                  <IonIcon icon={checkmark} />
                                  <IonLabel>Visiting Card Collected</IonLabel>
                                </IonChip>
                              )}
                              <IonChip color="primary">
                                <IonIcon icon={analytics} />
                                <IonLabel>{survey.numberOfGuests} Guests</IonLabel>
                              </IonChip>
                            </div>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                    </IonRow>
                    {survey.comments && survey.comments !== 'N/A' && (
                      <IonRow>
                        <IonCol size="12">
                          <IonItem lines="none">
                            <IonLabel>
                              <h3>Comments</h3>
                              <p>{survey.comments}</p>
                            </IonLabel>
                          </IonItem>
                        </IonCol>
                      </IonRow>
                    )}
                    
                    {/* Delete Button Row */}
                    <IonRow>
                      <IonCol size="12">
                        <div style={{ padding: '16px', textAlign: 'center' }}>
                          <IonButton 
                            fill="outline" 
                            color="danger" 
                            onClick={() => confirmDelete(survey)}
                            disabled={loading}
                          >
                            <IonIcon icon={trashOutline} slot="start" />
                            Delete Survey
                          </IonButton>
                        </div>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </div>
              </IonAccordion>
            ))}
          </IonAccordionGroup>
        )}

        {/* Filter Modal */}
        <IonModal isOpen={showFilters} onDidDismiss={() => setShowFilters(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Filters</IonTitle>
              <IonButtons slot="end">
                <IonButton fill="clear" onClick={() => setShowFilters(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList>
              <IonItem>
                <IonLabel position="stacked">AC/Non-AC</IonLabel>
                <IonSelect
                  value={filters.acNonAc}
                  onSelectionChange={(e) => handleFilterChange('acNonAc', e.detail.value)}
                  placeholder="All"
                >
                  <IonSelectOption value="">All</IonSelectOption>
                  <IonSelectOption value="AC">AC</IonSelectOption>
                  <IonSelectOption value="Non-AC">Non-AC</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Visiting Card Collected</IonLabel>
                <IonSelect
                  value={filters.visitingCard}
                  onSelectionChange={(e) => handleFilterChange('visitingCard', e.detail.value)}
                  placeholder="All"
                >
                  <IonSelectOption value="">All</IonSelectOption>
                  <IonSelectOption value="true">Yes</IonSelectOption>
                  <IonSelectOption value="false">No</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Breakfast</IonLabel>
                <IonSelect
                  value={filters.breakfast}
                  onSelectionChange={(e) => handleFilterChange('breakfast', e.detail.value)}
                  placeholder="All"
                >
                  <IonSelectOption value="">All</IonSelectOption>
                  <IonSelectOption value="true">Yes</IonSelectOption>
                  <IonSelectOption value="false">No</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Minimum Rooms</IonLabel>
                <IonInput
                  type="number"
                  value={filters.roomsMin}
                  onIonInput={(e) => handleFilterChange('roomsMin', e.detail.value)}
                  placeholder="0"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Maximum Rooms</IonLabel>
                <IonInput
                  type="number"
                  value={filters.roomsMax}
                  onIonInput={(e) => handleFilterChange('roomsMax', e.detail.value)}
                  placeholder="999"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Location</IonLabel>
                <IonInput
                  value={filters.location}
                  onIonInput={(e) => handleFilterChange('location', e.detail.value)}
                  placeholder="Search by location..."
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Area/City/State</IonLabel>
                <IonInput
                  value={filters.area}
                  onIonInput={(e) => handleFilterChange('area', e.detail.value)}
                  placeholder="Search by broader area..."
                />
              </IonItem>
            </IonList>

            <div className="ion-padding">
              <IonButton expand="block" onClick={clearFilters} fill="outline">
                <IonIcon icon={trashOutline} slot="start" />
                Clear All Filters
              </IonButton>
              <IonButton expand="block" onClick={() => setShowFilters(false)}>
                Apply Filters
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* Toast for export success */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Survey data exported successfully!"
          duration={3000}
          color="success"
        />

        {/* Alert for errors */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Error"
          message={error}
          buttons={['OK']}
        />

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={deleteAlert.isOpen}
          onDidDismiss={() => setDeleteAlert({ isOpen: false, surveyId: null, hotelName: '' })}
          header="Confirm Delete"
          message={`Are you sure you want to delete the survey for "${deleteAlert.hotelName}"? This action cannot be undone.`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                setDeleteAlert({ isOpen: false, surveyId: null, hotelName: '' });
              }
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: () => {
                handleDeleteSurvey(deleteAlert.surveyId);
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminPanelIonic;
