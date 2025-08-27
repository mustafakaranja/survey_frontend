import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  Button,
  Box
} from '@mui/material';

const SubmittedData = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://surveybackend-production-8dbc.up.railway.app/api/surveys');
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        const result = await response.json();

        if (result.status === 'success' && Array.isArray(result.data)) {
          const finalData = result.data.map(item => ({
            hotelName: item.hotelName,
            username: item.username
          }));
          setData(finalData);
          setFilteredData(finalData); // Initially show all data
        } else {
          setData([]);
          setFilteredData([]);
        }
      } catch (err) {
        console.error('Error fetching surveys:', err);
        setError(err.message || 'Failed to load submitted data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    const filtered = data.filter(item =>
      item.hotelName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Submitted Surveys Data
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <>
          {/* Search Input & Button */}
          <Box display="flex" justifyContent="center" gap={2} mt={2}>
            <TextField
              label="Search by Hotel Name"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
          </Box>

          {/* Table */}
          <Paper 
            elevation={3} 
            sx={{ mt: 3, maxWidth: 500, mx: 'auto' }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Hotel Name</strong></TableCell>
                  <TableCell><strong>Username</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.hotelName}</TableCell>
                      <TableCell>{item.username}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default SubmittedData;
