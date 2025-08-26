import React, { useState, useEffect, useCallback } from 'react';
import { testGetAllSurveys } from '../testAPI';
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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
  IconButton,
  Divider,
  Stack,
  TablePagination,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Search,
  FilterList,
  Refresh,
  Download,
  Assessment,
  Hotel,
  Close,
  Star,
  LocationOn,
  AcUnit,
  Phone,
  Person,
  CalendarToday,
  Clear,
  BusinessCenter
} from '@mui/icons-material';
import { surveyAPI, handleAPIError } from '../services/api';

const AdminPanel = () => {
  const [surveys, setSurveys] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    starRating: '',
    acAvailable: '',
    roomsMin: '',
    roomsMax: '',
    location: ''
  });

  // Define applyFilters before useEffect that uses it
  const applyFilters = useCallback(() => {
    let filtered = surveys;

    // Search filter (hotel name, owner name, address)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(survey => 
        survey.hotelName.toLowerCase().includes(searchLower) ||
        survey.ownerName.toLowerCase().includes(searchLower) ||
        survey.address.toLowerCase().includes(searchLower)
      );
    }

    // Star rating filter
    if (filters.starRating) {
      filtered = filtered.filter(survey => survey.starRating === parseInt(filters.starRating));
    }

    // AC availability filter
    if (filters.acAvailable !== '') {
      const acFilter = filters.acAvailable === 'true';
      filtered = filtered.filter(survey => survey.acRoomsAvailable === acFilter);
    }

    // Rooms count filter
    if (filters.roomsMin) {
      filtered = filtered.filter(survey => survey.numberOfRooms >= parseInt(filters.roomsMin));
    }
    if (filters.roomsMax) {
      filtered = filtered.filter(survey => survey.numberOfRooms <= parseInt(filters.roomsMax));
    }

    // Location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      filtered = filtered.filter(survey => 
        survey.address.toLowerCase().includes(locationLower)
      );
    }

    setFilteredSurveys(filtered);
    setPage(0); // Reset to first page when filters change
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
      
      if (response.success && response.surveys) {
        surveysData = response.surveys;
      } else if (Array.isArray(response)) {
        surveysData = response;
      } else if (response.data && Array.isArray(response.data)) {
        surveysData = response.data;
      } else {
        console.warn('Unexpected response structure:', response);
        surveysData = [];
      }
      
      console.log('Surveys data:', surveysData);
      
      // Transform the data to match expected format
      const transformedSurveys = surveysData.map((survey, index) => {
        console.log(`Transforming survey ${index}:`, survey);
        
        return {
          _id: survey._id || survey.id || `survey_${index}`,
          username: survey.username || survey.surveyedBy || 'Unknown',
          hotelName: survey.hotelName || survey.hotel_name || 'Unknown Hotel',
          numberOfRooms: survey.surveyData?.numberOfRooms || survey.numberOfRooms || survey.rooms || 0,
          availableDates: survey.surveyData?.availableDates || survey.availableDates || survey.available_dates || 'N/A',
          ownerName: survey.surveyData?.ownerName || survey.ownerName || survey.owner_name || 'N/A',
          phoneNumber: survey.surveyData?.phoneNumber || survey.phoneNumber || survey.phone_number || 'N/A',
          alternateNumber: survey.surveyData?.alternateNumber || survey.alternateNumber || survey.alternate_number || 'N/A',
          address: survey.surveyData?.address || survey.address || 'N/A',
          acRoomsAvailable: survey.surveyData?.acRoomsAvailable === 'yes' || survey.acRoomsAvailable === 'yes' || survey.ac_available === 'yes' || false,
          starRating: survey.surveyData?.starRating || survey.starRating || survey.star_rating || 0,
          createdAt: survey.submittedAt || survey.createdAt || survey.created_at || new Date().toISOString(),
          updatedAt: survey.submittedAt || survey.updatedAt || survey.updated_at || new Date().toISOString()
        };
      });
      
      console.log('Transformed surveys:', transformedSurveys);
      setSurveys(transformedSurveys);
    } catch (err) {
      console.error('Error loading surveys:', err);
      setError(handleAPIError(err));
      setSurveys([]); // Set empty array on error
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
      starRating: '',
      acAvailable: '',
      roomsMin: '',
      roomsMax: '',
      location: ''
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredSurveys, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `hotel_surveys_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate statistics
  const totalSurveys = surveys.length;
  const avgRating = surveys.length > 0 ? 
    (surveys.reduce((sum, s) => sum + s.starRating, 0) / surveys.length).toFixed(1) : 0;
  const acHotels = surveys.filter(s => s.acRoomsAvailable).length;
  const totalRooms = surveys.reduce((sum, s) => sum + parseInt(s.numberOfRooms || 0), 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ color: '#344767', fontWeight: 600, mb: 1 }}>
            Survey Master Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#67748e' }}>
            Comprehensive view of all hotel survey submissions
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<FilterList />} 
            onClick={() => setFilterDrawerOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Filters
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={loadSurveys}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Download />} 
            onClick={handleExport}
            disabled={filteredSurveys.length === 0}
            sx={{ borderRadius: 2 }}
          >
            Export Data
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
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
                  Total Surveys
                </Typography>
                <Typography variant="h3" sx={{ 
                  color: 'white', 
                  fontWeight: 700, 
                  mb: 1,
                }}>
                  {totalSurveys}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: '0.8rem',
                }}>
                  Hotels surveyed
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
                <Assessment sx={{ fontSize: 20, color: 'white' }} />
              </Box>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
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
                  Average Rating
                </Typography>
                <Typography variant="h3" sx={{ 
                  color: 'white', 
                  fontWeight: 700, 
                  mb: 1,
                }}>
                  {avgRating}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: '0.8rem',
                }}>
                  ⭐ star rating
                </Typography>
              </Box>
              <Box sx={{
                width: 48,
                height: 48,
                background: 'linear-gradient(195deg, #ff9800, #f57c00)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: 2,
              }}>
                <Star sx={{ fontSize: 20, color: 'white' }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
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
                  AC Hotels
                </Typography>
                <Typography variant="h3" sx={{ 
                  color: 'white', 
                  fontWeight: 700, 
                  mb: 1,
                }}>
                  {acHotels}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: '0.8rem',
                }}>
                  with AC facilities
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
                <AcUnit sx={{ fontSize: 20, color: 'white' }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
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
                  Total Rooms
                </Typography>
                <Typography variant="h3" sx={{ 
                  color: 'white', 
                  fontWeight: 700, 
                  mb: 1,
                }}>
                  {totalRooms}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: '0.8rem',
                }}>
                  across all hotels
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
                <Hotel sx={{ fontSize: 20, color: 'white' }} />
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by hotel name, owner name, or address..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#67748e' }} />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => handleFilterChange('search', '')}
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#344767', fontWeight: 600 }}>
              Survey Master Table ({filteredSurveys.length} records)
            </Typography>
            {Object.values(filters).some(filter => filter !== '') && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                onClick={clearFilters}
                sx={{ borderRadius: 1 }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
          
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#67748e', mb: 1 }}>
                Loading surveys...
              </Typography>
              <Typography variant="body2" sx={{ color: '#67748e' }}>
                Please wait while we fetch the data
              </Typography>
            </Box>
          ) : filteredSurveys.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BusinessCenter sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#67748e', mb: 1 }}>
                No surveys found
              </Typography>
              <Typography variant="body2" sx={{ color: '#67748e' }}>
                {surveys.length === 0 ? 'No survey data available. Try refreshing or check if the backend is running.' : 'Try adjusting your search criteria or filters'}
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Hotel Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Surveyed By</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }} align="center">Rooms</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Available Dates</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Owner Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Phone</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Alt. Phone</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Address</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }} align="center">AC</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }} align="center">Rating</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Created At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSurveys
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((survey) => (
                      <TableRow key={survey._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ 
                              bgcolor: '#e3f2fd', 
                              color: '#1976d2',
                              width: 32,
                              height: 32,
                              mr: 2,
                              fontSize: '0.8rem'
                            }}>
                              <Hotel fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {survey.hotelName}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ 
                              bgcolor: '#f3e5f5', 
                              color: '#7b1fa2',
                              width: 24,
                              height: 24,
                              mr: 1,
                              fontSize: '0.7rem'
                            }}>
                              <Person fontSize="small" />
                            </Avatar>
                            <Typography variant="body2">
                              {survey.username}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={survey.numberOfRooms} 
                            size="small" 
                            sx={{ bgcolor: '#e8f5e8', color: '#2e7d32', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <CalendarToday sx={{ fontSize: 16, color: '#67748e', mr: 1 }} />
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                              {survey.availableDates}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {survey.ownerName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Phone sx={{ fontSize: 16, color: '#67748e', mr: 1 }} />
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                              {survey.phoneNumber}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#67748e' }}>
                            {survey.alternateNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" sx={{ maxWidth: 200 }}>
                            <LocationOn sx={{ fontSize: 16, color: '#67748e', mr: 1 }} />
                            <Tooltip title={survey.address}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: '0.8rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {survey.address}
                              </Typography>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={survey.acRoomsAvailable ? 'Yes' : 'No'} 
                            color={survey.acRoomsAvailable ? 'success' : 'default'} 
                            size="small"
                            icon={survey.acRoomsAvailable ? <AcUnit sx={{ fontSize: 16 }} /> : undefined}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center">
                            <Star sx={{ fontSize: 16, color: '#ffc107', mr: 0.5 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {survey.starRating}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {formatDate(survey.createdAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredSurveys.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ borderTop: '1px solid #e0e0e0' }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: { width: 300, p: 3 }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>Star Rating</InputLabel>
            <Select
              value={filters.starRating}
              label="Star Rating"
              onChange={(e) => handleFilterChange('starRating', e.target.value)}
            >
              <MenuItem value="">All Ratings</MenuItem>
              {[1, 2, 3, 4, 5].map(rating => (
                <MenuItem key={rating} value={rating}>
                  {rating} Star{rating > 1 ? 's' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>AC Available</InputLabel>
            <Select
              value={filters.acAvailable}
              label="AC Available"
              onChange={(e) => handleFilterChange('acAvailable', e.target.value)}
            >
              <MenuItem value="">All Hotels</MenuItem>
              <MenuItem value="true">AC Available</MenuItem>
              <MenuItem value="false">No AC</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Min Rooms"
            type="number"
            value={filters.roomsMin}
            onChange={(e) => handleFilterChange('roomsMin', e.target.value)}
            InputProps={{ inputProps: { min: 0 } }}
          />

          <TextField
            fullWidth
            label="Max Rooms"
            type="number"
            value={filters.roomsMax}
            onChange={(e) => handleFilterChange('roomsMax', e.target.value)}
            InputProps={{ inputProps: { min: 0 } }}
          />

          <TextField
            fullWidth
            label="Location Filter"
            placeholder="Filter by address..."
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />

          <Divider />

          <Button
            variant="outlined"
            fullWidth
            startIcon={<Clear />}
            onClick={clearFilters}
            sx={{ borderRadius: 2 }}
          >
            Clear All Filters
          </Button>
        </Stack>
      </Drawer>
    </Container>
  );
};

export default AdminPanel;
