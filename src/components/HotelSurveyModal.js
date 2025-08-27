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
import { surveyAPI, handleAPIError } from '../services/api';
import HotelMap from './HotelMap';


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
          try {
            setLoading(true);
            const response = await surveyAPI.getSurveyByHotel(hotel.name);
            if (response.success && response.surveys.length > 0) {
              const surveyData = response.surveys[0].surveyData;
              setFormData(surveyData);
            } else {
              setFormData(prev => ({ ...prev, hotelName: hotel.name || '' }));
            }
          } catch (err) {
            setError(handleAPIError(err));
            setFormData(prev => ({ ...prev, hotelName: hotel.name || '' }));
          } finally {
            setLoading(false);
          }
        } else {
          setFormData(prev => ({ ...prev, hotelName: hotel.name || '' }));
        }
      }
    };
    loadData();
  }, [hotel, isCompleted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, starRating: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const surveyData = {
        ...formData,
        hotelName: formData.hotelName || hotel?.name || ''
      };

      if (!surveyData.hotelName || !surveyData.numberOfRooms || !surveyData.ownerName ||
        !surveyData.phoneNumber || !surveyData.address) {
        throw new Error('Please fill in all required fields.');
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      onSubmit(hotel.name, surveyData);
      onClose();
    } catch (error) {
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

        {/* Google Maps Section */}
   <Box sx={{ mb: 3 }}>
  <Typography variant="h6" gutterBottom>
    Hotel Location
  </Typography>
{hotel?.name ? <HotelMap hotelName={hotel.name} /> : (
  <Alert severity="warning">Hotel name not available to show location.</Alert>
)}

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
                disabled={true}
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
