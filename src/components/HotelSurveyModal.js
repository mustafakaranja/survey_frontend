import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Rating,
  Typography,
  Box,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { surveyAPI, handleAPIError } from '../services/api';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const HotelSurveyModal = ({ open, onClose, hotel, onSubmit, isCompleted }) => {
  const [formData, setFormData] = useState({
    hotelName: '',
    numberOfRooms: '',
    availableDates: '',
    ownerName: '',
    phoneNumber: '',
    alternateNumber: '',
    address: '',
    acRoomsAvailable: '',
    starRating: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (hotel) {
        if (isCompleted) {
          // Try to load existing survey data from API
          try {
            setLoading(true);
            const response = await surveyAPI.getSurveyByHotel(hotel.name);
            if (response.success && response.surveys.length > 0) {
              // Load the survey data
              const surveyData = response.surveys[0].surveyData;
              setFormData(surveyData);
            } else {
              // Fallback to hotel name
              setFormData(prev => ({
                ...prev,
                hotelName: hotel.name || ''
              }));
            }
          } catch (err) {
            setError(handleAPIError(err));
            // Fallback to hotel name
            setFormData(prev => ({
              ...prev,
              hotelName: hotel.name || ''
            }));
          } finally {
            setLoading(false);
          }
        } else {
          // Initialize with hotel name
          setFormData(prev => ({
            ...prev,
            hotelName: hotel.name || ''
          }));
        }
      }
    };

    loadData();
  }, [hotel, isCompleted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      starRating: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Survey form data being submitted:', formData);
      console.log('Hotel object:', hotel);
      
      // Ensure hotel name is set (use hotel.name as fallback)
      const surveyData = {
        ...formData,
        hotelName: formData.hotelName || hotel?.name || ''
      };
      
      console.log('Final survey data:', surveyData);

      // Validate required fields
      if (!surveyData.hotelName || !surveyData.numberOfRooms || !surveyData.ownerName || 
          !surveyData.phoneNumber || !surveyData.address) {
        console.log('Validation failed. Missing fields:');
        console.log('Hotel Name:', surveyData.hotelName);
        console.log('Number of Rooms:', surveyData.numberOfRooms);
        console.log('Owner Name:', surveyData.ownerName);
        console.log('Phone Number:', surveyData.phoneNumber);
        console.log('Address:', surveyData.address);
        throw new Error('Please fill in all required fields: Hotel Name, Number of Rooms, Owner Name, Phone Number, and Address');
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Calling onSubmit with:', hotel.name, surveyData);
      onSubmit(hotel.name, surveyData);
      onClose();
    } catch (error) {
      console.error('Survey submission error:', error);
      setError(error.message || 'Error submitting survey');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      hotelName: hotel?.name || '',
      numberOfRooms: '',
      availableDates: '',
      ownerName: '',
      phoneNumber: '',
      alternateNumber: '',
      address: '',
      acRoomsAvailable: '',
      starRating: 0
    });
  };

  if (!hotel) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isCompleted ? 'View Survey' : 'Hotel Survey Form'} - {hotel.name}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Map Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Hotel Location
          </Typography>
          <Box sx={{ height: 300, border: '1px solid #ccc', borderRadius: 1 }}>
            <MapContainer
              center={[hotel.lat || 40.7589, hotel.lng || -73.9851]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[hotel.lat || 40.7589, hotel.lng || -73.9851]}>
                <Popup>
                  <strong>{hotel.name}</strong>
                </Popup>
              </Marker>
            </MapContainer>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {isCompleted && (
          <Alert severity="info" sx={{ mb: 3 }}>
            This survey has been completed. You can view the responses below.
          </Alert>
        )}

        {/* Survey Form */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="hotelName"
                label="Hotel Name"
                value={formData.hotelName}
                onChange={handleChange}
                fullWidth
                required
                disabled={true} // Auto-populated
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="numberOfRooms"
                label="Number of Rooms"
                type="number"
                value={formData.numberOfRooms}
                onChange={handleChange}
                fullWidth
                required
                disabled={isCompleted}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="availableDates"
                label="Available Dates"
                value={formData.availableDates}
                onChange={handleChange}
                fullWidth
                placeholder="e.g., Jan 1 - Dec 31, 2024"
                disabled={isCompleted}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="ownerName"
                label="Owner Name"
                value={formData.ownerName}
                onChange={handleChange}
                fullWidth
                required
                disabled={isCompleted}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="phoneNumber"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                fullWidth
                required
                disabled={isCompleted}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="alternateNumber"
                label="Alternate Number"
                value={formData.alternateNumber}
                onChange={handleChange}
                fullWidth
                disabled={isCompleted}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                required
                disabled={isCompleted}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset" disabled={isCompleted}>
                <FormLabel component="legend">AC Rooms Available</FormLabel>
                <RadioGroup
                  row
                  name="acRoomsAvailable"
                  value={formData.acRoomsAvailable}
                  onChange={handleChange}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography component="legend">Hotel Star Rating</Typography>
                <Rating
                  name="starRating"
                  value={Number(formData.starRating)}
                  onChange={handleRatingChange}
                  max={5}
                  disabled={isCompleted}
                />
              </Box>
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {isCompleted ? 'Close' : 'Cancel'}
        </Button>
        {!isCompleted && (
          <>
            <Button onClick={handleReset} color="secondary">
              Reset
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={loading}
              type="submit"
            >
              {loading ? 'Submitting...' : 'Submit Survey'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default HotelSurveyModal;
