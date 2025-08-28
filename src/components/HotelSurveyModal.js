import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Box,
  Divider,
  Alert,
  CircularProgress,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { surveyAPI, handleAPIError } from '../services/api';

const HotelSurveyModal = ({ open, onClose, hotel, onSubmit, isCompleted }) => {
  const [formData, setFormData] = useState({
    hotelName: '',
    address: '',
    managerEmail: '',
    managerContactNumber: '',
    whatsappNumber: '',
    acNonAc: 'AC',
    dormitory: false,
    numberOfRoomsInHotel: '',
    roomTariff: '',
    breakfast: false,
    numberOfRoomsOfferedDuringAdshsra: '',
    comments: '',
    visitingCard: false,
    numberOfGuests: ''
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
              // Fallback to hotel data
              setFormData(prev => ({
                ...prev,
                hotelName: hotel.name || '',
                address: hotel.address || ''
              }));
            }
          } catch (err) {
            setError(handleAPIError(err));
            // Fallback to hotel data
            setFormData(prev => ({
              ...prev,
              hotelName: hotel.name || '',
              address: hotel.address || ''
            }));
          } finally {
            setLoading(false);
          }
        } else {
          // Initialize with hotel data
          setFormData(prev => ({
            ...prev,
            hotelName: hotel.name || '',
            address: hotel.address || ''
          }));
        }
      }
    };

    loadData();
  }, [hotel, isCompleted]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      if (!surveyData.hotelName || !surveyData.address || !surveyData.managerEmail || 
          !surveyData.managerContactNumber || !surveyData.whatsappNumber || !surveyData.acNonAc ||
          !surveyData.numberOfRoomsInHotel || !surveyData.roomTariff || !surveyData.numberOfRoomsOfferedDuringAdshsra ||
          !surveyData.numberOfGuests) {
        console.log('Validation failed. Missing fields:');
        console.log('Hotel Name:', surveyData.hotelName);
        console.log('Address:', surveyData.address);
        console.log('Manager Email:', surveyData.managerEmail);
        console.log('Manager Contact Number:', surveyData.managerContactNumber);
        console.log('WhatsApp Number:', surveyData.whatsappNumber);
        console.log('AC/Non-AC:', surveyData.acNonAc);
        console.log('Number of Rooms in Hotel:', surveyData.numberOfRoomsInHotel);
        console.log('Room Tariff:', surveyData.roomTariff);
        console.log('Rooms Offered During Adshsra:', surveyData.numberOfRoomsOfferedDuringAdshsra);
        console.log('Number of Guests:', surveyData.numberOfGuests);
        throw new Error('Please fill in all required fields');
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
      address: hotel?.address || '',
      managerEmail: '',
      managerContactNumber: '',
      whatsappNumber: '',
      acNonAc: 'AC',
      dormitory: false,
      numberOfRoomsInHotel: '',
      roomTariff: '',
      breakfast: false,
      numberOfRoomsOfferedDuringAdshsra: '',
      comments: '',
      visitingCard: false,
      numberOfGuests: ''
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

            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                required
                disabled={true} // Auto-populated
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="managerEmail"
                label="Manager Email ID"
                type="email"
                value={formData.managerEmail}
                onChange={handleChange}
                fullWidth
                required
                disabled={isCompleted}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="managerContactNumber"
                label="Manager Contact Number"
                type="number"
                value={formData.managerContactNumber}
                onChange={handleChange}
                fullWidth
                required
                disabled={isCompleted}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="whatsappNumber"
                label="WhatsApp Number"
                type="number"
                value={formData.whatsappNumber}
                onChange={handleChange}
                fullWidth
                required
                disabled={isCompleted}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={isCompleted}>
                <InputLabel>AC/Non-AC</InputLabel>
                <Select
                  name="acNonAc"
                  value={formData.acNonAc}
                  onChange={handleChange}
                  label="AC/Non-AC"
                >
                  <MenuItem value="AC">AC</MenuItem>
                  <MenuItem value="Non-AC">Non-AC</MenuItem>
                  <MenuItem value="Both">Both</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="dormitory"
                    checked={formData.dormitory}
                    onChange={handleChange}
                    disabled={isCompleted}
                  />
                }
                label="Dormitory Available"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="numberOfRoomsInHotel"
                label="Number of Rooms in Hotel"
                type="number"
                value={formData.numberOfRoomsInHotel}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 1 }}
                disabled={isCompleted}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="roomTariff"
                label="Room Tariff"
                value={formData.roomTariff}
                onChange={handleChange}
                fullWidth
                required
                placeholder="e.g., ₹1000-2000 per night"
                disabled={isCompleted}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="breakfast"
                    checked={formData.breakfast}
                    onChange={handleChange}
                    disabled={isCompleted}
                  />
                }
                label="Breakfast Available"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="numberOfRoomsOfferedDuringAdshsra"
                label="# Offered During Ashara"
                type="number"
                value={formData.numberOfRoomsOfferedDuringAdshsra}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0 }}
                disabled={isCompleted}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="visitingCard"
                    checked={formData.visitingCard}
                    onChange={handleChange}
                    disabled={isCompleted}
                  />
                }
                label="Collected Visiting Card"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="numberOfGuests"
                label="Number of Guests Accommodate"
                type="number"
                value={formData.numberOfGuests}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0 }}
                disabled={isCompleted}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="comments"
                label="Comments"
                value={formData.comments}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                placeholder="Any additional comments or notes... (max 1000 characters)"
                inputProps={{ maxLength: 1000 }}
                disabled={isCompleted}
              />
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
