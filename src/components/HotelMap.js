import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { CircularProgress, Box, Alert } from '@mui/material';

const HotelMap = ({ hotelName }) => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            hotelName
          )}&key=AIzaSyAUDyFKtA5lLjBgxG5DoSEJtiAgEOHkLwI`
        );
        const data = await res.json();
        if (data.results?.[0]) {
          setCoords(data.results[0].geometry.location);
        } else {
          setCoords(null);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        setCoords(null);
      } finally {
        setLoading(false);
      }
    };

    if (hotelName) fetchCoordinates();
  }, [hotelName]);

  if (loading) return <CircularProgress />;
  if (!coords) return <Alert severity="warning">Unable to fetch hotel location.</Alert>;

  const containerStyle = { width: '100%', height: '250px', borderRadius: '8px' };
  const center = { lat: coords.lat, lng: coords.lng };

  return (
    <LoadScript googleMapsApiKey="YOUR_API_KEY_HERE">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
        <Marker position={center} title={hotelName} />
      </GoogleMap>
    </LoadScript>
  );
};

export default HotelMap;
