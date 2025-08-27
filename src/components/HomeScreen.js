import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Avatar,
  Alert
} from '@mui/material';
import { 
  LogoutOutlined, 
  PersonOutlined, 
  GroupOutlined,
  HotelOutlined,
  CheckCircleOutlined,
  PendingOutlined,
  AdminPanelSettingsOutlined
} from '@mui/icons-material';
import HotelSurveyModal from './HotelSurveyModal';
import { authAPI, surveyAPI, handleAPIError } from '../services/api';

const HomeScreen = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userHotels, setUserHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedHotels, setSubmittedHotels] = useState([]);


  const isAdmin = user?.role === 'admin';

  // Navigate to admin panel
  const handleAdminClick = () => {
    navigate('/admin');
  };

  // Debug: Log user data and role
  useEffect(() => {
    console.log('HomeScreen - Current user:', user);
    console.log('HomeScreen - User role:', user?.role);
    console.log('HomeScreen - Is Admin:', isAdmin);
  }, [user, isAdmin]);

  // Transform hotel names from API response into hotel objects
  useEffect(() => {
    if (user && user.hotels) {
      console.log('Transforming hotel data from user:', user);
      console.log('User hotels array:', user.hotels);
      
      const transformedHotels = user.hotels.map((hotelName, index) => ({
        name: hotelName,
        completed: false, // Default to not completed
        id: index
      }));
      
      console.log('Transformed hotels:', transformedHotels);
      setUserHotels(transformedHotels);
    }
  }, [user]);

  useEffect(() => {
  const fetchSubmittedHotels = async () => {
    try {
      const response = await fetch('https://surveybackend-production-8dbc.up.railway.app/api/surveys');
      const result = await response.json();

      if (result.status === 'success' && Array.isArray(result.data)) {
        const userSubmitted = result.data
          .filter(item => item.username === user?.username)
          .map(item => item.hotelName);
        setSubmittedHotels(userSubmitted);
      }
    } catch (err) {
      console.error('Error fetching submitted hotels:', err);
    }
  };

  if (user?.username) fetchSubmittedHotels();
}, [user]);


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
        const userResponse = await authAPI.getUserDetails(user.username);
        if (userResponse.success) {
          setUserHotels(userResponse.user.hotels || []);
        }
        
        // Update user data in localStorage as well
        const updatedHotels = userHotels.map(hotel => 
          hotel.name === hotelName 
            ? { ...hotel, completed: true, surveyData }
            : hotel
        );
        const updatedUser = { ...user, hotels: updatedHotels };
        localStorage.setItem('hotelSurveyUser', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('HomeScreen - Survey submission error:', err);
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const totalHotels = userHotels.length;
const completedHotels = submittedHotels.filter(hotelName =>
  userHotels.some(hotel => hotel.name === hotelName)
).length;
const pendingHotels = totalHotels - completedHotels;

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ 
          background: 'linear-gradient(195deg, #42424a, #191919)',
          borderRadius: '0.75rem',
          margin: '1rem',
          padding: '0.875rem 1.5rem !important'
        }}>
          <HotelOutlined sx={{ mr: 2, color: 'white' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white', fontWeight: 600 }}>
            Hotel Survey Dashboard
          </Typography>

             {/* Show Submitted Data button only for normal users */}
    {!isAdmin && (
      
      <Button
        variant="outlined"
        onClick={() => navigate('/submitted-data')}
        sx={{
          color: 'white',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          mr: 2,
          '&:hover': {
            borderColor: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        Submitted Data
      </Button>

      
    )}
          
          {/* Admin Button - Only show if user role is admin */}
          {isAdmin && (
            <Button
              variant="outlined"
              startIcon={<AdminPanelSettingsOutlined />}
              onClick={handleAdminClick}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                mr: 2,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Admin Panel
            </Button>
          )}
          
          <IconButton 
            color="inherit" 
            onClick={onLogout}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <LogoutOutlined />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* User Profile Section */}
            <Card sx={{ 
              mb: 4, 
              background: 'linear-gradient(195deg, #66bb6a, #43a047)',
              color: 'white',
              borderRadius: 3,
              overflow: 'visible',
              position: 'relative',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={3}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      width: 64, 
                      height: 64,
                      backdropFilter: 'blur(10px)',
                    }}>
                      {isAdmin ? <AdminPanelSettingsOutlined sx={{ fontSize: 32 }} /> : <PersonOutlined sx={{ fontSize: 32 }} />}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 300 }}>
                        Welcome back, {user?.username}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                        <GroupOutlined fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                        <Chip 
                          label={user?.group} 
                          sx={{ 
                            bgcolor: 'rgba(255, 255, 255, 0.2)', 
                            color: 'white',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)',
                          }}
                        />
                        <Chip 
                          label={`Role: ${user?.role || 'Member'}`} 
                          sx={{ 
                            bgcolor: isAdmin ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 255, 255, 0.2)', 
                            color: isAdmin ? '#fff176' : 'white',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)',
                          }}
                        />
                        {isAdmin && (
                          <Chip 
                            label="Administrator" 
                            icon={<AdminPanelSettingsOutlined />}
                            sx={{ 
                              bgcolor: 'rgba(255, 255, 255, 0.9)', 
                              color: '#43a047',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* KPIs Section - Minimalistic Style */}
                <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
                 <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Card sx={{ 
                      background: 'linear-gradient(195deg, #42424a, #191919)',
                      color: 'white',
                      borderRadius: 2,
                      p: 3,
                    }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            textTransform: 'uppercase', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            mb: 1,
                          }}>
                            Total Hotels
                          </Typography>
                      <Typography 
  variant="h3" 
  sx={{ color: 'white', fontWeight: 700, mb: 1, fontSize: { xs: '1.8rem', sm: '2.2rem' } }}
>

                            {totalHotels}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            fontSize: '0.8rem',
                          }}>
                            <Box component="span" sx={{ color: '#4caf50', fontWeight: 600 }}>
                              +3%
                            </Box>
                            {' '}than last month
                          </Typography>
                        </Box>
                        <Box sx={{
                          width: 48,
                          height: 48,
                          background: 'linear-gradient(195deg, #e91e63, #ad1457)',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          ml: 2,
                        }}>
                          <HotelOutlined sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                  
                 <Grid item xs={12} sm={6} md={4} lg={3}>

                    <Card sx={{ 
                      background: 'linear-gradient(195deg, #42424a, #191919)',
                      color: 'white',
                      borderRadius: 2,
                      p: 3,
                    }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            textTransform: 'uppercase', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            mb: 1,
                          }}>
                            Completed
                          </Typography>
                       <Typography 
  variant="h3" 
  sx={{ color: 'white', fontWeight: 700, mb: 1, fontSize: { xs: '1.8rem', sm: '2.2rem' } }}
>

                            {completedHotels}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            fontSize: '0.8rem',
                          }}>
                            <Box component="span" sx={{ color: '#4caf50', fontWeight: 600 }}>
                              +{Math.round((completedHotels / totalHotels) * 100) || 0}%
                            </Box>
                            {' '}completion rate
                          </Typography>
                        </Box>
                        <Box sx={{
                          width: 48,
                          height: 48,
                          background: 'linear-gradient(195deg, #66bb6a, #43a047)',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          ml: 2,
                        }}>
                          <CheckCircleOutlined sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                 <Grid item xs={12} sm={6} md={4} lg={3}>

                    <Card sx={{ 
                      background: 'linear-gradient(195deg, #42424a, #191919)',
                      color: 'white',
                      borderRadius: 2,
                      p: 3,
                    }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            textTransform: 'uppercase', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            mb: 1,
                          }}>
                            Pending
                          </Typography>
                       <Typography 
  variant="h3" 
  sx={{ color: 'white', fontWeight: 700, mb: 1, fontSize: { xs: '1.8rem', sm: '2.2rem' } }}
>

                            {pendingHotels}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            fontSize: '0.8rem',
                          }}>
                            <Box component="span" sx={{ color: '#ff9800', fontWeight: 600 }}>
                              {Math.round((pendingHotels / totalHotels) * 100) || 0}%
                            </Box>
                            {' '}remaining
                          </Typography>
                        </Box>
                        <Box sx={{
                          width: 48,
                          height: 48,
                          background: 'linear-gradient(195deg, #fb8c00, #f57c00)',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          ml: 2,
                        }}>
                          <PendingOutlined sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                 <Grid item xs={12} sm={6} md={4} lg={3}>

                    <Card sx={{ 
                      background: 'linear-gradient(195deg, #42424a, #191919)',
                      color: 'white',
                      borderRadius: 2,
                      p: 3,
                    }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            textTransform: 'uppercase', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            mb: 1,
                          }}>
                            Progress
                          </Typography>
                        <Typography 
                        variant="h3" 
                         sx={{ color: 'white', fontWeight: 700, mb: 1, fontSize: { xs: '1.8rem', sm: '2.2rem' } }}
                 >

                            {Math.round((completedHotels / totalHotels) * 100) || 0}%
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            fontSize: '0.8rem',
                          }}>
                            <Box component="span" sx={{ color: '#00bcd4', fontWeight: 600 }}>
                              {completedHotels}/{totalHotels}
                            </Box>
                            {' '}surveys completed
                          </Typography>
                        </Box>
                        <Box sx={{
                          width: 48,
                          height: 48,
                          background: 'linear-gradient(195deg, #26c6da, #00acc1)',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          ml: 2,
                        }}>
                          <GroupOutlined sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>

                {/* Hotel List Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h4" gutterBottom sx={{ color: '#344767', fontWeight: 600, mb: 3 }}>
                    Assigned Hotels
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#67748e', mb: 4 }}>
                    Complete surveys for all your assigned hotels to track your progress.
                  </Typography>
                </Box>
                
                <Grid container spacing={{ xs: 2, sm: 3 }}>

               {userHotels.map((hotel, index) => {
  const isAlreadySubmitted = submittedHotels.includes(hotel.name);

  return (
   <Grid item xs={12} sm={6} md={4} lg={3} key = {index}>

      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: isAlreadySubmitted
            ? '1px solid #9e9e9e'
            : hotel.completed
            ? '1px solid #4caf50'
            : '1px solid #e0e0e0',
          opacity: isAlreadySubmitted ? 0.6 : 1,
          pointerEvents: isAlreadySubmitted ? 'none' : 'auto',
          transition: 'all 0.2s ease-in-out',
          '&:hover': !isAlreadySubmitted && {
            transform: 'translateY(-4px)',
            boxShadow: '0rem 0.25rem 1rem rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="h2" sx={{ color: '#344767', fontWeight: 600, mb: 1 }}>
                {hotel.name}
              </Typography>
              <Typography variant="body2" sx={{
                color: isAlreadySubmitted
                  ? '#9e9e9e'
                  : hotel.completed
                  ? '#4caf50'
                  : '#67748e',
                fontWeight: 500,
                fontSize: '0.8rem'
              }}>
                {isAlreadySubmitted
                  ? 'Already Submitted'
                  : hotel.completed
                  ? '✓ Completed'
                  : ' Pending Survey'}
              </Typography>
            </Box>
          </Box>
        </CardContent>

        <CardActions sx={{ p: 3, pt: 0 }}>
    <Button
  size="medium"
  variant={hotel.completed ? "outlined" : "contained"}
  onClick={() => handleHotelClick(hotel)}
  fullWidth
  disabled={isAlreadySubmitted || loading}
  sx={{
    borderRadius: 2,
    py: 1,
    fontWeight: 600,
    fontSize: '0.85rem',
    textTransform: 'none',
    backgroundColor: isAlreadySubmitted
      ? '#b0b0b0' // soft grey for submitted
      : hotel.completed
      ? '#e3f2fd' // light blue for view survey
      : '#4cafef', // soft primary for active survey
    color: isAlreadySubmitted
      ? '#fff'
      : hotel.completed
      ? '#1976d2'
      : '#fff',
    boxShadow: isAlreadySubmitted ? 'none' : '0px 2px 6px rgba(0,0,0,0.2)',
    '&:hover': isAlreadySubmitted
      ? {}
      : hotel.completed
      ? { backgroundColor: '#bbdefb' }
      : { backgroundColor: '#3a9ad9' }
  }}
>
  {isAlreadySubmitted
    ? 'Survey Submitted'
    : hotel.completed
    ? 'View Survey'
    : 'Start Survey'}
</Button>

        </CardActions>
      </Card>
    </Grid>
  );
})}

                </Grid>
      </Container>

      {/* Survey Modal */}
      <HotelSurveyModal
        open={modalOpen}
        onClose={handleCloseModal}
        hotel={selectedHotel}
        onSubmit={handleSurveyComplete}
        isCompleted={selectedHotel?.completed || false}
      />
    </>
  );
};

export default HomeScreen;
