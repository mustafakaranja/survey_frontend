import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
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
import AdminPanel from './AdminPanel';
import { authAPI, surveyAPI, handleAPIError } from '../services/api';

const HomeScreen = ({ user, onLogout }) => {
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userHotels, setUserHotels] = useState(user?.hotels || []);
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const refreshData = async () => {
      if (user) {
        try {
          setLoading(true);
          const response = await authAPI.getUserDetails(user.username);
          if (response.success) {
            setUserHotels(response.user.hotels || []);
          }
        } catch (err) {
          setError(handleAPIError(err));
        } finally {
          setLoading(false);
        }
      }
    };
    
    refreshData();
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
      const response = await surveyAPI.submitSurvey({
        hotelName,
        surveyData,
        username: user.username
      });

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
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const totalHotels = userHotels.length;
  const completedHotels = userHotels.filter(h => h.completed).length;
  const pendingHotels = totalHotels - completedHotels;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <HotelOutlined sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hotel Survey App
          </Typography>
          {isAdmin && (
            <Box sx={{ mr: 2 }}>
              <Tabs 
                value={currentTab} 
                onChange={(e, newValue) => setCurrentTab(newValue)}
                textColor="inherit"
                indicatorColor="secondary"
              >
                <Tab label="Dashboard" />
                <Tab label="Admin Panel" />
              </Tabs>
            </Box>
          )}
          <IconButton color="inherit" onClick={onLogout}>
            <LogoutOutlined />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {isAdmin && currentTab === 1 ? (
          <AdminPanel />
        ) : (
          <>
            {/* User Profile Section */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: user?.role === 'admin' ? 'secondary.main' : 'primary.main' }}>
                    {user?.role === 'admin' ? <AdminPanelSettingsOutlined /> : <PersonOutlined />}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      Welcome, {user?.username}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <GroupOutlined fontSize="small" />
                      <Chip 
                        label={user?.group} 
                        color={user?.role === 'admin' ? 'secondary' : 'primary'} 
                        variant="outlined" 
                      />
                      {user?.role === 'admin' && (
                        <Chip label="Admin" color="secondary" size="small" />
                      )}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {!isAdmin && (
              <>
                {/* KPIs Section */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <HotelOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h4" color="primary">
                          {totalHotels}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Total Hotels
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <CheckCircleOutlined sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                        <Typography variant="h4" color="success.main">
                          {completedHotels}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Completed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <PendingOutlined sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                        <Typography variant="h4" color="warning.main">
                          {pendingHotels}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Pending
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Hotel List Section */}
                <Typography variant="h5" gutterBottom>
                  Assigned Hotels
                </Typography>
                <Grid container spacing={3}>
                  {userHotels.map((hotel, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          border: hotel.completed ? '2px solid #4caf50' : '1px solid #e0e0e0',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" component="h2">
                              {hotel.name}
                            </Typography>
                            {hotel.completed ? (
                              <CheckCircleOutlined color="success" />
                            ) : (
                              <PendingOutlined color="warning" />
                            )}
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            Status: {hotel.completed ? 'Completed' : 'Pending'}
                          </Typography>
                          {hotel.completed && (
                            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                              ✓ Survey submitted
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            variant={hotel.completed ? "outlined" : "contained"}
                            onClick={() => handleHotelClick(hotel)}
                            fullWidth
                            disabled={loading}
                          >
                            {hotel.completed ? 'View Survey' : 'Start Survey'}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </>
        )}
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
