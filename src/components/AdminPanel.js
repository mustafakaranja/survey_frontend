import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  Refresh,
  Download,
  Assessment
} from '@mui/icons-material';
import { surveyAPI, handleAPIError } from '../services/api';

const AdminPanel = () => {
  const [surveys, setSurveys] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load all surveys and statistics
      const [surveysResponse, statsResponse] = await Promise.all([
        surveyAPI.getAllSurveys(),
        surveyAPI.getStats()
      ]);

      if (surveysResponse.success) {
        setSurveys(surveysResponse.surveys);
      }
      
      if (statsResponse.success) {
        setStats(statsResponse);
      }
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(surveys, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `hotel_surveys_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={handleRefresh}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Download />} 
            onClick={handleExport}
            disabled={surveys.length === 0}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics Overview */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {stats.overview.totalHotels}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Hotels
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {stats.overview.completedSurveys}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Completed Surveys
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {stats.overview.pendingSurveys}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Pending Surveys
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" color="info.main">
                  {stats.overview.totalUsers}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* User Statistics */}
      {stats?.userStats && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Performance
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Group</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Total Hotels</TableCell>
                    <TableCell align="center">Completed</TableCell>
                    <TableCell align="center">Pending</TableCell>
                    <TableCell align="center">Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.userStats.map((user) => (
                    <TableRow key={user.username}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.group}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={user.role === 'admin' ? 'secondary' : 'primary'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="center">{user.totalHotels}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={user.completedSurveys} 
                          color="success" 
                          variant="outlined" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={user.pendingSurveys} 
                          color="warning" 
                          variant="outlined" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="center">
                        {user.totalHotels > 0 
                          ? `${Math.round((user.completedSurveys / user.totalHotels) * 100)}%`
                          : 'N/A'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Survey Data Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Survey Submissions ({surveys.length})
          </Typography>
          
          {surveys.length === 0 ? (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No surveys submitted yet.
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Hotel Name</TableCell>
                    <TableCell>Submitted By</TableCell>
                    <TableCell>Submission Date</TableCell>
                    <TableCell>Owner Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell align="center">Rooms</TableCell>
                    <TableCell align="center">AC Available</TableCell>
                    <TableCell align="center">Star Rating</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {surveys.map((survey, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {survey.hotelName}
                        </Typography>
                      </TableCell>
                      <TableCell>{survey.username}</TableCell>
                      <TableCell>{formatDate(survey.submittedAt)}</TableCell>
                      <TableCell>{survey.surveyData.ownerName || 'N/A'}</TableCell>
                      <TableCell>{survey.surveyData.phoneNumber || 'N/A'}</TableCell>
                      <TableCell align="center">{survey.surveyData.numberOfRooms || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={survey.surveyData.acRoomsAvailable === 'yes' ? 'Yes' : 'No'} 
                          color={survey.surveyData.acRoomsAvailable === 'yes' ? 'success' : 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="center">
                        {survey.surveyData.starRating ? `${survey.surveyData.starRating} ⭐` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="body2">View Details</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box>
                              <Typography variant="body2" gutterBottom>
                                <strong>Address:</strong> {survey.surveyData.address || 'N/A'}
                              </Typography>
                              <Typography variant="body2" gutterBottom>
                                <strong>Available Dates:</strong> {survey.surveyData.availableDates || 'N/A'}
                              </Typography>
                              <Typography variant="body2" gutterBottom>
                                <strong>Alternate Number:</strong> {survey.surveyData.alternateNumber || 'N/A'}
                              </Typography>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="caption" color="textSecondary">
                                Submitted: {formatDate(survey.submittedAt)}
                              </Typography>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminPanel;
